import { AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  calculatePackYears,
  evaluateScreening,
  type AssessmentAnswers,
  type CancerType,
  type HighRiskHistory,
  type PriorScreeningAnswer,
  type RoutineScreeningIntent,
  type ScreeningResult,
  type ScreeningStatus,
  type SmokingPackYears,
  type SmokingStatus,
} from '../lib/screeningRules';

type StepKey =
  | 'age'
  | 'anatomy'
  | 'routine'
  | 'risk'
  | 'lungPackYears'
  | 'packCalculator'
  | 'smokingStatus'
  | 'cervicalPrior'
  | 'colorectalPrior'
  | 'results';

const initialAnswers: AssessmentAnswers = {
  anatomy: {
    breastScreeningApplies: false,
    hasCervix: false,
    hasProstate: false,
    none: false,
    unknown: false,
  },
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
};

export default function Assessment() {
  const [answers, setAnswers] = useState<AssessmentAnswers>(initialAnswers);
  const [step, setStep] = useState<StepKey>('age');
  const [error, setError] = useState('');
  const [hasPrimaryCare, setHasPrimaryCare] = useState<boolean | undefined>();

  const steps = useMemo(() => buildSteps(answers), [answers]);
  const stepIndex = Math.max(0, steps.indexOf(step));
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const evaluation = useMemo(() => evaluateScreening({ ...answers, hasPrimaryCare }), [answers, hasPrimaryCare]);

  function update(partial: Partial<AssessmentAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
    setError('');
  }

  function goNext() {
    const message = validateStep(step, answers);
    if (message) {
      setError(message);
      return;
    }
    const currentSteps = buildSteps(answers);
    const currentIndex = currentSteps.indexOf(step);
    setStep(currentSteps[Math.min(currentIndex + 1, currentSteps.length - 1)]);
    setError('');
  }

  function goBack() {
    const currentSteps = buildSteps(answers);
    const currentIndex = currentSteps.indexOf(step);
    setStep(currentSteps[Math.max(currentIndex - 1, 0)]);
    setError('');
  }

  function setAge(value: string) {
    const parsed = Number(value);
    update({ age: Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined });
  }

  function toggleAnatomy(key: keyof AssessmentAnswers['anatomy']) {
    setAnswers((prev) => {
      const anatomy = { ...prev.anatomy };
      if (key === 'none' || key === 'unknown') {
        const nextValue = !anatomy[key];
        return {
          ...prev,
          anatomy: {
            breastScreeningApplies: false,
            hasCervix: false,
            hasProstate: false,
            none: key === 'none' ? nextValue : false,
            unknown: key === 'unknown' ? nextValue : false,
          },
        };
      }
      anatomy[key] = !anatomy[key];
      anatomy.none = false;
      anatomy.unknown = false;
      return { ...prev, anatomy };
    });
    setError('');
  }

  const packYears = calculatePackYears(answers.packsPerDay, answers.yearsSmoked);
  return (
    <section className="min-h-[calc(100vh-96px)] bg-[var(--color-brand-primary-soft)]/40 py-5 sm:py-8 md:py-12">
      <div className="container-gedi">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-[var(--color-brand-primary)]">Assessment</p>
          <h1 className="display-md mt-3 text-[var(--color-brand-aubergine)]">Check routine screening guidance in a few questions.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)] sm:text-base">
            GEDI estimates routine USPSTF-style screening guidance for breast, cervical, colorectal, lung, and prostate cancer. It does not diagnose cancer.
          </p>
        </div>

        <div className="mx-auto mt-5 max-w-4xl rounded-3xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-gedi)]">
          <div className="border-b border-[var(--color-line)] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-[var(--color-surface)]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-[var(--color-brand-primary)] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-black tabular-nums text-[var(--color-brand-aubergine)]">{stepIndex + 1}/{steps.length}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {step === 'age' ? (
              <QuestionShell title="What is your age?" hint="Use your exact age. Age is required.">
                <label htmlFor="age" className="block font-bold text-[var(--color-brand-aubergine)]">
                  Age
                  <input
                    id="age"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={120}
                    value={answers.age ?? ''}
                    onChange={(event) => setAge(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3 text-lg"
                  />
                </label>
              </QuestionShell>
            ) : null}

            {step === 'anatomy' ? (
              <QuestionShell title="Which of these apply to you? Select all that you know." hint="GEDI uses anatomy-based screening logic instead of relying only on sex assigned at birth.">
                <fieldset>
                  <legend className="sr-only">Anatomy and prior surgery options</legend>
                  <div className="grid gap-2">
                    <CheckboxOption checked={answers.anatomy.breastScreeningApplies} onChange={() => toggleAnatomy('breastScreeningApplies')} label="I was assigned female at birth and have not had both breasts removed" />
                    <CheckboxOption checked={answers.anatomy.hasCervix} onChange={() => toggleAnatomy('hasCervix')} label="I currently have a cervix" />
                    <CheckboxOption checked={answers.anatomy.hasProstate} onChange={() => toggleAnatomy('hasProstate')} label="I currently have a prostate" />
                    <CheckboxOption checked={answers.anatomy.none} onChange={() => toggleAnatomy('none')} label="None of these" />
                    <CheckboxOption checked={answers.anatomy.unknown} onChange={() => toggleAnatomy('unknown')} label="I'm not sure / prefer not to say" />
                  </div>
                </fieldset>
              </QuestionShell>
            ) : null}

            {step === 'routine' ? (
              <RadioGroup<RoutineScreeningIntent>
                title="Is this for routine screening, or do you have symptoms or a previous cancer diagnosis?"
                name="routineIntent"
                value={answers.routineIntent}
                onChange={(value) => update({ routineIntent: value })}
                options={[
                  ['routine', 'Routine screening only, no symptoms'],
                  ['symptoms', "I have symptoms I'm worried about"],
                  ['prior-cancer', 'I have had cancer before'],
                  ['not-sure', "I'm not sure"],
                ]}
              />
            ) : null}

            {step === 'risk' ? (
              <RadioGroup<HighRiskHistory>
                title="Have you ever been told you have a high-risk cancer syndrome or need special screening?"
                name="highRiskHistory"
                value={answers.highRiskHistory}
                onChange={(value) => update({ highRiskHistory: value })}
                options={[
                  ['inherited-syndrome', 'Yes, BRCA1/2, Lynch syndrome, FAP, or another inherited cancer syndrome'],
                  ['strong-family-history', 'Strong family history of breast, ovarian, tubal, peritoneal, colorectal, or pancreatic cancer'],
                  ['no', 'No'],
                  ['not-sure', 'Not sure'],
                ]}
              />
            ) : null}

            {step === 'lungPackYears' ? (
              <RadioGroup<SmokingPackYears>
                title="Have you smoked at least 20 pack-years?"
                hint="A pack-year means 1 pack per day for 1 year. Examples: 1 pack/day for 20 years, 2 packs/day for 10 years, or 1/2 pack/day for 40 years."
                name="lungPackYears"
                value={answers.lungPackYears}
                onChange={(value) => update({ lungPackYears: value, packsPerDay: undefined, yearsSmoked: undefined, smokingStatus: undefined })}
                options={[
                  ['yes-20-plus', 'Yes, 20 pack-years or more'],
                  ['no', 'No'],
                  ['not-sure-calculate', 'Not sure, help me calculate'],
                ]}
              />
            ) : null}

            {step === 'packCalculator' ? (
              <QuestionShell title="Estimate your pack-years" hint="GEDI calculates pack-years as average packs per day times total years smoked.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label htmlFor="packs-per-day" className="font-bold text-[var(--color-brand-aubergine)]">
                    Average packs per day
                    <input id="packs-per-day" type="number" min={0} max={10} step={0.25} value={answers.packsPerDay ?? ''} onChange={(event) => update({ packsPerDay: numericValue(event.target.value) })} className="mt-2 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3" />
                  </label>
                  <label htmlFor="years-smoked" className="font-bold text-[var(--color-brand-aubergine)]">
                    Total years smoked
                    <input id="years-smoked" type="number" min={0} max={100} step={0.5} value={answers.yearsSmoked ?? ''} onChange={(event) => update({ yearsSmoked: numericValue(event.target.value) })} className="mt-2 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3" />
                  </label>
                </div>
                <p className="mt-4 rounded-2xl bg-[var(--color-surface)] p-4 text-sm font-black text-[var(--color-brand-aubergine)]">
                  Calculated pack-years: {packYears === undefined ? 'enter both values' : packYears.toFixed(1)}
                </p>
              </QuestionShell>
            ) : null}

            {step === 'smokingStatus' ? (
              <RadioGroup<SmokingStatus>
                title="Which best describes your smoking now?"
                name="smokingStatus"
                value={answers.smokingStatus}
                onChange={(value) => update({ smokingStatus: value })}
                options={[
                  ['current', 'I currently smoke'],
                  ['quit-within-15', 'I quit within the past 15 years'],
                  ['quit-more-than-15', 'I quit more than 15 years ago'],
                  ['not-sure', "I'm not sure"],
                ]}
              />
            ) : null}

            {step === 'cervicalPrior' ? (
              <RadioGroup<PriorScreeningAnswer>
                title="Have you had regular normal Pap or HPV tests before?"
                name="priorCervicalScreening"
                value={answers.priorCervicalScreening}
                onChange={(value) => update({ priorCervicalScreening: value })}
                options={[
                  ['yes', 'Yes'],
                  ['no', 'No'],
                  ['not-sure', 'Not sure'],
                ]}
              />
            ) : null}

            {step === 'colorectalPrior' ? (
              <RadioGroup<PriorScreeningAnswer>
                title="Have you been screened for colorectal cancer before?"
                name="priorColorectalScreening"
                value={answers.priorColorectalScreening}
                onChange={(value) => update({ priorColorectalScreening: value })}
                options={[
                  ['yes', 'Yes'],
                  ['no', 'No'],
                  ['not-sure', 'Not sure'],
                ]}
              />
            ) : null}

            {step === 'results' ? (
              <ResultsView
                results={evaluation.results}
                alerts={evaluation.alerts}
                hasPrimaryCare={hasPrimaryCare}
                setHasPrimaryCare={setHasPrimaryCare}
              />
            ) : null}

            {error ? (
              <p className="mt-4 rounded-2xl bg-[var(--color-discuss)] p-3 text-sm font-bold text-[var(--color-discuss-ink)]" role="alert" aria-live="assertive">
                {error}
              </p>
            ) : null}

            {step !== 'results' ? (
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={goBack} disabled={stepIndex === 0}>
                  Back
                </button>
                <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={goNext}>
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function buildSteps(answers: AssessmentAnswers): StepKey[] {
  const steps: StepKey[] = ['age', 'anatomy', 'routine', 'risk'];
  const age = answers.age;
  if (age !== undefined && age >= 50 && age <= 80) {
    steps.push('lungPackYears');
    if (answers.lungPackYears === 'not-sure-calculate') steps.push('packCalculator');
    const packYears = answers.lungPackYears === 'yes-20-plus' ? 20 : calculatePackYears(answers.packsPerDay, answers.yearsSmoked);
    if ((packYears ?? 0) >= 20) steps.push('smokingStatus');
  }
  if (age !== undefined && age >= 66 && answers.anatomy.hasCervix) steps.push('cervicalPrior');
  if (age !== undefined && age >= 76 && age <= 85) steps.push('colorectalPrior');
  steps.push('results');
  return steps;
}

function validateStep(step: StepKey, answers: AssessmentAnswers) {
  if (step === 'age') {
    if (answers.age === undefined || answers.age < 1 || answers.age > 120) return 'Enter an age between 1 and 120.';
  }
  if (step === 'anatomy') {
    const values = Object.values(answers.anatomy);
    if (!values.some(Boolean)) return 'Select at least one option.';
  }
  if (step === 'routine' && !answers.routineIntent) return 'Choose the option that best fits.';
  if (step === 'risk' && !answers.highRiskHistory) return 'Choose the option that best fits.';
  if (step === 'lungPackYears' && !answers.lungPackYears) return 'Choose a pack-year option.';
  if (step === 'packCalculator') {
    if ((answers.packsPerDay ?? 0) <= 0 || (answers.yearsSmoked ?? 0) <= 0) return 'Enter packs per day and total years smoked.';
  }
  if (step === 'smokingStatus' && !answers.smokingStatus) return 'Choose the option that best fits.';
  if (step === 'cervicalPrior' && !answers.priorCervicalScreening) return 'Choose the option that best fits.';
  if (step === 'colorectalPrior' && !answers.priorColorectalScreening) return 'Choose the option that best fits.';
  return '';
}

function QuestionShell({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="assessment-question display-md text-[var(--color-brand-aubergine)]">{title}</legend>
      {hint ? <p className="mt-3 rounded-2xl bg-[var(--color-surface)] p-4 text-sm font-semibold leading-6 text-[var(--color-brand-aubergine)]">{hint}</p> : null}
      <div className="mt-5">{children}</div>
    </fieldset>
  );
}

function RadioGroup<T extends string>({
  title,
  hint,
  name,
  value,
  onChange,
  options,
}: {
  title: string;
  hint?: string;
  name: string;
  value?: T;
  onChange: (value: T) => void;
  options: Array<[T, string]>;
}) {
  return (
    <QuestionShell title={title} hint={hint}>
      <div className="grid gap-2" role="radiogroup" aria-label={title}>
        {options.map(([optionValue, label]) => (
          <label key={optionValue}>
            <input className="chip-input" type="radio" name={name} checked={value === optionValue} onChange={() => onChange(optionValue)} />
            <span className="chip-label">{label}</span>
          </label>
        ))}
      </div>
    </QuestionShell>
  );
}

function CheckboxOption({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label>
      <input className="chip-input" type="checkbox" checked={checked} onChange={onChange} />
      <span className="chip-label">{label}</span>
    </label>
  );
}

function ResultsView({
  results,
  alerts,
  hasPrimaryCare,
  setHasPrimaryCare,
}: {
  results: ScreeningResult[];
  alerts: ReturnType<typeof evaluateScreening>['alerts'];
  hasPrimaryCare?: boolean;
  setHasPrimaryCare: (value: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-[var(--color-brand-primary)]" />
        <div>
          <h2 className="display-md text-[var(--color-brand-aubergine)]">Your routine screening information</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
            This tool is educational and does not diagnose cancer or replace medical advice. Screening recommendations can change based on symptoms, personal history, family history, prior test results, and insurance details.
          </p>
        </div>
      </div>

      {alerts.length ? (
        <div className="mt-6 grid gap-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex gap-3 rounded-2xl bg-[var(--color-discuss)] p-4 text-[var(--color-discuss-ink)]">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-bold leading-6">{alert.message}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {results.map((item) => (
          <ResultCard key={item.cancerType} item={item} />
        ))}
      </div>

      <section className="mt-8 rounded-3xl bg-[var(--color-surface)] p-4 sm:p-5">
        <h3 className="text-lg font-black text-[var(--color-brand-aubergine)]">Next steps</h3>
        <fieldset className="mt-4">
          <legend className="font-bold text-[var(--color-brand-aubergine)]">Do you have a regular primary care clinician?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" aria-pressed={hasPrimaryCare === true} className={`rounded-2xl border p-3 text-left font-bold ${hasPrimaryCare === true ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)]' : 'border-[var(--color-line)] bg-white'}`} onClick={() => setHasPrimaryCare(true)}>Yes</button>
            <button type="button" aria-pressed={hasPrimaryCare === false} className={`rounded-2xl border p-3 text-left font-bold ${hasPrimaryCare === false ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)]' : 'border-[var(--color-line)] bg-white'}`} onClick={() => setHasPrimaryCare(false)}>No</button>
          </div>
        </fieldset>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to="/guidelines" className="btn btn-primary">
            Review guideline details <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/assessment" reloadDocument className="btn btn-secondary">Start over</Link>
        </div>
      </section>
    </div>
  );
}

function ResultCard({ item }: { item: ScreeningResult }) {
  return (
    <article className="rounded-3xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-gedi)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--color-brand-primary)]">{cancerLabels[item.cancerType]}</p>
          <h3 className="mt-1 text-xl font-black text-[var(--color-brand-aubergine)]">{item.title}</h3>
        </div>
        <span className={`w-max rounded-full px-3 py-1.5 text-xs font-black ${statusClasses[item.status]}`}>{item.statusLabel}</span>
      </div>
      {item.routineInfoOnly ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brand-sky)]/35 px-3 py-2 text-xs font-black text-[var(--color-brand-navy)]">
          <Info className="h-4 w-4" /> Routine screening information only
        </p>
      ) : null}
      <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">{item.explanation}</p>
      <p className="mt-4 rounded-2xl bg-[var(--color-surface)] p-3 text-sm font-bold text-[var(--color-brand-aubergine)]">
        Suggested next step: {item.nextStep}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">
        If this is preventive screening, it may be covered at no cost depending on your health plan, network, and whether the visit is preventive or diagnostic.
      </p>
    </article>
  );
}

function numericValue(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
