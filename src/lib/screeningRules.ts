export type CancerType = 'breast' | 'cervical' | 'colorectal' | 'lung' | 'prostate';

export type ScreeningStatus =
  | 'appears-eligible'
  | 'shared-decision'
  | 'individual-decision'
  | 'ask-clinician'
  | 'not-routine'
  | 'not-eligible'
  | 'info';

export type RoutineScreeningIntent = 'routine' | 'symptoms' | 'prior-cancer' | 'not-sure';
export type HighRiskHistory = 'inherited-syndrome' | 'strong-family-history' | 'no' | 'not-sure';
export type SmokingPackYears = 'yes-20-plus' | 'no' | 'not-sure-calculate';
export type SmokingStatus = 'current' | 'quit-within-15' | 'quit-more-than-15' | 'not-sure';
export type PriorScreeningAnswer = 'yes' | 'no' | 'not-sure';

export type AssessmentAnswers = {
  age?: number;
  anatomy: {
    breastScreeningApplies: boolean;
    hasCervix: boolean;
    hasProstate: boolean;
    none: boolean;
    unknown: boolean;
  };
  routineIntent?: RoutineScreeningIntent;
  highRiskHistory?: HighRiskHistory;
  lungPackYears?: SmokingPackYears;
  packsPerDay?: number;
  yearsSmoked?: number;
  smokingStatus?: SmokingStatus;
  priorCervicalScreening?: PriorScreeningAnswer;
  priorColorectalScreening?: PriorScreeningAnswer;
  hasPrimaryCare?: boolean;
  zip?: string;
};

export type ScreeningResult = {
  cancerType: CancerType;
  title: string;
  status: ScreeningStatus;
  statusLabel: string;
  explanation: string;
  nextStep: string;
  routineInfoOnly?: boolean;
};

export type AssessmentAlert = {
  id: 'symptoms-or-prior-cancer' | 'high-risk-history' | 'unknown-anatomy';
  message: string;
};

export type AssessmentEvaluation = {
  alerts: AssessmentAlert[];
  results: ScreeningResult[];
};

const statusLabels: Record<ScreeningStatus, string> = {
  'appears-eligible': 'Appears eligible',
  'shared-decision': 'Discuss with a clinician',
  'individual-decision': 'Individual decision',
  'ask-clinician': 'Ask a clinician',
  'not-routine': 'Not routinely recommended',
  'not-eligible': 'Does not appear eligible',
  info: 'Routine screening information',
};

const nextSteps: Record<ScreeningStatus, string> = {
  'appears-eligible': 'Talk with a clinician or find a screening location.',
  'shared-decision': 'Discuss benefits and harms with a clinician.',
  'individual-decision': 'Discuss benefits and harms with a clinician.',
  'ask-clinician': 'Contact a clinician for personalized guidance.',
  'not-routine': 'Review again when your age or health history changes.',
  'not-eligible': 'Review again when your age or health history changes.',
  info: 'Review again when your age or health history changes.',
};

function result(cancerType: CancerType, status: ScreeningStatus, explanation: string, routineInfoOnly = false): ScreeningResult {
  const titles: Record<CancerType, string> = {
    breast: 'Breast cancer screening',
    cervical: 'Cervical cancer screening',
    colorectal: 'Colorectal cancer screening',
    lung: 'Lung cancer screening',
    prostate: 'Prostate cancer screening',
  };
  return {
    cancerType,
    title: titles[cancerType],
    status,
    statusLabel: statusLabels[status],
    explanation,
    nextStep: routineInfoOnly ? nextSteps['ask-clinician'] : nextSteps[status],
    routineInfoOnly,
  };
}

export function calculatePackYears(packsPerDay?: number, yearsSmoked?: number) {
  if (!Number.isFinite(packsPerDay) || !Number.isFinite(yearsSmoked)) return undefined;
  return Math.round((packsPerDay ?? 0) * (yearsSmoked ?? 0) * 10) / 10;
}

