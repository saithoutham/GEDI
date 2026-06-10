export type CancerType = 'breast' | 'cervical' | 'colorectal' | 'lung' | 'prostate' | 'liver' | 'skin' | 'oral-hpv';

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
export type SmokingStatus = 'current' | 'former' | 'never' | 'not-sure' | 'quit-within-15' | 'quit-more-than-15';
export type PriorScreeningAnswer = 'yes' | 'no' | 'not-sure';
export type SexAssignedAtBirth = 'female' | 'male' | 'intersex' | 'prefer-not';
export type RaceOption =
  | 'white'
  | 'black'
  | 'asian'
  | 'american-indian-alaska-native'
  | 'native-hawaiian-pacific-islander'
  | 'other'
  | 'unknown';

export type AssessmentAnswers = {
  contactConsent?: boolean;
  participantName?: string;
  phoneNumber?: string;
  age?: number;
  sexAssignedAtBirth?: SexAssignedAtBirth;
  race: RaceOption[];
  raceOther?: string;
  anatomy: {
    breastScreeningApplies: boolean;
    hasCervix: boolean;
    hasProstate: boolean;
    none: boolean;
    unknown: boolean;
  };
  routineIntent?: RoutineScreeningIntent;
  highRiskHistory?: HighRiskHistory;
  smokingStatus?: SmokingStatus;
  packsPerDay?: number;
  yearsSmoked?: number;
  quitYearsAgo?: number;
  lungPackYears?: SmokingPackYears;
  priorCervicalScreening?: PriorScreeningAnswer;
  priorColorectalScreening?: PriorScreeningAnswer;
  hasPrimaryCare?: boolean;
  zip?: string;
  breastRisk: {
    personalHistoryOrHighRiskLesion: boolean;
    geneticMutation: boolean;
    chestRadiationYoung: boolean;
    denseBreasts: boolean;
    firstDegreeRelativeEarly: boolean;
  };
  cervicalRisk: {
    priorHighGradeLesionOrCancer: boolean;
    immunocompromised: boolean;
    desExposure: boolean;
    cervixRemoved: boolean;
    adequatePriorScreening: boolean;
  };
  colorectalRisk: {
    personalHistory: boolean;
    inflammatoryBowelDisease: boolean;
    familyEarly: boolean;
    familyMultiple: boolean;
    geneticSyndrome: boolean;
  };
  lungRisk: {
    symptoms: boolean;
    healthLimitsCurativeTreatment: boolean;
    copdOrPulmonaryFibrosis: boolean;
    occupationalExposure: boolean;
    otherSmokingRelatedCancer: boolean;
  };
  prostateRisk: {
    familyEarly: boolean;
    familyMultiple: boolean;
    brcaMutation: boolean;
    africanAncestry: boolean;
    priorHighRiskBiopsy: boolean;
  };
  liverRisk: {
    cirrhosis: boolean;
    hepatitisB: boolean;
    hepatitisC: boolean;
    hemochromatosis: boolean;
  };
  skinRisk: {
    changingLesion: boolean;
    personalHistory: boolean;
    immunosuppressed: boolean;
    manyAtypicalMoles: boolean;
    highUvExposure: boolean;
  };
  oralRisk: {
    persistentSymptoms: boolean;
    tobaccoOrHeavyAlcohol: boolean;
    hpvRelatedHistory: boolean;
  };
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
  id: 'symptoms-or-prior-cancer' | 'high-risk-history' | 'unknown-anatomy' | 'diagnostic-symptoms';
  message: string;
};

export type AssessmentEvaluation = {
  alerts: AssessmentAlert[];
  results: ScreeningResult[];
};

