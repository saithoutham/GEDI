const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/gemma-4-31b-it';
const DEFAULT_OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || 'nousresearch/hermes-3-llama-3.1-405b:free';
const DEFAULT_SITE_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:5173';
const DEFAULT_SITE_NAME = 'GEDI GEAI';

function normalizeGeminiModel(model) {
  const fallback = DEFAULT_GEMINI_MODEL.replace(/^models\//, '');
  return (model || DEFAULT_GEMINI_MODEL).replace(/^models\//, '') || fallback;
}

function getGeminiKey(env = process.env) {
  return env.GEMINI_API_KEY || env.GOOGLE_API_KEY || '';
}

function getModelCandidates(env = process.env) {
  const configured = env.OPENROUTER_MODELS
    ? env.OPENROUTER_MODELS.split(',').map((model) => model.trim()).filter(Boolean)
    : [];
  const primary = env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

  return Array.from(new Set([primary, ...configured].filter(Boolean)));
}

function getOpenRouterKey(env = process.env) {
  return env.OPENROUTER_API_KEY || env.OPENROUTER_KEY || '';
}

function extractText(content) {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string') {
          return part.text;
        }

        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => ({
      role: message.role,
      content: extractText(message.content),
    }))
    .filter((message) => message.content)
    .slice(-10);
}

function buildSessionSummary(sessionContext) {
  if (!sessionContext || typeof sessionContext !== 'object') {
    return 'No current ALCSI session context is available.';
  }

  const patient = sessionContext.patient || {};
  const screenings = Array.isArray(sessionContext.selectedScreenings)
    ? sessionContext.selectedScreenings.map((screening) => ({
        category: screening.category,
        centerName: screening.centerName || null,
        centerType: screening.centerType || null,
        baseStatus: screening.baseStatus || null,
        assessmentStatus: screening.assessmentStatus || null,
      }))
    : [];

  return JSON.stringify(
    {
      workflowStage: sessionContext.workflowStage || 'Unknown',
      patient: {
        age: patient.age ?? null,
        sex: patient.sex ?? null,
        smokingHistory: patient.smokingHistory ?? null,
        packYears: patient.packYears ?? null,
      },
      selectedScreenings: screenings,
      authorizationSigned: Boolean(sessionContext.authorizationSigned),
      outreachVerified: Boolean(sessionContext.outreachVerified),
    },
    null,
    2
  );
}

function systemPrompt(sessionContext) {
  return [
    'You are GEAI, the GEDI support assistant for ALCSI staff in the United States.',
    'Your job is to answer questions about preventive screenings, referral workflow, patient communication, center coordination, follow-up, documentation, and practical next steps.',
    'Use short, simple, volunteer-friendly language.',
    'Default to 1-3 short sentences or up to 3 concise bullets.',
    'Answer directly. Do NOT include chain-of-thought, internal notes, analysis, "User said", "Context", "Goal", or planning bullets.',
    'If details are missing, say only the key missing detail(s).',
    'Do not provide diagnosis, emergency triage, legal advice, or guarantees.',
    'Do not ask for Social Security numbers, full member IDs, or unnecessary PHI.',
    'If insurance comes up, explain uncertainty clearly and mention that benefits and authorization may still need to be confirmed.',
    'If helpful, give a very short call script or checklist.',
    'Keep answers concise, practical, and action-oriented.',
    'Current ALCSI session snapshot:',
    buildSessionSummary(sessionContext),
  ].join('\n');
}

function buildGeminiContents(messages, sessionContext) {
  const systemText = systemPrompt(sessionContext);
  const normalizedMessages = messages.map((message, index) => {
    const prefix = index === 0 && message.role === 'user' ? `${systemText}\n\n` : '';

    return {
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: `${prefix}${message.content}` }],
    };
  });

  return normalizedMessages;
}

function getGeminiReplyText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
}

function getOpenRouterReplyText(data) {
  const content = data?.choices?.[0]?.message?.content;
  return extractText(content);
}

