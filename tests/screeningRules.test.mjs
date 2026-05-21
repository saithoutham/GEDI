import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/screeningRules.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    verbatimModuleSyntax: true,
  },
}).outputText;

await mkdir(new URL('../node_modules/.tmp/', import.meta.url), { recursive: true });
const outputUrl = new URL('../node_modules/.tmp/screeningRules.test-build.mjs', import.meta.url);
await writeFile(outputUrl, compiled);

const { evaluateScreening } = await import(`${pathToFileURL(outputUrl.pathname).href}?v=${Date.now()}`);

function base(overrides = {}) {
  return {
    age: 45,
    anatomy: {
      breastScreeningApplies: false,
      hasCervix: false,
      hasProstate: false,
      none: true,
      unknown: false,
    },
    routineIntent: 'routine',
    highRiskHistory: 'no',
    ...overrides,
  };
}

function resultFor(answers, cancerType) {
  return evaluateScreening(answers).results.find((item) => item.cancerType === cancerType);
}

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('breast eligible at age 40 to 74', () => {
  const result = resultFor(base({ age: 40, anatomy: { breastScreeningApplies: true, hasCervix: false, hasProstate: false, none: false, unknown: false } }), 'breast');
  assert.equal(result.status, 'appears-eligible');
});

test('breast not routine at 75+', () => {
  const result = resultFor(base({ age: 75, anatomy: { breastScreeningApplies: true, hasCervix: false, hasProstate: false, none: false, unknown: false } }), 'breast');
  assert.equal(result.status, 'ask-clinician');
});

test('cervical eligible at 21 to 65 with cervix', () => {
  const result = resultFor(base({ age: 21, anatomy: { breastScreeningApplies: false, hasCervix: true, hasProstate: false, none: false, unknown: false } }), 'cervical');
  assert.equal(result.status, 'appears-eligible');
});

test('cervical 66+ depends on prior screening answer', () => {
  const withPrior = resultFor(base({ age: 66, anatomy: { breastScreeningApplies: false, hasCervix: true, hasProstate: false, none: false, unknown: false }, priorCervicalScreening: 'yes' }), 'cervical');
  const withoutPrior = resultFor(base({ age: 66, anatomy: { breastScreeningApplies: false, hasCervix: true, hasProstate: false, none: false, unknown: false }, priorCervicalScreening: 'not-sure' }), 'cervical');
  assert.equal(withPrior.status, 'not-routine');
  assert.equal(withoutPrior.status, 'ask-clinician');
});

test('colorectal eligible at 45 to 75', () => {
  const result = resultFor(base({ age: 45 }), 'colorectal');
  assert.equal(result.status, 'appears-eligible');
});

test('colorectal 76 to 85 is individualized', () => {
  const result = resultFor(base({ age: 76, priorColorectalScreening: 'yes' }), 'colorectal');
  assert.equal(result.status, 'individual-decision');
});

test('lung eligible at 50 to 80, 20+ pack-years, current smoker', () => {
  const result = resultFor(base({ age: 50, lungPackYears: 'yes-20-plus', smokingStatus: 'current' }), 'lung');
  assert.equal(result.status, 'appears-eligible');
});

test('lung eligible at 50 to 80, 20+ pack-years, quit within 15 years', () => {
  const result = resultFor(base({ age: 80, lungPackYears: 'yes-20-plus', smokingStatus: 'quit-within-15' }), 'lung');
  assert.equal(result.status, 'appears-eligible');
});

test('lung not eligible if quit more than 15 years ago', () => {
  const result = resultFor(base({ age: 60, lungPackYears: 'yes-20-plus', smokingStatus: 'quit-more-than-15' }), 'lung');
  assert.equal(result.status, 'not-eligible');
});

test('prostate 55 to 69 is shared decision', () => {
  const result = resultFor(base({ age: 55, anatomy: { breastScreeningApplies: false, hasCervix: false, hasProstate: true, none: false, unknown: false } }), 'prostate');
  assert.equal(result.status, 'shared-decision');
});

test('prostate 70+ is not routinely recommended', () => {
  const result = resultFor(base({ age: 70, anatomy: { breastScreeningApplies: false, hasCervix: false, hasProstate: true, none: false, unknown: false } }), 'prostate');
  assert.equal(result.status, 'not-routine');
});

test('symptoms or prior cancer triggers clinician alert', () => {
  const symptoms = evaluateScreening(base({ routineIntent: 'symptoms' }));
  const priorCancer = evaluateScreening(base({ routineIntent: 'prior-cancer' }));
  assert.equal(symptoms.alerts.some((alert) => alert.id === 'symptoms-or-prior-cancer'), true);
  assert.equal(priorCancer.alerts.some((alert) => alert.id === 'symptoms-or-prior-cancer'), true);
});

test('high-risk history triggers clinician alert', () => {
  const evaluation = evaluateScreening(base({ highRiskHistory: 'inherited-syndrome' }));
  assert.equal(evaluation.alerts.some((alert) => alert.id === 'high-risk-history'), true);
});

test('unknown anatomy does not break the quiz', () => {
  const evaluation = evaluateScreening(base({ anatomy: { breastScreeningApplies: false, hasCervix: false, hasProstate: false, none: false, unknown: true } }));
  assert.equal(evaluation.alerts.some((alert) => alert.id === 'unknown-anatomy'), true);
  assert.ok(resultFor(base({ anatomy: { breastScreeningApplies: false, hasCervix: false, hasProstate: false, none: false, unknown: true } }), 'colorectal'));
});