export const emptyRiskAnswers = {
  breastRisk: {
    personalHistoryOrHighRiskLesion: false,
    geneticMutation: false,
    chestRadiationYoung: false,
    denseBreasts: false,
    firstDegreeRelativeEarly: false,
  },
  cervicalRisk: {
    priorHighGradeLesionOrCancer: false,
    immunocompromised: false,
    desExposure: false,
    cervixRemoved: false,
    adequatePriorScreening: false,
  },
  colorectalRisk: {
    personalHistory: false,
    inflammatoryBowelDisease: false,
    familyEarly: false,
    familyMultiple: false,
    geneticSyndrome: false,
  },
  lungRisk: {
    symptoms: false,
    healthLimitsCurativeTreatment: false,
    copdOrPulmonaryFibrosis: false,
    occupationalExposure: false,
    otherSmokingRelatedCancer: false,
  },
  prostateRisk: {
    familyEarly: false,
    familyMultiple: false,
    brcaMutation: false,
    africanAncestry: false,
    priorHighRiskBiopsy: false,
  },
  liverRisk: {
    cirrhosis: false,
    hepatitisB: false,
    hepatitisC: false,
    hemochromatosis: false,
  },
  skinRisk: {
    changingLesion: false,
    personalHistory: false,
    immunosuppressed: false,
    manyAtypicalMoles: false,
    highUvExposure: false,
  },
  oralRisk: {
    persistentSymptoms: false,
    tobaccoOrHeavyAlcohol: false,
    hpvRelatedHistory: false,
  },
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
  'appears-eligible': 'Review this result with a licensed clinician before scheduling screening',
  'shared-decision': 'Discuss benefits, limits, and harms with a licensed clinician',
  'individual-decision': 'Discuss overall health, prior screening history, and preferences with a licensed clinician',
  'ask-clinician': 'Contact a licensed clinician for personalized guidance',
  'not-routine': 'Review again when age, symptoms, or health history changes',
  'not-eligible': 'Review again when age, smoking history, or health history changes',
  info: 'Use this as education and ask a clinician if you have symptoms or risk factors',
};