function cleanAssistantReply(reply) {
  const text = extractText(reply);
  if (!text) {
    return '';
  }

  const lines = text.split('\n').map((line) => line.trimEnd());
  const noisyPrefixPatterns = [
    /^\*+\s*User sa(?:id|ys)\s*:/i,
    /^\*+\s*Context\s*:/i,
    /^\*+\s*Goal\s*:/i,
    /^\*+\s*The user\b/i,
    /^\*+\s*The AI\b/i,
    /^\*+\s*Greeting\s*:/i,
    /^\*+\s*Value Proposition\s*:/i,
    /^\*+\s*Specific Examples\b/i,
    /^\*+\s*Role\s*:/i,
    /^\*+\s*Purpose\s*:/i,
    /^\*+\s*Guidelines\s*:/i,
    /^\*+\s*Current State\s*:/i,
    /^\*+\s*Constraint\s*:/i,
  ];

  let firstUsefulLine = 0;
  while (firstUsefulLine < lines.length) {
    const line = lines[firstUsefulLine].trim();

    if (!line) {
      firstUsefulLine += 1;
      continue;
    }

    if (noisyPrefixPatterns.some((pattern) => pattern.test(line))) {
      firstUsefulLine += 1;
      continue;
    }

    break;
  }

  const cleaned = lines.slice(firstUsefulLine).join('\n').trim();
  if (!cleaned) {
    return text;
  }

  if (cleaned.startsWith('*')) {
    const plainAnswerStart = cleaned.search(
      /(?:^|\n)(Hello[!,]?|Hi[!,]?|Sure[,.]|Yes[,.]|No[,.]|You can|I can|Please|Here(?:'s| is)|Start by)\b/i
    );

    if (plainAnswerStart >= 0) {
      return cleaned.slice(plainAnswerStart).trim();
    }

    const nonBulletLines = cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('*'));

    if (nonBulletLines.length > 0) {
      return nonBulletLines.slice(-3).join('\n').trim();
    }
  }

  return cleaned;
}

async function requestGeminiReply({ env, messages, sessionContext }) {
  const geminiKey = getGeminiKey(env);

  if (!geminiKey) {
    return {
      ok: false,
      status: 500,
      retryable: true,
      error: 'Gemini API is not configured.',
    };
  }

  const model = normalizeGeminiModel(env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          contents: buildGeminiContents(messages, sessionContext),
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 220,
          },
        }),
        signal: controller.signal,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = data?.error?.message || 'Gemini request failed.';
      return {
        ok: false,
        status: response.status,
        retryable: response.status === 429 || response.status >= 500,
        error,
      };
    }

    const reply = cleanAssistantReply(getGeminiReplyText(data));
    if (!reply) {
      return {
        ok: false,
        status: 502,
        retryable: true,
        error: 'Gemini did not return a usable response.',
      };
    }

    return {
      ok: true,
      status: 200,
      reply,
      model: `models/${model}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      retryable: true,
      error:
        error instanceof Error && error.name === 'AbortError'
          ? 'GEAI timed out while waiting for Gemini.'
          : error instanceof Error
            ? error.message
            : 'Unknown Gemini error.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestOpenRouterReply({ env, headers, messages, sessionContext }) {
  const openRouterKey = getOpenRouterKey(env);
  const modelCandidates = getModelCandidates(env);

  if (!openRouterKey) {
    return {
      ok: false,
      status: 500,
      retryable: false,
      error: 'OpenRouter API is not configured.',
    };
  }

  let sawRateLimit = false;
  let lastError = 'OpenRouter request failed.';

  for (const model of modelCandidates) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': headers.origin || DEFAULT_SITE_URL,
          'X-OpenRouter-Title': DEFAULT_SITE_NAME,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 220,
          messages: [
            {
              role: 'system',
              content: systemPrompt(sessionContext),
            },
            ...messages,
          ],
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 429) {
          sawRateLimit = true;
          lastError = `Model ${model} is currently rate-limited.`;
          continue;
        }

        return {
          ok: false,
          status: response.status,
          retryable: false,
          error: data?.error?.message || data?.error || 'OpenRouter request failed.',
        };
      }

      const reply = cleanAssistantReply(getOpenRouterReplyText(data));

      if (!reply) {
        lastError = `Model ${model} did not return a usable response.`;
        continue;
      }

      return {
        ok: true,
        status: 200,
        reply,
        model: data?.model || model,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    ok: false,
    status: sawRateLimit ? 429 : 502,
    retryable: false,
    error: sawRateLimit
      ? 'GEAI is temporarily rate-limited across the available backup models. Try again in a minute.'
      : lastError,
  };
}

export async function handleGeaiRequest(body, options = {}) {
  const env = options.env || process.env;
  const headers = options.headers || {};
  const geminiKey = getGeminiKey(env);
  const openRouterKey = getOpenRouterKey(env);

  if (!geminiKey && !openRouterKey) {
    return {
      status: 500,
      body: {
        error: 'GEAI is not configured yet. Add GEMINI_API_KEY or OPENROUTER_API_KEY to the local server environment.',
      },
    };
  }

  const messages = normalizeMessages(body?.messages);

  if (messages.length === 0 || messages[messages.length - 1]?.role !== 'user') {
    return {
      status: 400,
      body: {
        error: 'GEAI needs a user question before it can respond.',
      },
    };
  }

  const geminiResult = await requestGeminiReply({
    env,
    messages,
    sessionContext: body?.sessionContext,
  });

  if (geminiResult.ok) {
    return {
      status: geminiResult.status,
      body: {
        reply: geminiResult.reply,
        model: geminiResult.model,
      },
    };
  }

  if (!geminiResult.retryable || !openRouterKey) {
    return {
      status: geminiResult.status,
      body: {
        error: geminiResult.error,
      },
    };
  }

  const openRouterResult = await requestOpenRouterReply({
    env,
    headers,
    messages,
    sessionContext: body?.sessionContext,
  });

  if (openRouterResult.ok) {
    return {
      status: openRouterResult.status,
      body: {
        reply: openRouterResult.reply,
        model: openRouterResult.model,
      },
    };
  }

  return {
    status: openRouterResult.status,
    body: {
      error: `${geminiResult.error} Backup model also failed: ${openRouterResult.error}`,
    },
  };
}
