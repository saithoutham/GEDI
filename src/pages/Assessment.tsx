import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  calculatePackYears,
  emptyRiskAnswers,
  evaluateScreening,
  type AssessmentAnswers,
  type CancerType,
  type RaceOption,
  type RoutineScreeningIntent,
  type ScreeningResult,
  type ScreeningStatus,
  type SexAssignedAtBirth,
  type SmokingStatus,
} from '../lib/screeningRules';

const initialAnswers: AssessmentAnswers = {
  contactConsent: true,
  race: [],
  anatomy: {
    breastScreeningApplies: false,
    hasCervix: false,
    hasProstate: false,
    none: false,
    unknown: false,
  },
  routineIntent: 'routine',
  highRiskHistory: 'no',
  ...emptyRiskAnswers,
};

const statusClasses: Record<ScreeningStatus, string> = {
  'appears-eligible': 'bg-[var(--color-eligible)] text-[var(--color-eligible-ink)]',
  'shared-decision': 'bg-[var(--color-discuss)] text-[var(--color-discuss-ink)]',
  'individual-decision': 'bg-[var(--color-discuss)] text-[var(--color-discuss-ink)]',
  'ask-clinician': 'bg-[var(--color-discuss)] text-[var(--color-discuss-ink)]',
  'not-routine': 'bg-[var(--color-not-recommended)] text-[var(--color-brand-aubergine)]',
  'not-eligible': 'bg-[var(--color-not-recommended)] text-[var(--color-brand-aubergine)]',
  info: 'bg-[var(--color-brand-sky)] text-[var(--color-brand-navy)]',
};

const cancerLabels: Record<CancerType, string> = {
  breast: 'Breast',
  cervical: 'Cervical',
  colorectal: 'Colorectal',
  lung: 'Lung',
  prostate: 'Prostate',
  liver: 'Liver',
  skin: 'Skin',
  'oral-hpv': 'Oral/HPV',
};

const raceLabels: Record<RaceOption, string> = {
  white: 'White',
  black: 'Black or African American',
  asian: 'Asian',
  'american-indian-alaska-native': 'American Indian and Alaska Native',
  'native-hawaiian-pacific-islander': 'Native Hawaiian and Other Pacific Islander',
  other: 'Other',
  unknown: 'Unknown / prefer not to say',
};

type RiskGroupKey =
  | 'breastRisk'
  | 'cervicalRisk'
  | 'colorectalRisk'
  | 'lungRisk'
  | 'prostateRisk'
  | 'liverRisk'
  | 'skinRisk'
  | 'oralRisk';

type StepKey =
  | 'contact'
  | 'contactDetails'
  | 'age'
  | 'sex'
  | 'race'
  | 'raceOther'
  | 'routineIntent'
  | 'highRisk'
  | 'anatomy'
  | 'priorCervical'
  | 'priorColorectal'
  | 'smokingStatus'
  | 'smokingNumbers'
  | 'lungRisk'
  | 'breastRisk'
  | 'cervicalRisk'
  | 'colorectalRisk'
  | 'prostateRisk'
  | 'liverSkinOralRisk'
  | 'results';

type StepDefinition = {
  key: StepKey;
  shortTitle: string;
};