export function evaluateScreening(answers: AssessmentAnswers): AssessmentEvaluation {
  const age = answers.age;
  const routineInfoOnly = answers.routineIntent !== undefined && answers.routineIntent !== 'routine';
  const alerts = buildAlerts(answers);
  const results: ScreeningResult[] = [];

  if (age === undefined) return { alerts, results };

  if (answers.anatomy.breastScreeningApplies) results.push(evaluateBreast(age, routineInfoOnly));
  if (answers.anatomy.hasCervix) results.push(evaluateCervical(age, answers.priorCervicalScreening, routineInfoOnly));
  results.push(evaluateColorectal(age, answers.priorColorectalScreening, routineInfoOnly));
  results.push(evaluateLung(age, answers, routineInfoOnly));
  if (answers.anatomy.hasProstate) results.push(evaluateProstate(age, routineInfoOnly));

  return { alerts, results };
}

function buildAlerts(answers: AssessmentAnswers): AssessmentAlert[] {
  const alerts: AssessmentAlert[] = [];
  if (answers.routineIntent && answers.routineIntent !== 'routine') {
    alerts.push({
      id: 'symptoms-or-prior-cancer',
      message:
        'Your answers suggest this may not be routine screening. Symptoms, prior cancer, or uncertainty can require diagnostic testing or a personalized follow-up plan. Please contact a clinician.',
    });
  }
  if (answers.highRiskHistory && answers.highRiskHistory !== 'no') {
    alerts.push({
      id: 'high-risk-history',
      message:
        'You may need earlier, different, or more frequent screening than routine USPSTF recommendations. Please discuss your personal and family history with a clinician.',
    });
  }
  if (answers.anatomy.unknown) {
    alerts.push({
      id: 'unknown-anatomy',
      message:
        'Some screening recommendations depend on anatomy or prior surgeries. A clinician can help confirm which screenings apply to you.',
    });
  }
  return alerts;
}

function evaluateBreast(age: number, routineInfoOnly: boolean) {
  if (age >= 40 && age <= 74) {
    return result(
      'breast',
      'appears-eligible',
      'Based on your answers, you appear to meet USPSTF criteria for routine breast cancer screening. The recommendation is a mammogram every 2 years from ages 40 to 74.',
      routineInfoOnly
    );
  }
  if (age >= 75) {
    return result(
      'breast',
      'ask-clinician',
      'USPSTF says there is not enough evidence to recommend routine screening for everyone 75 or older. Ask a clinician whether continued screening makes sense for you.',
      routineInfoOnly
    );
  }
  return result(
    'breast',
    'not-routine',
    'Routine breast cancer screening is usually not recommended yet based on age alone, unless you have higher-risk history or symptoms.',
    routineInfoOnly
  );
}

function evaluateCervical(age: number, priorScreening: PriorScreeningAnswer | undefined, routineInfoOnly: boolean) {
  if (age >= 21 && age <= 29) {
    return result(
      'cervical',
      'appears-eligible',
      'Based on your answers, you appear to meet USPSTF criteria for routine cervical cancer screening. Screening is typically done with a Pap test every 3 years.',
      routineInfoOnly
    );
  }
  if (age >= 30 && age <= 65) {
    return result(
      'cervical',
      'appears-eligible',
      'Based on your answers, you appear to meet USPSTF criteria for routine cervical cancer screening. Screening options typically include a Pap test every 3 years, high-risk HPV testing every 5 years, or Pap plus HPV cotesting every 5 years.',
      routineInfoOnly
    );
  }
  // Cervical screening after 65 depends on whether prior normal screening was adequate.
  if (age >= 66) {
    if (priorScreening === 'yes') {
      return result(
        'cervical',
        'not-routine',
        'Routine cervical cancer screening is usually not recommended after 65 when someone has had adequate prior normal screening and is not otherwise high risk.',
        routineInfoOnly
      );
    }
    return result(
      'cervical',
      'ask-clinician',
      'You may still need screening if you have not had adequate prior normal screening or are unsure of your screening history.',
      routineInfoOnly
    );
  }
  return result('cervical', 'not-routine', 'Routine cervical cancer screening usually starts at age 21.', routineInfoOnly);
}

