export type CancerType =
  | 'lung'
  | 'breast'
  | 'cervical'
  | 'colorectal'
  | 'prostate'
  | 'liver'
  | 'skin'
  | 'oral-hpv';

export type RecStatus = 'eligible' | 'discuss' | 'info';

export type AgeBracket = '18-24' | '25-39' | '40-44' | '45-49' | '50-54' | '55-64' | '65-79' | '80+';
export type FamilyCancer = CancerType | 'ovarian' | 'other';

export type Answers = {
  ageBracket: AgeBracket;
  familyHistory: {
    any: boolean;
    cancers: FamilyCancer[];
  };
  sexAtBirth: 'female' | 'male' | 'intersex' | 'prefer-not';
  organs: Array<'breasts' | 'cervix' | 'prostate'>;
  smoked100Plus: boolean;
  currentlySmokes?: boolean;
  packsPerDay?: number;
  yearsSmoked?: number;
  packYears?: number;
  quitYearsAgo?: number;
  exposureRisks: boolean;
  hasPCP: boolean;
  additionalInterest: CancerType[];
  zip?: string;
};

export type ScreeningRec = {
  cancerType: CancerType;
  status: RecStatus;
  title: string;
  test: string;
  summary: string;
  rationale: string;
  caveats?: string;
  sourceUrl: string;
};

export type Plan = {
  recommendations: ScreeningRec[];
  notes: string[];
};

export type Screening = {
  id: CancerType;
  name: string;
  shortName: string;
  test: string;
  ageRange: string;
  source: string;
  sourceUrl: string;
  description: string;
  detail: string;
  comingSoon?: boolean;
};

export const cancerTypes: CancerType[] = [
  'lung',
  'breast',
  'cervical',
  'colorectal',
  'prostate',
  'liver',
  'skin',
  'oral-hpv',
];

export const screenings: Record<CancerType, Screening> = {
  lung: {
    id: 'lung',
    name: 'Lung cancer',
    shortName: 'Lung',
    test: 'Low-dose CT (LDCT)',
    ageRange: '50-80 with qualifying smoking history',
    source: 'USPSTF 2021',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening',
    description: 'A low-dose CT scan can find lung cancers before symptoms appear.',
    detail:
      'LDCT is a quick imaging test. Current USPSTF criteria use age, pack-years, and years since quitting; GEDI also flags where published Yang Lab work shows those criteria can miss people.',
  },
  breast: {
    id: 'breast',
    name: 'Breast cancer',
    shortName: 'Breast',
    test: 'Mammogram',
    ageRange: '40+ depending on risk and preference',
    source: 'ACS screening guideline',
    sourceUrl: 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection.html',
    description: 'A mammogram is a low-dose X-ray that can find tumors before they are large enough to feel.',
    detail:
      'ACS guidance supports optional screening at 40-44, annual screening from 45-54, and continued screening every 1-2 years after 55 when life expectancy supports it.',
  },
  cervical: {
    id: 'cervical',
    name: 'Cervical cancer',
    shortName: 'Cervical',
    test: 'Primary HPV test or Pap/HPV testing',
    ageRange: '25-65 with a cervix',
    source: 'ACS screening guideline',
    sourceUrl: 'https://www.cancer.org/cancer/types/cervical-cancer/detection-diagnosis-staging/cervical-cancer-screening-guidelines.html',
    description: 'HPV and Pap testing can find cervical cancer early or prevent it by finding precancerous changes.',
    detail:
      'GEDI uses organ presence, not gender identity, when deciding whether cervical screening information should appear.',
  },
  colorectal: {
    id: 'colorectal',
    name: 'Colorectal cancer',
    shortName: 'Colorectal',
    test: 'Stool-based test or colonoscopy',
    ageRange: '45+ for average risk',
    source: 'USPSTF 2021',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
    description: 'Stool tests and colonoscopy can find colorectal cancer early; colonoscopy can also remove some precancerous polyps.',
    detail:
      'Average-risk adults start at 45. People with a first-degree relative diagnosed young should talk with a clinician about starting earlier.',
  },
  prostate: {
    id: 'prostate',
    name: 'Prostate cancer',
    shortName: 'Prostate',
    test: 'PSA blood test discussion',
    ageRange: '50+ or 45+ with family history',
    source: 'ACS and USPSTF shared decision-making',
    sourceUrl: 'https://www.cancer.org/cancer/types/prostate-cancer/detection-diagnosis-staging/acs-recommendations.html',
    description: 'A PSA blood test can help detect prostate cancer, but the decision should include benefits and harms.',
    detail:
      'GEDI treats PSA as a discussion, not an automatic order. Family history moves that conversation earlier.',
  },
  liver: {
    id: 'liver',
    name: 'Liver cancer',
    shortName: 'Liver',
    test: 'Ultrasound and AFP for high-risk groups',
    ageRange: 'Risk-based',
    source: 'Risk-based informational screening',
    sourceUrl: 'https://www.cancer.org/cancer/types/liver-cancer/detection-diagnosis-staging/detection.html',
    description: 'Liver screening is risk-based, usually for people with cirrhosis or chronic hepatitis B.',
    detail: 'GEDI currently presents liver screening as informational until risk questions are expanded.',
    comingSoon: true,
  },
  skin: {
    id: 'skin',
    name: 'Skin cancer',
    shortName: 'Skin',
    test: 'Skin exam',
    ageRange: 'Risk-based',
    source: 'Risk-based informational screening',
    sourceUrl: 'https://www.cancer.org/cancer/types/skin-cancer.html',
    description: 'Skin exams are usually driven by personal risk factors, concerning spots, or clinician judgment.',
    detail: 'GEDI currently presents skin screening as informational until risk questions are expanded.',
    comingSoon: true,
  },
  'oral-hpv': {
    id: 'oral-hpv',
    name: 'HPV-related oropharyngeal cancer',
    shortName: 'Oral/HPV',
    test: 'Risk counseling and symptom review',
    ageRange: 'Risk-based',
    source: 'Risk-based informational screening',
    sourceUrl: 'https://www.cancer.org/cancer/types/oral-cavity-and-oropharyngeal-cancer.html',
    description: 'There is no routine population screening test; GEDI can help users understand risk and symptoms.',
    detail: 'GEDI currently presents HPV-related oropharyngeal cancer as informational.',
    comingSoon: true,
  },
};