export default function Assessment() {
  const [answers, setAnswers] = useState<AssessmentAnswers>(initialAnswers);
  const [stepKey, setStepKey] = useState<StepKey>('contact');
  const [error, setError] = useState('');

  const packYears = calculatePackYears(answers.packsPerDay, answers.yearsSmoked);
  const evaluation = evaluateScreening(answers);
  const steps = buildSteps(answers);
  const stepIndex = Math.max(0, steps.findIndex((step) => step.key === stepKey));
  const currentStep = steps[stepIndex] ?? steps[0];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const isResultsStep = currentStep.key === 'results';

  function update(partial: Partial<AssessmentAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
    setError('');
  }

  function setAge(value: string) {
    const parsed = Number(value);
    update({ age: Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : undefined });
  }

  function setSex(value: SexAssignedAtBirth) {
    setAnswers((prev) => ({
      ...prev,
      sexAssignedAtBirth: value,
      anatomy: {
        ...prev.anatomy,
        breastScreeningApplies: value === 'female' ? true : prev.anatomy.breastScreeningApplies,
        hasCervix: value === 'female' ? true : prev.anatomy.hasCervix,
        hasProstate: value === 'male' ? true : prev.anatomy.hasProstate,
      },
      prostateRisk: {
        ...prev.prostateRisk,
        africanAncestry: value === 'male' && prev.race.includes('black') ? true : prev.prostateRisk.africanAncestry,
      },
    }));
    setError('');
  }

  function toggleRace(value: RaceOption) {
    setAnswers((prev) => {
      const race = prev.race.includes(value) ? prev.race.filter((item) => item !== value) : [...prev.race, value];
      return {
        ...prev,
        race,
        prostateRisk: {
          ...prev.prostateRisk,
          africanAncestry: race.includes('black') || prev.prostateRisk.africanAncestry,
        },
      };
    });
    setError('');
  }

  function toggleAnatomy(key: keyof AssessmentAnswers['anatomy']) {
    setAnswers((prev) => {
      const anatomy = { ...prev.anatomy, [key]: !prev.anatomy[key] };
      if (key === 'none' || key === 'unknown') {
        anatomy.breastScreeningApplies = false;
        anatomy.hasCervix = false;
        anatomy.hasProstate = false;
        if (key === 'none') anatomy.unknown = false;
        if (key === 'unknown') anatomy.none = false;
      } else {
        anatomy.none = false;
        anatomy.unknown = false;
      }
      return { ...prev, anatomy };
    });
    setError('');
  }

  function toggleRisk(group: RiskGroupKey, key: string) {
    setAnswers((prev) => {
      const current = prev[group] as Record<string, boolean>;
      return {
        ...prev,
        [group]: {
          ...current,
          [key]: !current[key],
        },
      } as AssessmentAnswers;
    });
    setError('');
  }

  function goNext() {
    const message = validateStep(currentStep.key, answers);
    if (message) {
      setError(message);
      return;
    }

    const currentSteps = buildSteps(answers);
    const currentIndex = Math.max(0, currentSteps.findIndex((step) => step.key === currentStep.key));
    const nextStep = currentSteps[Math.min(currentIndex + 1, currentSteps.length - 1)];
    setStepKey(nextStep.key);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    const currentSteps = buildSteps(answers);
    const currentIndex = Math.max(0, currentSteps.findIndex((step) => step.key === currentStep.key));
    const previousStep = currentSteps[Math.max(currentIndex - 1, 0)];
    setStepKey(previousStep.key);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startOver() {
    setAnswers(initialAnswers);
    setStepKey('contact');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStep(key: StepKey) {
    switch (key) {
      case 'contact':
        return (
          <QuestionShell title="Do you want to be contacted about screening information?" hint="This only changes whether contact details are collected in this intake.">
            <RadioRow
              label="Contact preference"
              value={answers.contactConsent ? 'yes' : 'no'}
              onChange={(value) => update({ contactConsent: value === 'yes' })}
              options={[
                ['yes', 'Yes'],
                ['no', 'No'],
              ]}
            />
          </QuestionShell>
        );

      case 'contactDetails':
        return (
          <QuestionShell title="What contact details should be used?" hint="Enter the participant name and phone number for screening follow-up.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Participant name (first, last)" value={answers.participantName ?? ''} onChange={(value) => update({ participantName: value })} required />
              <TextField label="Participant phone number" value={answers.phoneNumber ?? ''} onChange={(value) => update({ phoneNumber: value })} inputMode="tel" required />
            </div>
          </QuestionShell>
        );

      case 'age':
        return (
          <QuestionShell title="What is the participant's age?" hint="Use the participant's current age in years.">
            <NumberField label="Participant age" value={answers.age ?? ''} onChange={setAge} min={0} max={120} required />
          </QuestionShell>
        );

      case 'sex':
        return (
          <QuestionShell title="What was the participant's sex assigned at birth?" hint="Some screening rules depend on anatomy and prior procedures, which are asked separately.">
            <RadioRow<SexAssignedAtBirth>
              label="Sex assigned at birth"
              value={answers.sexAssignedAtBirth}
              onChange={setSex}
              options={[
                ['female', 'Female'],
                ['male', 'Male'],
                ['intersex', 'Intersex'],
                ['prefer-not', 'Prefer not to say'],
              ]}
              required
            />
          </QuestionShell>
        );

      case 'race':
        return (
          <QuestionShell title="Which race options apply?" hint="Select all that apply. This helps identify screening conversations where ancestry or disparities may matter.">
            <CheckboxGroup title="Race" required>
              {(Object.keys(raceLabels) as RaceOption[]).map((race) => (
                <CheckboxRow key={race} checked={answers.race.includes(race)} onChange={() => toggleRace(race)} label={raceLabels[race]} />
              ))}
            </CheckboxGroup>
          </QuestionShell>
        );

      case 'raceOther':
        return (
          <QuestionShell title="Please specify the race option marked other." hint="A short description is enough.">
            <TextField label="If other, please specify" value={answers.raceOther ?? ''} onChange={(value) => update({ raceOther: value })} required />
          </QuestionShell>
        );

      case 'routineIntent':
        return (
          <QuestionShell title="Is this for routine screening?" hint="Symptoms or prior cancer history can require diagnostic care instead of routine screening rules.">
            <RadioRow<RoutineScreeningIntent>
              label="Screening context"
              value={answers.routineIntent}
              onChange={(value) => update({ routineIntent: value })}
              options={[
                ['routine', 'Routine screening only, no symptoms'],
                ['symptoms', 'Symptoms are present'],
                ['prior-cancer', 'Prior cancer history'],
                ['not-sure', 'Not sure'],
              ]}
              required
            />
          </QuestionShell>
        );

      case 'highRisk':
        return (
          <QuestionShell title="Has a clinician ever recommended special cancer screening?" hint="Inherited syndromes and strong family history may change routine age-based screening.">
            <RadioRow
              label="High-risk history"
              value={answers.highRiskHistory}
              onChange={(value) => update({ highRiskHistory: value as AssessmentAnswers['highRiskHistory'] })}
              options={[
                ['no', 'No'],
                ['inherited-syndrome', 'Inherited syndrome such as BRCA, Lynch syndrome, or FAP'],
                ['strong-family-history', 'Strong family history of cancer'],
                ['not-sure', 'Not sure'],
              ]}
              required
            />
          </QuestionShell>
        );

      case 'anatomy':
        return (
          <QuestionShell title="Which anatomy and procedure history options apply?" hint="Choose all that apply. If unsure, select the unsure option.">
            <CheckboxGroup title="Anatomy and procedure history" required>
              <CheckboxRow checked={answers.anatomy.breastScreeningApplies} onChange={() => toggleAnatomy('breastScreeningApplies')} label="Breast screening applies to me" />
              <CheckboxRow checked={answers.anatomy.hasCervix} onChange={() => toggleAnatomy('hasCervix')} label="I currently have a cervix" />
              <CheckboxRow checked={answers.cervicalRisk.cervixRemoved} onChange={() => toggleRisk('cervicalRisk', 'cervixRemoved')} label="My cervix was removed for a non-cancer reason" />
              <CheckboxRow checked={answers.anatomy.hasProstate} onChange={() => toggleAnatomy('hasProstate')} label="I currently have a prostate" />
              <CheckboxRow checked={answers.anatomy.none} onChange={() => toggleAnatomy('none')} label="None of these apply" />
              <CheckboxRow checked={answers.anatomy.unknown} onChange={() => toggleAnatomy('unknown')} label="I am not sure which anatomy-based screenings apply" />
            </CheckboxGroup>
          </QuestionShell>
        );

      case 'priorCervical':
        return (
          <QuestionShell title="Has the participant had regular normal Pap or HPV tests in the past?" hint="This matters most for people older than 65 or unsure of prior screening.">
            <RadioRow
              label="Prior cervical screening"
              value={answers.priorCervicalScreening}
              onChange={(value) => update({ priorCervicalScreening: value })}
              options={[
                ['yes', 'Yes'],
                ['no', 'No'],
                ['not-sure', 'Not sure'],
              ]}
              required
            />
          </QuestionShell>
        );

      case 'priorColorectal':
        return (
          <QuestionShell title="Has the participant ever completed colorectal cancer screening?" hint="This can matter for adults older than 75.">
            <RadioRow
              label="Prior colorectal screening"
              value={answers.priorColorectalScreening}
              onChange={(value) => update({ priorColorectalScreening: value })}
              options={[
                ['yes', 'Yes'],
                ['no', 'No'],
                ['not-sure', 'Not sure'],
              ]}
              required
            />
          </QuestionShell>
        );

      case 'smokingStatus':
        return (
          <QuestionShell title="What is the participant's smoking status?" hint="This is used for lung cancer screening eligibility.">
            <RadioRow<SmokingStatus>
              label="Smoking status"
              value={answers.smokingStatus}
              onChange={(value) => update({ smokingStatus: value })}
              options={[
                ['current', 'Current smoker'],
                ['former', 'Former smoker'],
                ['never', 'Never smoked'],
                ['not-sure', 'Not sure'],
              ]}
              required
            />
          </QuestionShell>
        );

      case 'smokingNumbers':
        return (
          <QuestionShell title="Estimate the participant's smoking exposure." hint="Pack-years are calculated as average packs per day times total years smoked.">
            <div className="grid gap-4 md:grid-cols-3">
              <NumberField label="Average packs per day" value={answers.packsPerDay ?? ''} onChange={(value) => update({ packsPerDay: numericValue(value) })} min={0} max={10} step={0.25} required />
              <NumberField label="Total years smoked" value={answers.yearsSmoked ?? ''} onChange={(value) => update({ yearsSmoked: numericValue(value) })} min={0} max={100} step={0.5} required />
              {answers.smokingStatus === 'former' ? (
                <NumberField label="Years since quitting" value={answers.quitYearsAgo ?? ''} onChange={(value) => update({ quitYearsAgo: numericValue(value) })} min={0} max={100} step={1} required />
              ) : null}
            </div>
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
              <p className="text-sm font-black text-[var(--color-brand-aubergine)]">Estimated pack-years</p>
              <p className="mt-1 text-2xl font-black text-[var(--color-brand-primary)]">{packYears === undefined ? 'Enter smoking values' : packYears.toFixed(1)}</p>
            </div>
          </QuestionShell>
        );

      case 'lungRisk':
        return (
          <QuestionShell title="Are any lung-specific risk or safety factors present?" hint="Select any that apply. Leave all unselected if none apply.">
            <CheckboxGroup title="Lung-specific risk and safety questions">
              <RiskCheckbox group="lungRisk" field="symptoms" answers={answers} onChange={toggleRisk} label="New/worsening cough, coughing blood, unexplained weight loss, or other concerning lung symptoms" />
              <RiskCheckbox group="lungRisk" field="healthLimitsCurativeTreatment" answers={answers} onChange={toggleRisk} label="Major health problem that would substantially limit life expectancy or ability/willingness to have curative lung surgery" />
              <RiskCheckbox group="lungRisk" field="copdOrPulmonaryFibrosis" answers={answers} onChange={toggleRisk} label="COPD, emphysema, or pulmonary fibrosis" />
              <RiskCheckbox group="lungRisk" field="occupationalExposure" answers={answers} onChange={toggleRisk} label="Significant exposure to asbestos, radon, arsenic, silica, diesel exhaust, or similar carcinogens" />
              <RiskCheckbox group="lungRisk" field="otherSmokingRelatedCancer" answers={answers} onChange={toggleRisk} label="Prior smoking-related cancer such as bladder, head, or neck cancer" />
            </CheckboxGroup>
          </QuestionShell>
        );

      case 'breastRisk':
        return (
          <QuestionShell title="Are any breast cancer risk factors present?" hint="Select any that apply. Leave all unselected if none apply.">
            <CheckboxGroup title="Breast cancer">
              <RiskCheckbox group="breastRisk" field="personalHistoryOrHighRiskLesion" answers={answers} onChange={toggleRisk} label="Personal history of breast cancer or a high-risk breast lesion" />
              <RiskCheckbox group="breastRisk" field="geneticMutation" answers={answers} onChange={toggleRisk} label="Known BRCA1/2, PALB2, PTEN, or similar mutation in self or close family" />
              <RiskCheckbox group="breastRisk" field="chestRadiationYoung" answers={answers} onChange={toggleRisk} label="Chest radiation between about ages 10 and 30" />
              <RiskCheckbox group="breastRisk" field="denseBreasts" answers={answers} onChange={toggleRisk} label="Told you have dense breasts on mammogram" />
              <RiskCheckbox group="breastRisk" field="firstDegreeRelativeEarly" answers={answers} onChange={toggleRisk} label="Parent, sibling, or child with breast cancer before age 50" />
            </CheckboxGroup>
          </QuestionShell>
        );

      case 'cervicalRisk':
        return (
          <QuestionShell title="Are any cervical cancer risk factors present?" hint="Select any that apply. Leave all unselected if none apply.">
            <CheckboxGroup title="Cervical cancer">
              <RiskCheckbox group="cervicalRisk" field="priorHighGradeLesionOrCancer" answers={answers} onChange={toggleRisk} label="Prior cervical cancer or high-grade cervical precancer" />
              <RiskCheckbox group="cervicalRisk" field="immunocompromised" answers={answers} onChange={toggleRisk} label="HIV, organ transplant, chronic immune suppression, or similar condition" />
              <RiskCheckbox group="cervicalRisk" field="desExposure" answers={answers} onChange={toggleRisk} label="Known DES exposure before birth" />
              <RiskCheckbox group="cervicalRisk" field="adequatePriorScreening" answers={answers} onChange={toggleRisk} label="Age 65+ with adequate prior normal Pap/HPV screening" />
            </CheckboxGroup>
          </QuestionShell>
        );

      case 'colorectalRisk':
        return (
          <QuestionShell title="Are any colorectal cancer risk factors present?" hint="Select any that apply. Leave all unselected if none apply.">
            <CheckboxGroup title="Colorectal cancer">
              <RiskCheckbox group="colorectalRisk" field="personalHistory" answers={answers} onChange={toggleRisk} label="Personal history of colorectal cancer or adenomatous/high-risk polyps" />
              <RiskCheckbox group="colorectalRisk" field="inflammatoryBowelDisease" answers={answers} onChange={toggleRisk} label="Crohn disease or ulcerative colitis for many years" />
              <RiskCheckbox group="colorectalRisk" field="familyEarly" answers={answers} onChange={toggleRisk} label="First-degree relative with colorectal cancer or advanced adenoma before age 60" />
              <RiskCheckbox group="colorectalRisk" field="familyMultiple" answers={answers} onChange={toggleRisk} label="Two or more first-degree relatives with colorectal cancer at any age" />
              <RiskCheckbox group="colorectalRisk" field="geneticSyndrome" answers={answers} onChange={toggleRisk} label="Known Lynch syndrome, FAP, or similar inherited colorectal cancer syndrome" />
            </CheckboxGroup>
          </QuestionShell>
        );

      case 'prostateRisk':
        return (
          <QuestionShell title="Are any prostate cancer risk factors present?" hint="Select any that apply. Leave all unselected if none apply.">
            <CheckboxGroup title="Prostate cancer">
              <RiskCheckbox group="prostateRisk" field="familyEarly" answers={answers} onChange={toggleRisk} label="Father, brother, or son diagnosed with prostate cancer before age 65" />
              <RiskCheckbox group="prostateRisk" field="familyMultiple" answers={answers} onChange={toggleRisk} label="Multiple family members diagnosed with prostate cancer" />
              <RiskCheckbox group="prostateRisk" field="brcaMutation" answers={answers} onChange={toggleRisk} label="Known BRCA1 or BRCA2 mutation in self or family" />
              <RiskCheckbox group="prostateRisk" field="africanAncestry" answers={answers} onChange={toggleRisk} label="Black or African ancestry" />
              <RiskCheckbox group="prostateRisk" field="priorHighRiskBiopsy" answers={answers} onChange={toggleRisk} label="Prior prostate biopsy with high-risk abnormal result" />
            </CheckboxGroup>
          </QuestionShell>
        );

      case 'liverSkinOralRisk':
        return (
          <QuestionShell title="Are any liver, skin, or oral/HPV-related risk factors present?" hint="Select any that apply. Leave all unselected if none apply.">
            <div className="grid gap-4">
              <QuestionPanel title="Liver cancer">
                <RiskCheckbox group="liverRisk" field="cirrhosis" answers={answers} onChange={toggleRisk} label="Cirrhosis or advanced liver scarring" />
                <RiskCheckbox group="liverRisk" field="hepatitisB" answers={answers} onChange={toggleRisk} label="Chronic hepatitis B" />
                <RiskCheckbox group="liverRisk" field="hepatitisC" answers={answers} onChange={toggleRisk} label="Chronic hepatitis C" />
                <RiskCheckbox group="liverRisk" field="hemochromatosis" answers={answers} onChange={toggleRisk} label="Hereditary hemochromatosis or inherited liver disease risk" />
              </QuestionPanel>
              <QuestionPanel title="Skin cancer">
                <RiskCheckbox group="skinRisk" field="changingLesion" answers={answers} onChange={toggleRisk} label="Changing, bleeding, painful, or unusual mole/skin spot" />
                <RiskCheckbox group="skinRisk" field="personalHistory" answers={answers} onChange={toggleRisk} label="Personal history of melanoma or other skin cancer" />
                <RiskCheckbox group="skinRisk" field="immunosuppressed" answers={answers} onChange={toggleRisk} label="Immune suppression, organ transplant, or long-term immune-suppressing medication" />
                <RiskCheckbox group="skinRisk" field="manyAtypicalMoles" answers={answers} onChange={toggleRisk} label="Many moles or atypical moles" />
                <RiskCheckbox group="skinRisk" field="highUvExposure" answers={answers} onChange={toggleRisk} label="High UV exposure, indoor tanning, or blistering sunburn history" />
              </QuestionPanel>
              <QuestionPanel title="Oral/HPV-related cancers">
                <RiskCheckbox group="oralRisk" field="persistentSymptoms" answers={answers} onChange={toggleRisk} label="Persistent mouth sore, throat pain, swallowing trouble, voice change, or neck lump" />
                <RiskCheckbox group="oralRisk" field="tobaccoOrHeavyAlcohol" answers={answers} onChange={toggleRisk} label="Current or prior tobacco use or heavy alcohol use" />
                <RiskCheckbox group="oralRisk" field="hpvRelatedHistory" answers={answers} onChange={toggleRisk} label="History of HPV-related disease or concern about HPV-related cancer risk" />
              </QuestionPanel>
            </div>
          </QuestionShell>
        );

      case 'results':
        return <ResultsView results={evaluation.results} alerts={evaluation.alerts} />;

      default:
        return null;
    }
  }

  return (
    <section className="min-h-[calc(100vh-96px)] bg-[var(--color-brand-primary-soft)]/40 py-5 sm:py-8 md:py-12">
      <div className="container-gedi">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-[var(--color-brand-primary)]">Assessment</p>
          <h1 className="display-md mt-3 text-[var(--color-brand-aubergine)]">Cancer screening eligibility intake.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)] sm:text-base">
            Answer one step at a time. Your screening summary appears only after the intake is complete.
          </p>
        </div>

        <form className="mx-auto mt-5 max-w-4xl overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-gedi)]" onSubmit={(event) => event.preventDefault()}>
          <div className="border-b border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-brand-primary)]">
                  Step {stepIndex + 1} of {steps.length}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--color-brand-aubergine)]">{currentStep.shortTitle}</p>
              </div>
              <div className="h-2 w-full rounded-full bg-white sm:w-64" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-[var(--color-brand-primary)] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7 md:p-8">
            {renderStep(currentStep.key)}

            {error ? (
              <div className="mt-6 flex gap-3 rounded-2xl bg-[var(--color-discuss)] p-4 text-[var(--color-discuss-ink)]">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm font-bold leading-6">{error}</p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" className="btn btn-secondary" onClick={goBack} disabled={stepIndex === 0}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {isResultsStep ? (
                <button type="button" className="btn btn-primary" onClick={startOver}>
                  Start over
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  {steps[stepIndex + 1]?.key === 'results' ? 'See results' : 'Next'} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function buildSteps(answers: AssessmentAnswers): StepDefinition[] {
  const steps: StepDefinition[] = [
    { key: 'contact', shortTitle: 'Contact preference' },
  ];

  if (answers.contactConsent) {
    steps.push({ key: 'contactDetails', shortTitle: 'Contact details' });
  }

  steps.push(
    { key: 'age', shortTitle: 'Age' },
    { key: 'sex', shortTitle: 'Sex assigned at birth' },
    { key: 'race', shortTitle: 'Race' }
  );

  if (answers.race.includes('other')) {
    steps.push({ key: 'raceOther', shortTitle: 'Race detail' });
  }

  steps.push(
    { key: 'routineIntent', shortTitle: 'Screening context' },
    { key: 'highRisk', shortTitle: 'High-risk history' },
    { key: 'anatomy', shortTitle: 'Anatomy and procedure history' }
  );

  if (answers.sexAssignedAtBirth === 'female' || answers.anatomy.hasCervix || answers.anatomy.unknown) {
    steps.push({ key: 'priorCervical', shortTitle: 'Prior cervical screening' });
  }

  steps.push(
    { key: 'priorColorectal', shortTitle: 'Prior colorectal screening' },
    { key: 'smokingStatus', shortTitle: 'Smoking status' }
  );

  if (answers.smokingStatus === 'current' || answers.smokingStatus === 'former') {
    steps.push({ key: 'smokingNumbers', shortTitle: 'Smoking exposure' });
  }

  steps.push(
    { key: 'lungRisk', shortTitle: 'Lung risk factors' },
    { key: 'breastRisk', shortTitle: 'Breast cancer risk factors' },
    { key: 'cervicalRisk', shortTitle: 'Cervical cancer risk factors' },
    { key: 'colorectalRisk', shortTitle: 'Colorectal cancer risk factors' },
    { key: 'prostateRisk', shortTitle: 'Prostate cancer risk factors' },
    { key: 'liverSkinOralRisk', shortTitle: 'Other risk factors' },
    { key: 'results', shortTitle: 'Results' }
  );

  return steps;
}

function validateStep(step: StepKey, answers: AssessmentAnswers) {
  switch (step) {
    case 'contactDetails':
      if (!answers.participantName?.trim()) return 'Please enter the participant name.';
      if (!answers.phoneNumber?.trim()) return 'Please enter the participant phone number.';
      return '';
    case 'age':
      if (answers.age === undefined || answers.age <= 0 || answers.age > 120) return 'Please enter a valid participant age.';
      return '';
    case 'sex':
      if (!answers.sexAssignedAtBirth) return 'Please select sex assigned at birth.';
      return '';
    case 'race':
      if (answers.race.length === 0) return 'Please select at least one race option.';
      return '';
    case 'raceOther':
      if (!answers.raceOther?.trim()) return 'Please specify the race option marked other.';
      return '';
    case 'routineIntent':
      if (!answers.routineIntent) return 'Please select the screening context.';
      return '';
    case 'highRisk':
      if (!answers.highRiskHistory) return 'Please select a high-risk history answer.';
      return '';
    case 'anatomy':
      if (!Object.values(answers.anatomy).some(Boolean) && !answers.cervicalRisk.cervixRemoved) {
        return 'Please select at least one anatomy or procedure history option.';
      }
      return '';
    case 'priorCervical':
      if (!answers.priorCervicalScreening) return 'Please answer the prior cervical screening question.';
      return '';
    case 'priorColorectal':
      if (!answers.priorColorectalScreening) return 'Please answer the prior colorectal screening question.';
      return '';
    case 'smokingStatus':
      if (!answers.smokingStatus) return 'Please select smoking status.';
      return '';
    case 'smokingNumbers':
      if (answers.packsPerDay === undefined || answers.packsPerDay <= 0) return 'Please enter average packs per day.';
      if (answers.yearsSmoked === undefined || answers.yearsSmoked <= 0) return 'Please enter total years smoked.';
      if (answers.smokingStatus === 'former' && (answers.quitYearsAgo === undefined || answers.quitYearsAgo < 0)) {
        return 'Please enter years since quitting.';
      }
      return '';
    default:
      return '';
  }
}

function QuestionShell({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-black leading-tight text-[var(--color-brand-aubergine)] sm:text-3xl">{title}</h2>
      {hint ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)] sm:text-base">{hint}</p> : null}
      <div className="mt-6 grid gap-5">{children}</div>
    </section>
  );
}

function QuestionPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <h3 className="font-black text-[var(--color-brand-aubergine)]">{title}</h3>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  inputMode,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: 'text' | 'tel';
  required?: boolean;
}) {
  return (
    <label className="block font-bold text-[var(--color-brand-aubergine)]">
      {label}
      {required ? <span className="ml-2 text-sm font-bold text-red-600">* required</span> : null}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        className="mt-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-base font-normal text-[var(--color-ink)]"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  required,
}: {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}) {
  return (
    <label className="block font-bold text-[var(--color-brand-aubergine)]">
      {label}
      {required ? <span className="ml-2 text-sm font-bold text-red-600">* required</span> : null}
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-base font-normal text-[var(--color-ink)]"
      />
    </label>
  );
}

function RadioRow<T extends string>({
  label,
  value,
  onChange,
  options,
  required,
  name,
}: {
  label: string;
  value?: T;
  onChange: (value: T) => void;
  options: Array<[T, string]>;
  required?: boolean;
  name?: string;
}) {
  const groupName = name ?? label;
  return (
    <fieldset>
      <legend className="font-black text-[var(--color-brand-aubergine)]">
        {label}
        {required ? <span className="ml-2 text-sm font-bold text-red-600">* required</span> : null}
      </legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map(([optionValue, optionLabel]) => (
          <label key={optionValue}>
            <input className="chip-input" type="radio" name={groupName} checked={value === optionValue} onChange={() => onChange(optionValue)} />
            <span className="chip-label">{optionLabel}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({ title, children, required }: { title: string; children: ReactNode; required?: boolean }) {
  return (
    <fieldset>
      <legend className="font-black text-[var(--color-brand-aubergine)]">
        {title}
        {required ? <span className="ml-2 text-sm font-bold text-red-600">* required</span> : null}
      </legend>
      <div className="mt-3 grid gap-2">{children}</div>
    </fieldset>
  );
}

function CheckboxRow({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label>
      <input className="chip-input" type="checkbox" checked={checked} onChange={onChange} />
      <span className="chip-label">{label}</span>
    </label>
  );
}

function RiskCheckbox({
  group,
  field,
  answers,
  onChange,
  label,
}: {
  group: RiskGroupKey;
  field: string;
  answers: AssessmentAnswers;
  onChange: (group: RiskGroupKey, key: string) => void;
  label: string;
}) {
  const current = answers[group] as Record<string, boolean>;
  return <CheckboxRow checked={current[field]} onChange={() => onChange(group, field)} label={label} />;
}

function ResultsView({ results, alerts }: { results: ScreeningResult[]; alerts: ReturnType<typeof evaluateScreening>['alerts'] }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-[var(--color-brand-primary)]" />
        <div>
          <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)] sm:text-3xl">Eligibility summary</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
            Review these results with a licensed clinician before scheduling or changing care.
          </p>
        </div>
      </div>

      {alerts.length ? (
        <div className="mt-5 grid gap-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex gap-3 rounded-2xl bg-[var(--color-discuss)] p-4 text-[var(--color-discuss-ink)]">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-bold leading-6">{alert.message}</p>
            </div>
          ))}
        </div>
      ) : null}

      {results.length ? (
        <div className="mt-5 grid gap-4">
          {results.map((item) => (
            <ResultCard key={item.cancerType} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4 text-sm font-bold text-[var(--color-brand-aubergine)]">
          Results need at least age and demographic details. Go back to complete the intake.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link to="/guidelines" className="btn btn-primary">
          Review guideline details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ResultCard({ item }: { item: ScreeningResult }) {
  return (
    <article className="rounded-3xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-gedi)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--color-brand-primary)]">{cancerLabels[item.cancerType]}</p>
          <h3 className="mt-1 text-lg font-black text-[var(--color-brand-aubergine)]">{item.title}</h3>
        </div>
        <span className={`w-max rounded-full px-3 py-1.5 text-xs font-black ${statusClasses[item.status]}`}>{item.statusLabel}</span>
      </div>
      {item.routineInfoOnly ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brand-sky)]/35 px-3 py-2 text-xs font-black text-[var(--color-brand-navy)]">
          <Info className="h-4 w-4" /> Routine screening information only
        </p>
      ) : null}
      <p className="mt-4 text-sm leading-6 text-[var(--color-ink-muted)]">{item.explanation}</p>
      <p className="mt-4 rounded-2xl bg-[var(--color-surface)] p-3 text-sm font-bold text-[var(--color-brand-aubergine)]">
        Suggested next step: {item.nextStep}
      </p>
    </article>
  );
}

function numericValue(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