function evaluateColorectal(age: number, priorScreening: PriorScreeningAnswer | undefined, routineInfoOnly: boolean) {
  if (age >= 45 && age <= 75) {
    return result(
      'colorectal',
      'appears-eligible',
      'Based on your age, you appear to meet USPSTF criteria for routine colorectal cancer screening.',
      routineInfoOnly
    );
  }
  // USPSTF recommends individualized colorectal screening decisions from 76 to 85.
  if (age >= 76 && age <= 85) {
    const priorContext = priorScreening === 'no' ? ' You reported that you have not been screened before.' : '';
    return result(
      'colorectal',
      'individual-decision',
      `Screening may still be appropriate, especially if you have never been screened, but USPSTF recommends an individualized decision based on health, prior screening history, and preferences.${priorContext}`,
      routineInfoOnly
    );
  }
  return result(
    'colorectal',
    'not-routine',
    'Routine colorectal cancer screening usually starts at age 45 for average-risk adults. Earlier screening may be needed for some people with symptoms, inflammatory bowel disease, certain inherited syndromes, or family history.',
    routineInfoOnly
  );
}

function evaluateLung(age: number, answers: AssessmentAnswers, routineInfoOnly: boolean) {
  if (age < 50 || age > 80) {
    return result('lung', 'not-routine', 'Routine lung cancer screening is only considered by USPSTF criteria for adults ages 50 to 80 with qualifying smoking history.', routineInfoOnly);
  }

  const packYears = answers.lungPackYears === 'yes-20-plus' ? 20 : calculatePackYears(answers.packsPerDay, answers.yearsSmoked);
  const hasTwentyPackYears = answers.lungPackYears === 'yes-20-plus' || (packYears ?? 0) >= 20;

  if (!hasTwentyPackYears) {
    return result(
      'lung',
      'not-eligible',
      'Based on your answers, you do not appear to meet the USPSTF smoking history threshold for routine lung cancer screening.',
      routineInfoOnly
    );
  }
  if (answers.smokingStatus === 'current' || answers.smokingStatus === 'quit-within-15') {
    return result(
      'lung',
      'appears-eligible',
      'Based on your answers, you appear to meet USPSTF criteria for annual lung cancer screening with low-dose CT.',
      routineInfoOnly
    );
  }
  if (answers.smokingStatus === 'quit-more-than-15') {
    return result(
      'lung',
      'not-eligible',
      'USPSTF recommends lung cancer screening for people who currently smoke or quit within the past 15 years.',
      routineInfoOnly
    );
  }
  return result(
    'lung',
    'ask-clinician',
    'Your smoking history may affect whether lung cancer screening is recommended. A clinician can help confirm eligibility.',
    routineInfoOnly
  );
}

function evaluateProstate(age: number, routineInfoOnly: boolean) {
  // Prostate screening is preference-sensitive under USPSTF, never automatic eligibility.
  if (age >= 55 && age <= 69) {
    return result(
      'prostate',
      'shared-decision',
      'Based on your answers, you are in the age range where USPSTF recommends discussing PSA-based prostate cancer screening with a clinician. This is not an automatic screening recommendation.',
      routineInfoOnly
    );
  }
  if (age >= 70) {
    return result(
      'prostate',
      'not-routine',
      'USPSTF recommends against routine PSA-based prostate cancer screening at age 70 or older.',
      routineInfoOnly
    );
  }
  return result(
    'prostate',
    'not-routine',
    'Routine PSA-based prostate cancer screening is generally not recommended before age 55 for average-risk people. Ask a clinician if you have symptoms or higher-risk history.',
    routineInfoOnly
  );
}