export const statusLabels: Record<RecStatus, string> = {
  eligible: 'Eligible',
  discuss: 'Discuss with a doctor',
  info: 'For your information',
};

export const statusClasses: Record<RecStatus, string> = {
  eligible: 'bg-[var(--color-eligible)] text-[var(--color-eligible-ink)]',
  discuss: 'bg-[var(--color-discuss)] text-[var(--color-discuss-ink)]',
  info: 'bg-[var(--color-brand-sky)] text-[var(--color-brand-navy)]',
};

export function ageFromBracket(bracket: AgeBracket): number {
  const ages: Record<AgeBracket, number> = {
    '18-24': 21,
    '25-39': 30,
    '40-44': 42,
    '45-49': 47,
    '50-54': 52,
    '55-64': 60,
    '65-79': 70,
    '80+': 81,
  };
  return ages[bracket];
}

function hasOrgan(answers: Answers, organ: 'breasts' | 'cervix' | 'prostate') {
  if (answers.organs.includes(organ)) return true;
  if (organ === 'breasts' && answers.sexAtBirth === 'female') return true;
  if (organ === 'cervix' && answers.sexAtBirth === 'female') return true;
  if (organ === 'prostate' && answers.sexAtBirth === 'male') return true;
  return false;
}

function rec(cancerType: CancerType, status: RecStatus, rationale: string, caveats?: string): ScreeningRec {
  const item = screenings[cancerType];
  return {
    cancerType,
    status,
    title: item.name,
    test: item.test,
    summary: item.description,
    rationale,
    caveats,
    sourceUrl: item.sourceUrl,
  };
}

