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

type StepKey =
  | 'contact'
  | 'contactDetails'
  | 'age'
  | 'sex'
  | 'race'
  | 'raceOther'
  | 'routineIntent'
  | 'priorCervical'
  | 'priorColorectal'
  | 'smokingStatus'
  | 'smokingNumbers'
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
        breastScreeningApplies: value === 'female',
        hasCervix: value === 'female',
        hasProstate: value === 'male',
        none: false,
        unknown: value === 'intersex' || value === 'prefer-not',
      },
      cervicalRisk: {
        ...prev.cervicalRisk,
        cervixRemoved: false,
      },
      prostateRisk: {
        ...prev.prostateRisk,
        africanAncestry: value === 'male' && prev.race.includes('black'),
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
          africanAncestry: prev.sexAssignedAtBirth === 'male' && race.includes('black'),
        },
      };
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
          <QuestionShell title="How should we contact you?" hint="Enter your name and phone number for screening follow-up.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Your name (first, last)" value={answers.participantName ?? ''} onChange={(value) => update({ participantName: value })} required />
              <TextField label="Your phone number" value={answers.phoneNumber ?? ''} onChange={(value) => update({ phoneNumber: value })} inputMode="tel" required />
            </div>
          </QuestionShell>
        );

      case 'age':
        return (
          <QuestionShell title="How old are you?" hint="Use your current age in years.">
            <NumberField label="Your age" value={answers.age ?? ''} onChange={setAge} min={0} max={120} required />
          </QuestionShell>
        );

      case 'sex':
        return (
          <QuestionShell title="What sex were you assigned at birth?" hint="This helps decide which screening guidelines may apply to you.">
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
          <QuestionShell title="Which race options apply to you?" hint="Select all that apply.">
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
          <QuestionShell title="Are you taking this for routine screening?" hint="If you have symptoms, the safest next step is to talk with a clinician.">
            <RadioRow<RoutineScreeningIntent>
              label="Screening context"
              value={answers.routineIntent}
              onChange={(value) => update({ routineIntent: value })}
              options={[
                ['routine', 'Yes, routine screening only'],
                ['symptoms', 'No, I have symptoms'],
                ['prior-cancer', 'No, I have had cancer before'],
                ['not-sure', 'Not sure'],
              ]}
              required
            />
          </QuestionShell>
        );

      case 'priorCervical':
        return (
          <QuestionShell title="Have you had regular normal Pap or HPV tests before?" hint="If you are not sure, choose Not sure.">
            <RadioRow
              label="Past Pap or HPV testing"
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
          <QuestionShell title="Have you ever completed colorectal cancer screening?" hint="This could be a stool test, colonoscopy, or another colorectal screening test. If you are not sure, choose Not sure.">
            <RadioRow
              label="Past colorectal screening"
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
          <QuestionShell title="What is your smoking status?" hint="This helps check lung screening eligibility.">
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
          <QuestionShell title="How much have you smoked?" hint="Pack-years are average packs per day times total years smoked.">
            <div className="grid gap-4 md:grid-cols-3">
              <NumberField label="Average packs per day" value={answers.packsPerDay ?? ''} onChange={(value) => update({ packsPerDay: numericValue(value) })} min={0} max={10} step={0.25} required />
              <NumberField label="Total years you smoked" value={answers.yearsSmoked ?? ''} onChange={(value) => update({ yearsSmoked: numericValue(value) })} min={0} max={100} step={0.5} required />
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

      case 'results':
        return <ResultsView results={evaluation.results} alerts={evaluation.alerts} />;

      default:
        return null;
    }
  }

  return (
    <section className="min-h-[calc(100vh-96px)] bg-[var(--color-brand-primary-soft)]/40 py-5 sm:py-8 md:py-12">
      <div className="w-full px-3 sm:px-6 lg:px-10">
        <div className="w-full">
          <p className="eyebrow text-[var(--color-brand-primary)]">Assessment</p>
          <h1 className="display-md mt-3 text-[var(--color-brand-aubergine)]">Cancer screening eligibility intake.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)] sm:text-base">
            Answer one step at a time. Your screening summary appears only after the intake is complete.
          </p>
        </div>

        <form className="mt-5 w-full overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-gedi)]" onSubmit={(event) => event.preventDefault()}>
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

  steps.push({ key: 'routineIntent', shortTitle: 'Screening context' });

  if (answers.sexAssignedAtBirth === 'female') {
    steps.push({ key: 'priorCervical', shortTitle: 'Past Pap or HPV testing' });
  }

  steps.push(
    { key: 'priorColorectal', shortTitle: 'Past colorectal screening' },
    { key: 'smokingStatus', shortTitle: 'Smoking status' }
  );

  if (answers.smokingStatus === 'current' || answers.smokingStatus === 'former') {
    steps.push({ key: 'smokingNumbers', shortTitle: 'Smoking exposure' });
  }

  steps.push({ key: 'results', shortTitle: 'Results' });

  return steps;
}

function validateStep(step: StepKey, answers: AssessmentAnswers) {
  switch (step) {
    case 'contactDetails':
      if (!answers.participantName?.trim()) return 'Please enter your name.';
      if (!answers.phoneNumber?.trim()) return 'Please enter your phone number.';
      return '';
    case 'age':
      if (answers.age === undefined || answers.age <= 0 || answers.age > 120) return 'Please enter a valid age.';
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
    case 'priorCervical':
      if (!answers.priorCervicalScreening) return 'Please answer the past Pap or HPV testing question.';
      return '';
    case 'priorColorectal':
      if (!answers.priorColorectalScreening) return 'Please answer the past colorectal screening question.';
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
      {hint ? <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--color-ink-muted)] sm:text-base">{hint}</p> : null}
      <div className="mt-6 grid gap-5">{children}</div>
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