function result(cancerType: CancerType, status: ScreeningStatus, explanation: string, routineInfoOnly = false): ScreeningResult {
  const titles: Record<CancerType, string> = {
    breast: 'Breast cancer screening',
    cervical: 'Cervical cancer screening',
    colorectal: 'Colorectal cancer screening',
    lung: 'Lung cancer screening',
    prostate: 'Prostate cancer screening',
    liver: 'Liver cancer surveillance',
    skin: 'Skin cancer exam',
    'oral-hpv': 'Oral/HPV-related cancer review',
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

  if (breastApplies(answers)) results.push(evaluateBreast(age, answers, routineInfoOnly));
  if (cervicalApplies(answers)) results.push(evaluateCervical(age, answers, routineInfoOnly));
  results.push(evaluateColorectal(age, answers, routineInfoOnly));
  results.push(evaluateLung(age, answers, routineInfoOnly));
  if (prostateApplies(answers)) results.push(evaluateProstate(age, answers, routineInfoOnly));

  return { alerts, results };
}

function breastApplies(answers: AssessmentAnswers) {
  return answers.anatomy.breastScreeningApplies || answers.sexAssignedAtBirth === 'female' || Object.values(answers.breastRisk).some(Boolean);
}

function cervicalApplies(answers: AssessmentAnswers) {
  return answers.anatomy.hasCervix || answers.sexAssignedAtBirth === 'female' || Object.values(answers.cervicalRisk).some(Boolean);
}

function prostateApplies(answers: AssessmentAnswers) {
  return answers.anatomy.hasProstate || answers.sexAssignedAtBirth === 'male' || Object.values(answers.prostateRisk).some(Boolean);
}

function buildAlerts(answers: AssessmentAnswers): AssessmentAlert[] {
  const alerts: AssessmentAlert[] = [];
  if (answers.routineIntent && answers.routineIntent !== 'routine') {
    alerts.push({
      id: 'symptoms-or-prior-cancer',
      message:
        'This may not be routine screening Symptoms, prior cancer, or uncertainty can require diagnostic testing or a personalized follow-up plan',
    });
  }
  if (answers.lungRisk.symptoms || answers.skinRisk.changingLesion || answers.oralRisk.persistentSymptoms) {
    alerts.push({
      id: 'diagnostic-symptoms',
      message:
        'You selected symptom-related answers Screening rules are not a substitute for diagnostic care; please contact a clinician',
    });
  }
  if (answers.highRiskHistory && answers.highRiskHistory !== 'no') {
    alerts.push({
      id: 'high-risk-history',
      message:
        'Inherited syndromes or strong family history may require earlier, different, or more frequent screening than routine recommendations',
    });
  }
  if (answers.anatomy.unknown || answers.sexAssignedAtBirth === 'prefer-not') {
    alerts.push({
      id: 'unknown-anatomy',
      message:
        'Some screening recommendations depend on information not provided here A clinician can help confirm which screenings apply',
    });
  }
  return alerts;
}

function evaluateBreast(age: number, answers: AssessmentAnswers, routineInfoOnly: boolean) {
  const elevatedRisk =
    answers.breastRisk.personalHistoryOrHighRiskLesion ||
    answers.breastRisk.geneticMutation ||
    answers.breastRisk.chestRadiationYoung ||
    answers.breastRisk.firstDegreeRelativeEarly;

  if (elevatedRisk) {
    return result(
      'breast',
      'ask-clinician',
      'Your breast cancer answers suggest that average-risk mammography rules may not be enough You may need earlier or different screening, such as genetic-risk assessment or breast specialist guidance',
      routineInfoOnly
    );
  }
  if (age >= 40 && age <= 74) {
    return result(
      'breast',
      'appears-eligible',
      'Based on your answers, you appear to meet USPSTF criteria for routine breast cancer screening The recommendation is a mammogram every 2 years from ages 40 to 74',
      routineInfoOnly
    );
  }
  if (age >= 75) {
    return result(
      'breast',
      'ask-clinician',
      'USPSTF says there is not enough evidence to recommend routine screening for everyone 75 or older Ask a clinician whether continued screening makes sense for you',
      routineInfoOnly
    );
  }
  if (answers.breastRisk.denseBreasts) {
    return result('breast', 'ask-clinician', 'Dense breasts can affect mammography follow-up decisions Ask a clinician what screening plan fits your risk', routineInfoOnly);
  }
  return result('breast', 'not-routine', 'Routine breast cancer screening is usually not recommended yet based on age alone for average-risk people', routineInfoOnly);
}

function evaluateCervical(age: number, answers: AssessmentAnswers, routineInfoOnly: boolean) {
  if (answers.cervicalRisk.cervixRemoved && !answers.cervicalRisk.priorHighGradeLesionOrCancer) {
    return result('cervical', 'not-routine', 'Routine cervical cancer screening is usually not recommended after the cervix has been removed for non-cancer reasons', routineInfoOnly);
  }
  if (answers.cervicalRisk.priorHighGradeLesionOrCancer || answers.cervicalRisk.immunocompromised || answers.cervicalRisk.desExposure) {
    return result(
      'cervical',
      'ask-clinician',
      'Your cervical cancer answers suggest a higher-risk or special-population pathway Routine age-based screening intervals may not apply',
      routineInfoOnly
    );
  }
  if (age >= 21 && age <= 29) {
    return result('cervical', 'appears-eligible', 'Based on your answers, you appear to meet USPSTF criteria for cervical cancer screening with a Pap test every 3 years', routineInfoOnly);
  }
  if (age >= 30 && age <= 65) {
    return result(
      'cervical',
      'appears-eligible',
      'Based on your answers, you appear to meet USPSTF criteria for cervical cancer screening Options include Pap testing every 3 years, high-risk HPV testing every 5 years, or cotesting every 5 years',
      routineInfoOnly
    );
  }
  if (age >= 66) {
    if (answers.cervicalRisk.adequatePriorScreening || answers.priorCervicalScreening === 'yes') {
      return result('cervical', 'not-routine', 'Routine cervical cancer screening is usually not recommended after 65 when prior screening has been adequate and risk is not high', routineInfoOnly);
    }
    return result('cervical', 'ask-clinician', 'You may still need cervical screening if prior screening was not adequate or you are unsure of your screening history', routineInfoOnly);
  }
  return result('cervical', 'not-routine', 'Routine cervical cancer screening usually starts at age 21', routineInfoOnly);
}

function evaluateColorectal(age: number, answers: AssessmentAnswers, routineInfoOnly: boolean) {
  if (
    answers.colorectalRisk.personalHistory ||
    answers.colorectalRisk.inflammatoryBowelDisease ||
    answers.colorectalRisk.familyEarly ||
    answers.colorectalRisk.familyMultiple ||
    answers.colorectalRisk.geneticSyndrome
  ) {
    return result(
      'colorectal',
      'ask-clinician',
      'Your colorectal cancer answers suggest you may need a high-risk screening pathway rather than average-risk screening intervals',
      routineInfoOnly
    );
  }
  if (age >= 45 && age <= 75) {
    return result('colorectal', 'appears-eligible', 'Based on your age, you appear to meet USPSTF criteria for routine colorectal cancer screening', routineInfoOnly);
  }
  if (age >= 76 && age <= 85) {
    const neverScreened = answers.priorColorectalScreening === 'no';
    return result(
      'colorectal',
      'individual-decision',
      `Screening may still be appropriate, but USPSTF recommends an individualized decision based on health, prior screening history, and preferences${neverScreened ? ' You reported that you have not been screened before' : ''}`,
      routineInfoOnly
    );
  }
  return result('colorectal', 'not-routine', 'Routine colorectal cancer screening usually starts at age 45 for average-risk adults and is usually stopped after age 85', routineInfoOnly);
}

function evaluateLung(age: number, answers: AssessmentAnswers, routineInfoOnly: boolean) {
  if (answers.lungRisk.symptoms) {
    return result('lung', 'ask-clinician', 'Symptoms such as coughing blood, unexplained weight loss, or a new/worsening cough need diagnostic evaluation rather than routine screening', routineInfoOnly);
  }
  if (answers.lungRisk.healthLimitsCurativeTreatment) {
    return result('lung', 'not-routine', 'USPSTF recommends stopping or avoiding screening when a health problem substantially limits life expectancy or ability/willingness to have curative lung surgery', routineInfoOnly);
  }
  if (age < 50 || age > 80) {
    return result('lung', 'not-routine', 'Routine lung cancer screening is considered by USPSTF criteria for adults ages 50 to 80 with qualifying smoking history', routineInfoOnly);
  }

  const packYears = answers.lungPackYears === 'yes-20-plus' ? 20 : calculatePackYears(answers.packsPerDay, answers.yearsSmoked);
  const hasTwentyPackYears = answers.lungPackYears === 'yes-20-plus' || (packYears ?? 0) >= 20;
  if (!hasTwentyPackYears) {
    const hasAddedRisk = answers.lungRisk.copdOrPulmonaryFibrosis || answers.lungRisk.occupationalExposure || answers.lungRisk.otherSmokingRelatedCancer;
    return result(
      'lung',
      hasAddedRisk ? 'ask-clinician' : 'not-eligible',
      hasAddedRisk
        ? 'You do not appear to meet the USPSTF pack-year threshold, but you selected other lung cancer risk factors Ask a clinician how those affect your care'
        : 'Based on your answers, you do not appear to meet the USPSTF smoking history threshold for routine lung cancer screening',
      routineInfoOnly
    );
  }

  const quitYears = answers.smokingStatus === 'quit-within-15' ? 10 : answers.smokingStatus === 'quit-more-than-15' ? 16 : answers.quitYearsAgo;
  const currentOrRecent = answers.smokingStatus === 'current' || (answers.smokingStatus === 'former' && (quitYears ?? 999) <= 15) || answers.smokingStatus === 'quit-within-15';
  if (currentOrRecent) {
    return result('lung', 'appears-eligible', 'Based on your answers, you appear to meet USPSTF criteria for annual lung cancer screening with low-dose CT', routineInfoOnly);
  }
  if (answers.smokingStatus === 'never') {
    return result('lung', 'not-eligible', 'USPSTF routine lung cancer screening criteria are based on age and smoking history', routineInfoOnly);
  }
  if (answers.smokingStatus === 'quit-more-than-15' || (answers.smokingStatus === 'former' && (quitYears ?? 0) > 15)) {
    return result('lung', 'not-eligible', 'USPSTF recommends lung cancer screening for people who currently smoke or quit within the past 15 years', routineInfoOnly);
  }
  return result('lung', 'ask-clinician', 'Your smoking history may affect whether lung cancer screening is recommended A clinician can help confirm eligibility', routineInfoOnly);
}

function evaluateProstate(age: number, answers: AssessmentAnswers, routineInfoOnly: boolean) {
  const highRisk = answers.prostateRisk.familyEarly || answers.prostateRisk.familyMultiple || answers.prostateRisk.brcaMutation || answers.prostateRisk.africanAncestry || answers.prostateRisk.priorHighRiskBiopsy;
  if (age >= 55 && age <= 69) {
    return result(
      'prostate',
      'shared-decision',
      `Based on your answers, you are in the age range where USPSTF recommends discussing PSA-based prostate cancer screening with a clinician${highRisk ? ' Your risk answers make that conversation more important' : ''}`,
      routineInfoOnly
    );
  }
  if (age >= 70) {
    return result('prostate', 'not-routine', 'USPSTF recommends against routine PSA-based prostate cancer screening at age 70 or older', routineInfoOnly);
  }
  if (highRisk && age >= 40) {
    return result('prostate', 'ask-clinician', 'Your prostate cancer risk answers may support an earlier clinician conversation about PSA testing than average-risk age ranges', routineInfoOnly);
  }
  return result('prostate', 'not-routine', 'Routine PSA-based prostate cancer screening is generally not recommended before age 55 for average-risk people', routineInfoOnly);
}