export function derivePlan(answers: Answers): Plan {
  const age = ageFromBracket(answers.ageBracket);
  const recommendations = new Map<CancerType, ScreeningRec>();
  const notes: string[] = [
    'Recommendations are informational and follow ACS and USPSTF guidance where GEDI has enough information.',
  ];
  const quitYears = answers.currentlySmokes ? 0 : answers.quitYearsAgo ?? 999;
  const packYears = answers.packYears ?? ((answers.packsPerDay ?? 0) * (answers.yearsSmoked ?? 0));
  const currentOrRecentSmoking = answers.currentlySmokes === true || quitYears < 15;

  if (age >= 50 && age <= 79 && answers.smoked100Plus && packYears >= 20 && currentOrRecentSmoking) {
    recommendations.set(
      'lung',
      rec(
        'lung',
        'eligible',
        'USPSTF 2021 recommends annual LDCT lung cancer screening for adults 50-80 with at least 20 pack-years who currently smoke or quit within the past 15 years.',
        'Yang Lab research has shown pack-year history is an inadequate and biased eligibility measure; GEDI keeps the guideline rule but surfaces the limitation.'
      )
    );
  } else if (age >= 50 && age <= 79 && answers.smoked100Plus) {
    recommendations.set(
      'lung',
      rec(
        'lung',
        'info',
        'You reported smoking history in the age range where lung screening is often discussed, but your answers may not meet the strict USPSTF pack-year or quit-year threshold.',
        'Potter et al., Journal of Clinical Oncology 2024, PMID 38537159, found pack-years can under-screen some groups. Bring this up with a clinician if you have concerns.'
      )
    );
  }

  if (answers.familyHistory.cancers.includes('lung') || (age >= 50 && answers.exposureRisks)) {
    recommendations.set(
      'lung',
      rec(
        'lung',
        'discuss',
        'Family history of lung cancer or significant radon, asbestos, or secondhand-smoke exposure is worth discussing even when current screening rules are narrower.',
        'Current USPSTF criteria may still require smoking-history thresholds for insurance coverage.'
      )
    );
  }

  if (hasOrgan(answers, 'breasts')) {
    if (age >= 45) {
      recommendations.set(
        'breast',
        rec(
          'breast',
          'eligible',
          age < 55
            ? 'ACS guidance recommends annual mammography for ages 45-54.'
            : 'ACS guidance recommends continued mammography every 1-2 years for adults 55+ while overall health supports screening.'
        )
      );
    } else if (age >= 40) {
      recommendations.set(
        'breast',
        rec('breast', 'discuss', 'ACS guidance says people ages 40-44 should have the option to start annual mammography.')
      );
    }
    if (answers.familyHistory.cancers.includes('breast') || answers.familyHistory.cancers.includes('ovarian')) {
      recommendations.set(
        'breast',
        rec(
          'breast',
          'discuss',
          'Family history of breast or ovarian cancer can change the age to start screening and may warrant genetic-risk counseling.',
          'GEDI does not calculate hereditary cancer risk. Ask about BRCA-related risk assessment.'
        )
      );
    }
  }

  if (hasOrgan(answers, 'cervix')) {
    if (age >= 25 && age <= 65) {
      recommendations.set(
        'cervical',
        rec('cervical', 'eligible', 'ACS guidance recommends primary HPV testing every 5 years from ages 25-65 when available.')
      );
    } else if (age > 65) {
      recommendations.set(
        'cervical',
        rec('cervical', 'discuss', 'Most people stop cervical screening after 65 only if they have had adequate prior normal testing.')
      );
    }
  }

  if (age >= 45) {
    recommendations.set(
      'colorectal',
      rec('colorectal', 'eligible', 'USPSTF 2021 recommends colorectal cancer screening for adults ages 45-75.')
    );
  } else if (answers.familyHistory.cancers.includes('colorectal')) {
    recommendations.set(
      'colorectal',
      rec(
        'colorectal',
        'discuss',
        'A first-degree family history of colorectal cancer can mean colonoscopy should start before 45, especially if the relative was diagnosed before 60.'
      )
    );
  }

  if (hasOrgan(answers, 'prostate')) {
    if (age >= 50 || (age >= 45 && answers.familyHistory.cancers.includes('prostate'))) {
      recommendations.set(
        'prostate',
        rec(
          'prostate',
          'discuss',
          'ACS recommends discussing PSA screening at 50 for average-risk people with a prostate, and earlier for higher-risk groups including family history.'
        )
      );
    }
  }

  answers.additionalInterest.forEach((type) => {
    if (!recommendations.has(type)) {
      recommendations.set(
        type,
        rec(type, 'info', `${screenings[type].name} was added because you asked to see information even if GEDI cannot determine formal eligibility yet.`)
      );
    }
  });

  if (!answers.hasPCP) {
    notes.push('You said you do not have a regular primary care clinician. GEDI prioritizes locator and call-script steps that help you start there.');
  }

  return { recommendations: [...recommendations.values()], notes };
}

