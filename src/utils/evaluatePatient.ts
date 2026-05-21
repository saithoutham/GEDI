export interface EligibilityResult {
  category: string;
  status: 'likely' | 'discuss' | 'unlikely';
  reason: string;
  prompt: string;
  howItWorks: string;
  coverageNote: string;
}

export function evaluatePatient(patient: {
  age: number;
  sex: string;
  smokingHistory: string;
  packsPerDay?: number;
  yearsSmoked?: number;
  quitYears?: number;
}): EligibilityResult[] {
  const newResults: EligibilityResult[] = [];
  const { age, sex, smokingHistory, packsPerDay = 0, yearsSmoked = 0, quitYears = 0 } = patient;
  const packYears = packsPerDay * yearsSmoked;

  // Lung Cancer Logic (USPSTF)
  if (age >= 50 && age <= 80) {
    if (smokingHistory === 'Current' && packYears >= 20) {
      newResults.push({
        category: 'Lung cancer',
        status: 'likely',
        reason: `Age 50-80, >=20 pack-year history (${packYears} calculated), current smoker.`,
        prompt: 'Ask about a low-dose CT (LDCT) scan.',
        howItWorks: 'A low-dose CT scan is a fast imaging test. You lie still on a table while the scanner takes pictures of your lungs. No needles are usually needed.',
        coverageNote: 'Often covered as preventive screening if guideline criteria are met, but patients should still confirm in-network coverage and any prior authorization rules.'
      });
    } else if (smokingHistory === 'Former' && packYears >= 20 && quitYears <= 15) {
      newResults.push({
        category: 'Lung cancer',
        status: 'likely',
        reason: `Age 50-80, >=20 pack-year history (${packYears} calculated), quit within 15 years.`,
        prompt: 'Ask about a low-dose CT (LDCT) scan.',
        howItWorks: 'A low-dose CT scan is a fast imaging test. You lie still on a table while the scanner takes pictures of your lungs. No needles are usually needed.',
        coverageNote: 'Often covered as preventive screening if guideline criteria are met, but patients should still confirm in-network coverage and any prior authorization rules.'
      });
    }
  }

  // Breast Cancer
  if (sex === 'Female' && age >= 40 && age <= 74) {
    newResults.push({
      category: 'Breast cancer',
      status: 'likely',
      reason: 'Women aged 40-74 are generally recommended for biennial screening.',
      prompt: 'Ask about scheduling a mammogram.',
      howItWorks: 'A mammogram is an X-ray of the breasts. Each breast is gently pressed for a few seconds so clear images can be taken.',
      coverageNote: 'Often covered as preventive screening, especially in-network, but patients should check whether the imaging center and radiologist are both in network.'
    });
  }

  // Cervical Cancer
  if (sex === 'Female' && age >= 21 && age <= 65) {
    newResults.push({
      category: 'Cervical cancer',
      status: 'likely',
      reason: 'Women aged 21-65 are recommended for periodic Pap/HPV screening.',
      prompt: 'Ask if you are due for a Pap smear or HPV test.',
      howItWorks: 'A clinician gently collects cells from the cervix during a pelvic exam. The sample is tested for abnormal cells and sometimes HPV.',
      coverageNote: 'Often covered as preventive screening in-network, but patients should verify whether the visit, lab, and HPV testing are all covered under their plan.'
    });
  }

  // Colorectal Cancer
  if (age >= 45 && age <= 75) {
    newResults.push({
      category: 'Colorectal cancer',
      status: 'likely',
      reason: 'Adults aged 45-75 are recommended for colorectal screening.',
      prompt: 'Ask about colonoscopy or stool-based testing options.',
      howItWorks: 'Screening may be done with an at-home stool test or with a colonoscopy, where a doctor looks inside the colon using a flexible camera after bowel prep.',
      coverageNote: 'Coverage is often strong for preventive colorectal screening, but costs can vary if a colonoscopy becomes diagnostic or if pathology/anesthesia bills are separate.'
    });
  }

  // Prostate Cancer
  if (sex === 'Male' && age >= 55 && age <= 69) {
    newResults.push({
      category: 'Prostate cancer',
      status: 'discuss',
      reason: 'Men aged 55-69 should discuss the risks and benefits of PSA screening.',
      prompt: 'Discuss the pros and cons of a PSA blood test.',
      howItWorks: 'The first screening step is usually a PSA blood test. Depending on the result, the clinician may recommend more testing.',
      coverageNote: 'Coverage may depend on the plan and whether the test is coded as preventive versus diagnostic, so patients should check with insurance first.'
    });
  }

  // General CVD / Baseline
  if (age >= 18) {
    newResults.push({
      category: 'CVD - Hypertension',
      status: 'likely',
      reason: 'Adults should have blood pressure checked periodically.',
      prompt: 'Ensure your blood pressure is measured at your next visit.',
      howItWorks: 'A blood pressure cuff is placed on the arm and inflated for a short time to measure the pressure in the arteries.',
      coverageNote: 'This is commonly covered as part of a preventive or primary care visit, but the visit itself should still be confirmed as in-network.'
    });
  }

  if (age >= 35 && age <= 70) {
    newResults.push({
      category: 'CVD - Diabetes',
      status: 'discuss',
      reason: 'Adults 35-70 with overweight/obesity should be screened. Discuss your risk factors.',
      prompt: 'Ask if you need an A1C or fasting blood glucose test.',
      howItWorks: 'Screening is usually done with a blood test, such as an A1C or fasting glucose test, to check for high blood sugar.',
      coverageNote: 'This is often covered when preventive criteria are met, but patients should confirm whether the office visit and lab work are in network.'
    });
  }

  return newResults;
}
