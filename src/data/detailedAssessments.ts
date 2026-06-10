export const detailedAssessments: Record<string, any> = {
  'Breast cancer': {
    patientFacts: [
      "Breast cancer is the second most common cancer among women in the US",
      "Screening mammograms can help find breast cancer early when it's easier to treat",
      "Some women may need to start screening earlier if they have a strong family history"
    ],
    clinicianFacts: [
      "USPSTF Grade B: Biennial screening mammography for women aged 40 to 74 years",
      "This recommendation applies to women at average risk It does not apply to women with a genetic marker or history of high-risk lesions",
      "Women with a parent, sibling, or child with breast cancer are at higher risk and may benefit from earlier screening"
    ],
    questions: [
      { id: 'history', text: 'Personal history of breast cancer or high-risk lesion (DCIS, LCIS, ADH, ALH)?', patientText: 'Have you ever had breast cancer or been told you had a high-risk breast finding?' },
      { id: 'brca', text: 'Known genetic mutation (BRCA1/2, PALB2, PTEN) in self or first-degree relative?', patientText: 'Have you or a close family member been told you have a breast cancer gene change such as BRCA?' },
      { id: 'radiation', text: 'Chest radiation therapy received between ages 10 and 30?', patientText: 'Did you ever get radiation to your chest when you were young, between about ages 10 and 30?' },
      { id: 'dense', text: 'Extremely dense breasts identified on a previous mammogram?', patientText: 'Has a doctor ever told you that you have very dense breast tissue on a mammogram?' },
      { id: 'family', text: 'First-degree relative with breast cancer diagnosed before age 50?', patientText: 'Did your mother, sister, or daughter get breast cancer before age 50?' }
    ],
    evaluate: (answers: Record<string, boolean>) => {
      if (answers.history || answers.brca || answers.radiation) return { status: 'high-risk', message: 'HIGH RISK IDENTIFIED: Standard average-risk guidelines do not apply Patient meets criteria for specialized screening pathways (eg, Breast MRI) and requires immediate specialist consultation' };
      if (answers.dense || answers.family) return { status: 'high-risk', message: 'ELEVATED RISK: Consider supplemental screening (ultrasound/MRI) or initiating screening prior to age 40 based on shared decision-making' };
      return { status: 'standard', message: 'AVERAGE RISK CONFIRMED: Patient qualifies for standard age-based guidelines (mammography every 2 years from age 40-74)' };
    }
  },
  'Cervical cancer': {
    patientFacts: [
      "Cervical cancer is highly preventable with regular screening tests and the HPV vaccine",
      "Screening includes the Pap test and the HPV test",
      "If you have had a hysterectomy, you might not need cervical cancer screening"
    ],
    clinicianFacts: [
      "USPSTF Grade A: Screening every 3 years with cervical cytology alone in women aged 21 to 29 years",
      "USPSTF Grade A: For women aged 30 to 65 years, screening every 3 years with cytology, every 5 years with hrHPV testing, or every 5 years with cotesting",
      "Grade D: Recommends against screening in women older than 65 years who have had adequate prior screening"
    ],
    questions: [
      { id: 'lesions', text: 'History of high-grade precancerous cervical lesion (CIN2, CIN3) or cervical cancer?', patientText: 'Have you ever been told you had cervical cancer or a serious pre-cancer on the cervix?' },
      { id: 'immuno', text: 'Immunocompromised status (e.g., HIV infection, organ transplant, chronic steroid use)?', patientText: 'Do you have a condition or treatment that weakens your immune system, such as HIV, an organ transplant, or long-term steroid use?' },
      { id: 'des', text: 'In utero exposure to diethylstilbestrol (DES)?', patientText: 'Did your mother take DES while pregnant with you, if you know?' },
      { id: 'hysterectomy', text: 'Complete hysterectomy (removal of uterus and cervix) for non-cancerous reasons?', patientText: 'Have you had surgery that removed both your uterus and your cervix for a non-cancer reason?' }
    ],
    evaluate: (answers: Record<string, boolean>) => {
      if (answers.lesions || answers.immuno || answers.des) return { status: 'high-risk', message: 'HIGH RISK / SPECIAL POPULATION: Routine screening intervals do not apply Patient requires ongoing, frequent surveillance (often annual) based on specific clinical guidelines' };
      if (answers.hysterectomy) return { status: 'low-risk', message: 'EXCLUDED FROM SCREENING: Patient has had cervix removed for benign reasons; routine cervical cancer screening is contraindicated' };
      return { status: 'standard', message: 'AVERAGE RISK CONFIRMED: Patient qualifies for standard age-based guidelines for Pap and/or hrHPV testing' };
    }
  },
  'Colorectal cancer': {
    patientFacts: [
      "Colorectal cancer almost always develops from precancerous polyps in the colon or rectum",
      "Screening tests can find precancerous polyps so they can be removed before turning into cancer",
      "Screening should begin at age 45 for people at average risk"
    ],
    clinicianFacts: [
      "USPSTF Grade A: Screening for colorectal cancer in all adults aged 50 to 75 years",
      "USPSTF Grade B: Screening for colorectal cancer in adults aged 45 to 49 years",
      "Screening modalities include stool-based tests (FIT, hgFOBT, sDNA-FIT) and direct visualization (colonoscopy, CT colonography, flexible sigmoidoscopy)"
    ],
    questions: [
      { id: 'personal_hx', text: 'Personal history of colorectal cancer or adenomatous polyps?', patientText: 'Have you ever had colon or rectal cancer, or been told you had high-risk colon polyps?' },
      { id: 'ibd', text: 'Personal history of Inflammatory Bowel Disease (Crohn\'s or Ulcerative Colitis) for >8 years?', patientText: 'Have you had Crohn’s disease or ulcerative colitis for many years?' },
      { id: 'family_early', text: 'First-degree relative with colorectal cancer or advanced adenoma diagnosed BEFORE age 60?', patientText: 'Did a parent, brother, sister, or child get colon or rectal cancer before age 60?' },
      { id: 'family_multi', text: 'Two or more first-degree relatives with colorectal cancer at ANY age?', patientText: 'Have two or more close family members had colon or rectal cancer?' },
      { id: 'genetic', text: 'Known family history of hereditary syndromes (Lynch syndrome, FAP)?', patientText: 'Has your family ever been told there is an inherited colon cancer condition, such as Lynch syndrome or FAP?' }
    ],
    evaluate: (answers: Record<string, boolean>) => {
      if (answers.genetic || answers.ibd) return { status: 'high-risk', message: 'HIGH RISK IDENTIFIED: Patient requires specialized, high-frequency surveillance colonoscopy starting immediately or at a very early age Refer to gastroenterology' };
      if (answers.personal_hx || answers.family_early || answers.family_multi) return { status: 'high-risk', message: 'ELEVATED RISK: Patient should begin screening at age 40, or 10 years prior to the earliest familial diagnosis, typically strictly via colonoscopy' };
      return { status: 'standard', message: 'AVERAGE RISK CONFIRMED: Patient qualifies for standard screening starting at age 45 via any approved modality (FIT, Colonoscopy, etc)' };
    }
  },
  'Lung cancer': {
    patientFacts: [
      "Lung cancer is the leading cause of cancer death in the United States",
      "The best way to reduce your risk is to quit smoking and avoid secondhand smoke",
      "Screening is done with a low-dose CT scan (LDCT) and is recommended for older adults with a heavy smoking history"
    ],
    clinicianFacts: [
      "USPSTF Grade B: Annual screening for lung cancer with LDCT in adults aged 50 to 80 years who have a 20 pack-year smoking history",
      "Screening should be discontinued once a person has not smoked for 15 years",
      "Smoking cessation counseling remains the most important intervention for preventing lung cancer"
    ],
    questions: [
      { id: 'symptoms', text: 'Currently experiencing a new/worsening cough, hemoptysis (coughing blood), or unexplained weight loss?', patientText: 'Are you having symptoms right now like a new cough, coughing up blood, or losing weight without trying?' },
      { id: 'health', text: 'Severe comorbid health problem that would substantially limit life expectancy or ability to undergo thoracic surgery?', patientText: 'Do you have a major health problem that would make lung surgery or treatment very hard to go through?' },
      { id: 'copd', text: 'Personal history of COPD or pulmonary fibrosis?', patientText: 'Have you been told you have COPD, emphysema, or pulmonary fibrosis?' },
      { id: 'exposure', text: 'Significant occupational exposure to asbestos, arsenic, beryllium, cadmium, chromium, or nickel?', patientText: 'Were you exposed at work to things like asbestos or other harmful dusts or metals?' },
      { id: 'other_cancer', text: 'Personal history of other smoking-related cancers (head/neck, bladder)?', patientText: 'Have you ever had another cancer linked to smoking, such as bladder, head, or neck cancer?' }
    ],
    evaluate: (answers: Record<string, boolean>) => {
      if (answers.symptoms) return { status: 'high-risk', message: 'DIAGNOSTIC WORKUP REQUIRED: Patient is symptomatic Do not use screening pathways Order diagnostic imaging immediately' };
      if (answers.health) return { status: 'low-risk', message: 'CONTRAINDICATED: Screening is not recommended as underlying health conditions would prevent curative treatment' };
      if (answers.copd || answers.exposure || answers.other_cancer) return { status: 'high-risk', message: 'ELEVATED RISK PROFILE: Patient has compounded risk factors beyond pack-years High clinical suspicion during LDCT interpretation is warranted' };
      return { status: 'standard', message: 'ELIGIBILITY CONFIRMED: Patient meets strict USPSTF criteria for annual Low-Dose CT (LDCT) screening' };
    }
  },
  'Prostate cancer': {
    patientFacts: [
      "Prostate cancer is one of the most common types of cancer in men",
      "Many prostate cancers grow slowly and may never cause harm, but some can be serious",
      "The PSA blood test is used for screening, but deciding to get tested is a personal choice"
    ],
    clinicianFacts: [
      "USPSTF Grade C: For men aged 55 to 69 years, the decision to undergo periodic PSA-based screening should be an individual one",
      "USPSTF Grade D: Recommends against PSA-based screening for prostate cancer in men 70 years and older",
      "African American men and men with a family history of prostate cancer have a higher risk of developing the disease"
    ],
    questions: [
      { id: 'family_early', text: 'First-degree relative (father, brother, son) diagnosed with prostate cancer before age 65?', patientText: 'Did your father, brother, or son get prostate cancer before age 65?' },
      { id: 'family_multi', text: 'Multiple family members diagnosed with prostate cancer?', patientText: 'Have several men in your family had prostate cancer?' },
      { id: 'brca', text: 'Known BRCA1 or BRCA2 mutation in the family?', patientText: 'Has anyone in your family been told they have a BRCA gene change?' },
      { id: 'ancestry', text: 'African ancestry (historically associated with higher risk and earlier onset)?', patientText: 'Do you identify as Black or of African ancestry?' },
      { id: 'history', text: 'Previous prostate biopsy showing High-Grade Prostatic Intraepithelial Neoplasia (HGPIN)?', patientText: 'Have you ever had a prostate biopsy that showed a high-risk abnormal result?' }
    ],
    evaluate: (answers: Record<string, boolean>) => {
      if (answers.brca || answers.family_multi || answers.history) return { status: 'high-risk', message: 'HIGH RISK IDENTIFIED: Patient has a strong genetic/histologic risk profile Shared decision-making for PSA screening should begin at age 40' };
      if (answers.family_early || answers.ancestry) return { status: 'high-risk', message: 'ELEVATED RISK: Patient belongs to a high-risk demographic Shared decision-making for PSA screening should begin at age 45' };
      return { status: 'standard', message: 'AVERAGE RISK CONFIRMED: Between ages 55-69, conduct shared decision-making regarding the pros and cons of PSA screening' };
    }
  }
};