export const papers = [
  {
    title: 'Pack-Year Smoking History: An Inadequate and Biased Measure to Determine Lung Cancer Screening Eligibility.',
    authors: 'Potter AL, Xu N, Senthil P, Srinivasan D, Lee H, Gazelle GS, et al.',
    journal: 'Journal of Clinical Oncology',
    year: 2024,
    pmid: '38537159',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38537159/',
    relevance: 'Explains why GEDI flags limitations in pack-year based lung screening eligibility.',
  },
  {
    title: 'A Pilot Study Using Machine Learning Algorithms and Wearable Technology for the Early Detection of Postoperative Complications After Cardiothoracic Surgery.',
    authors: 'Beqari J, Powell J, Hurd J, et al.',
    journal: 'Annals of Surgery',
    year: 2024,
    pmid: '38482684',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38482684/',
    relevance: 'Shows the lab’s broader work using physiologic data to detect complications earlier.',
  },
  {
    title: 'Cigarette package labels to promote lung cancer screening.',
    authors: 'Bajaj SS, Pan M, Potter AL, Yang CJ.',
    journal: 'Nature Medicine',
    year: 2022,
    pmid: '36229665',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36229665/',
    relevance: 'Connects public messaging to lung cancer screening uptake.',
  },
  {
    title: 'The Association of Computed Tomography Screening with Lung Cancer Stage Shift and Survival in the United States: A Quasi-experimental Study.',
    authors: 'Potter AL, Rosenstein AL, Kiang MV, Shah S, Gaissert H, Chang DC, et al.',
    journal: 'British Medical Journal',
    year: 2022,
    pmid: '35354556',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35354556/',
    relevance: 'Supports the link between CT screening, earlier stage at diagnosis, and survival.',
  },
  {
    title: 'Evaluating Eligibility of US Black Women Under USPSTF Lung Cancer Screening Guidelines.',
    authors: 'Potter AL, Yang CJ, Woolpert KM, Puttaraju T, Suzuki K, Palmer JR.',
    journal: 'JAMA Oncology',
    year: 2022,
    pmid: '34817564',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34817564/',
    relevance: 'Documents how eligibility criteria can systematically miss Black women.',
  },
];

export const trials = [
  {
    name: 'INSPIRE',
    fullName: 'Improving Lung Cancer Screening for Black Women',
    pi: 'Chi-Fu Jeffrey Yang, MD; Julie R. Palmer, ScD',
    funder: 'AHRQ R18',
    amount: '$1.5M',
    status: 'Recruiting',
    sites: 'Boston, MA and Chicago, IL',
    url: 'https://inspirelungscreeningstudy.mgh.harvard.edu/',
    summary:
      'Provides free LDCT lung screening to Black men and women aged 50-80 with any smoking history.',
  },
  {
    name: 'Wearables',
    fullName: 'Machine Learning + Wearable Technology for Early Detection of Postoperative Complications',
    pi: 'Chi-Fu Jeffrey Yang, MD; Xiang Li, PhD',
    funder: 'NIH R01',
    amount: '$3.5M',
    status: 'Active',
    sites: 'Massachusetts General Hospital',
    url: 'https://wearables.mgh.harvard.edu/',
    summary:
      'Uses machine learning on wearable physiology data to predict postoperative complications in cardiothoracic surgery patients.',
  },
];

export const scripts: Record<Exclude<CancerType, 'liver' | 'skin' | 'oral-hpv'>, string[]> = {
  lung: [
    'Hi, I am calling to schedule a low-dose CT scan for lung cancer screening.',
    'Is your facility accredited by the American College of Radiology for lung cancer screening?',
    'Do I need a referral from my primary care doctor, or can I self-refer?',
    'Can you verify whether this is billed as preventive screening under CPT 71271 or G0297?',
    'How long does the appointment take, and when should I expect results?',
  ],
  breast: [
    'Hi, I am calling to schedule a screening mammogram.',
    'Is your facility MQSA certified for mammography?',
    'Do you offer 3D mammography, and is it covered by my insurance plan?',
    'When will I receive results, and who explains them if follow-up imaging is needed?',
  ],
  cervical: [
    'Hi, I am calling to schedule cervical cancer screening.',
    'Do you offer primary HPV testing, Pap testing, or co-testing?',
    'Do I need a referral, or can I schedule directly?',
    'How should I prepare for the appointment?',
  ],
  colorectal: [
    'Hi, I am calling about colorectal cancer screening.',
    'Do you offer colonoscopy, stool-based testing, or both?',
    'If I choose colonoscopy, what prep is required and who handles insurance authorization?',
    'If a stool test is positive, how quickly can I schedule a follow-up colonoscopy?',
  ],
  prostate: [
    'Hi, I am calling to discuss prostate cancer screening with a clinician.',
    'Can I schedule a visit to review whether a PSA blood test makes sense for me?',
    'How are abnormal PSA results handled in your practice?',
    'Do you help compare benefits, false positives, and biopsy risks?',
  ],
};
