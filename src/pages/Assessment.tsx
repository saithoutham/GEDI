import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancerTypes, derivePlan, screenings, type Answers, type CancerType, type FamilyCancer } from '../lib/gedi';

type StepKey = 'age' | 'family' | 'familyCancers' | 'sex' | 'organs' | 'smoking' | 'smokingDetails' | 'pcp' | 'addons' | 'zip';

type DraftAnswers = Omit<Answers, 'ageBracket' | 'familyHistory' | 'sexAtBirth' | 'smoked100Plus' | 'hasPCP'> & {
  ageBracket?: Answers['ageBracket'];
  familyHistory: {
    any?: boolean;
    cancers: FamilyCancer[];
  };
  sexAtBirth?: Answers['sexAtBirth'];
  smoked100Plus?: boolean;
  hasPCP?: boolean;
};

const initialAnswers: DraftAnswers = {
  familyHistory: { cancers: [] },
  organs: [],
  exposureRisks: false,
  additionalInterest: [],
};

const ageOptions: Answers['ageBracket'][] = ['18-20', '21-24', '25-29', '30-39', '40-44', '45-49', '50-54', '55-64', '65-69', '70-74', '75-80', '81+'];

export default function Assessment() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<DraftAnswers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = useMemo<StepKey[]>(() => {
    const list: StepKey[] = ['age', 'family'];
    if (answers.familyHistory.any === true) list.push('familyCancers');
    list.push('sex');
    if (answers.sexAtBirth === 'intersex' || answers.sexAtBirth === 'prefer-not') list.push('organs');
    list.push('smoking');
    if (answers.smoked100Plus === true) list.push('smokingDetails');
    list.push('pcp', 'addons', 'zip');
    return list;
  }, [answers.familyHistory.any, answers.sexAtBirth, answers.smoked100Plus]);

  const current = steps[Math.min(step, steps.length - 1)];
  const progress = Math.round(((Math.min(step, steps.length - 1) + 1) / steps.length) * 100);

  function advance(delay = 180) {
    window.setTimeout(() => {
      if (step < steps.length - 1) setStep((value) => value + 1);
      else submit();
    }, delay);
  }

  function update(partial: Partial<DraftAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
  }

  function choose(partial: Partial<DraftAnswers>) {
    update(partial);
    advance();
  }

  function toggleFamilyCancer(type: FamilyCancer) {
    setAnswers((prev) => ({
      ...prev,
      familyHistory: {
        ...prev.familyHistory,
        cancers: prev.familyHistory.cancers.includes(type)
          ? prev.familyHistory.cancers.filter((item) => item !== type)
          : [...prev.familyHistory.cancers, type],
      },
    }));
  }

  function toggleAddon(type: CancerType) {
    setAnswers((prev) => ({
      ...prev,
      additionalInterest: prev.additionalInterest.includes(type)
        ? prev.additionalInterest.filter((item) => item !== type)
        : [...prev.additionalInterest, type],
    }));
  }

  function toggleOrgan(organ: 'breasts' | 'cervix' | 'prostate') {
    setAnswers((prev) => ({
      ...prev,
      organs: prev.organs.includes(organ) ? prev.organs.filter((item) => item !== organ) : [...prev.organs, organ],
    }));
  }

  function submit() {
    const finalAnswers = normalizeAnswers(answers);
    if (!finalAnswers) return;
    setLoading(true);
    const uuid = crypto.randomUUID();
    const plan = derivePlan(finalAnswers);
    sessionStorage.setItem('gedi-guide-id', uuid);
    sessionStorage.setItem(`gedi-guide-${uuid}`, JSON.stringify({ answers: finalAnswers, plan, createdAt: new Date().toISOString() }));
    window.setTimeout(() => navigate('/guide'), 1500);
  }

  if (!started) {
    return (
      <section className="min-h-[calc(100vh-112px)] bg-[var(--color-surface)] px-4 py-8 sm:py-14">
        <div className="container-gedi grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow text-[var(--color-brand-primary)]">Assessment</p>
            <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">A screening plan without the scavenger hunt.</h1>
            <p className="body-lg mt-5 max-w-2xl text-[var(--color-ink-muted)]">
              Answer a few questions. GEDI checks multiple screening pathways at once and saves the plan in this browser session.
            </p>
            <button type="button" className="btn btn-primary mt-8 w-full sm:w-auto" onClick={() => setStarted(true)}>
              Start
            </button>
          </div>
          <figure className="overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-white shadow-[var(--shadow-gedi)] sm:rounded-[28px]">
            <img src="/community/alcsi-outreach.jpeg" alt="ALCSI volunteers holding a lung cancer awareness ribbon" className="aspect-square w-full object-cover" />
          </figure>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-112px)] items-center justify-center bg-[var(--color-surface)] px-6" aria-live="polite">
        <div className="card max-w-xl p-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-brand-primary-soft)]">
            <span className="font-display text-4xl text-[var(--color-brand-primary)]">G</span>
          </div>
          <h1 className="display-md mt-8 text-[var(--color-brand-aubergine)]">Building your plan...</h1>
          <p className="mt-3 text-[var(--color-ink-muted)]">Your answers stay in this browser session.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-112px)] bg-[var(--color-brand-primary-soft)]/45">
      <div className="sticky top-20 z-20 border-b border-[var(--color-line)] bg-[rgba(241,233,218,0.96)] backdrop-blur md:top-28">
        <div className="container-gedi flex h-12 items-center gap-3 sm:h-14 sm:gap-4">
          <div className="h-2 flex-1 rounded-full bg-white" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Step ${step + 1} of ${steps.length}`}>
            <div className="h-full rounded-full bg-[var(--color-brand-primary)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-bold tabular-nums">{step + 1}/{steps.length}</span>
        </div>
      </div>

      <div className="container-gedi flex min-h-[calc(100vh-156px)] items-start justify-center py-5 sm:py-8 md:min-h-[calc(100vh-166px)] md:items-center md:py-10">
        <div className="card w-full max-w-3xl rounded-[18px] p-4 sm:p-6 md:rounded-[24px] md:p-10" role="form" aria-live="polite">
          <StepContent
            current={current}
            answers={answers}
            choose={choose}
            update={update}
            done={advance}
            build={submit}
            toggleFamilyCancer={toggleFamilyCancer}
            toggleAddon={toggleAddon}
            toggleOrgan={toggleOrgan}
          />
        </div>
      </div>
    </section>
  );
}

type StepContentProps = {
  current: StepKey;
  answers: DraftAnswers;
  choose: (partial: Partial<DraftAnswers>) => void;
  update: (partial: Partial<DraftAnswers>) => void;
  done: () => void;
  build: () => void;
  toggleFamilyCancer: (type: FamilyCancer) => void;
  toggleAddon: (type: CancerType) => void;
  toggleOrgan: (organ: 'breasts' | 'cervix' | 'prostate') => void;
};

function StepContent({ current, answers, choose, update, done, build, toggleFamilyCancer, toggleAddon, toggleOrgan }: StepContentProps) {
  const smokingDetailsComplete = isSmokingDetailsComplete(answers);

  if (current === 'age') {
    return (
      <fieldset>
        <QuestionHeader fact="Screening recommendations change sharply by age.">
          What is your age?
        </QuestionHeader>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:gap-3">
          {ageOptions.map((option) => (
            <Chip key={option} name="age" checked={answers.ageBracket === option} onChange={() => choose({ ageBracket: option })} label={option} />
          ))}
        </div>
      </fieldset>
    );
  }

  if (current === 'family') {
    return (
      <fieldset>
        <QuestionHeader fact="Family history can move a screening conversation earlier.">
          Has an immediate family member had cancer before age 65?
        </QuestionHeader>
        <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
          <Chip name="family" checked={answers.familyHistory.any === true} onChange={() => choose({ familyHistory: { ...answers.familyHistory, any: true } })} label="Yes" />
          <Chip name="family" checked={answers.familyHistory.any === false} onChange={() => choose({ familyHistory: { any: false, cancers: [] } })} label="No or not sure" />
        </div>
      </fieldset>
    );
  }

  if (current === 'familyCancers') {
    return (
      <fieldset>
        <QuestionHeader fact="Select every cancer type that applies. Choose Other if you are not sure.">
          Which cancers were they diagnosed with?
        </QuestionHeader>
        <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
          {(['breast', 'cervical', 'colorectal', 'lung', 'prostate', 'ovarian', 'other'] as FamilyCancer[]).map((type) => (
            <Chip key={type} name={`family-${type}`} type="checkbox" checked={answers.familyHistory.cancers.includes(type)} onChange={() => toggleFamilyCancer(type)} label={type in screenings ? screenings[type as CancerType].shortName : type === 'ovarian' ? 'Ovarian' : 'Other'} />
          ))}
        </div>
        <button type="button" className="btn btn-primary mt-5 w-full sm:mt-7 sm:w-auto" onClick={() => done()} disabled={!answers.familyHistory.cancers.length}>Done</button>
      </fieldset>
    );
  }

  if (current === 'sex') {
    return (
      <fieldset>
        <QuestionHeader fact="Some screening recommendations depend on anatomy.">
          What sex were you assigned at birth?
        </QuestionHeader>
        <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
          {[
            ['female', 'Female'],
            ['male', 'Male'],
            ['intersex', 'Intersex / DSD'],
            ['prefer-not', 'Prefer not to say'],
          ].map(([value, label]) => (
            <Chip key={value} name="sex" checked={answers.sexAtBirth === value} onChange={() => choose({ sexAtBirth: value as Answers['sexAtBirth'] })} label={label} />
          ))}
        </div>
      </fieldset>
    );
  }

  if (current === 'organs') {
    return (
      <fieldset>
        <QuestionHeader fact="This makes cervical, breast, and prostate screening logic more accurate.">
          Do any of these apply?
        </QuestionHeader>
        <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
          {[
            ['breasts', 'Breasts'],
            ['cervix', 'Cervix'],
            ['prostate', 'Prostate'],
          ].map(([value, label]) => (
            <Chip key={value} name={`organ-${value}`} type="checkbox" checked={answers.organs.includes(value as 'breasts' | 'cervix' | 'prostate')} onChange={() => toggleOrgan(value as 'breasts' | 'cervix' | 'prostate')} label={label} />
          ))}
          <Chip name="organ-none" type="checkbox" checked={false} onChange={() => update({ organs: [] })} label="None of these" />
        </div>
        <button type="button" className="btn btn-primary mt-5 w-full sm:mt-7 sm:w-auto" onClick={() => done()}>Done</button>
      </fieldset>
    );
  }

  if (current === 'smoking') {
    return (
      <fieldset>
        <QuestionHeader fact="Smoking history drives current lung screening eligibility.">
          Have you ever smoked before?
        </QuestionHeader>
        <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
          <Chip name="smoking" checked={answers.smoked100Plus === true} onChange={() => choose({ smoked100Plus: true })} label="Yes" />
          <Chip name="smoking" checked={answers.smoked100Plus === false} onChange={() => choose({ smoked100Plus: false, currentlySmokes: undefined, packsPerDay: undefined, yearsSmoked: undefined, packYears: undefined, quitYearsAgo: undefined })} label="No" />
        </div>
      </fieldset>
    );
  }

  if (current === 'smokingDetails') {
    return (
      <fieldset>
        <QuestionHeader fact="USPSTF lung screening eligibility uses age, pack-years, and whether smoking is current or ended within the past 15 years.">
          About how much smoking history?
        </QuestionHeader>
        <div className="mt-5 grid gap-4 sm:mt-7 sm:grid-cols-2 sm:gap-5">
          <label className="font-bold text-[var(--color-brand-aubergine)]">
            Packs per day
            <input type="number" min={0} max={5} step={0.25} value={answers.packsPerDay ?? ''} onChange={(event) => updateSmokingHistory({ ...answers, packsPerDay: numberOrUndefined(event.target.value) }, update)} className="mt-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-2.5 sm:py-3" />
            <span className="mt-2 block text-sm font-normal text-[var(--color-ink-muted)]">Use decimals if needed, like 0.5 for half a pack.</span>
          </label>
          <label className="font-bold text-[var(--color-brand-aubergine)]">
            Years smoked
            <input type="number" min={0} max={80} step={0.5} value={answers.yearsSmoked ?? ''} onChange={(event) => updateSmokingHistory({ ...answers, yearsSmoked: numberOrUndefined(event.target.value) }, update)} className="mt-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-2.5 sm:py-3" />
          </label>
        </div>
        <div className="mt-5">
          <p className="font-bold text-[var(--color-brand-aubergine)]">Which best describes your smoking now?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={answers.currentlySmokes === true}
              className={`min-h-14 rounded-2xl border px-4 text-left font-black ${
                answers.currentlySmokes === true
                  ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-aubergine)]'
                  : 'border-[var(--color-line)] bg-white text-[var(--color-brand-aubergine)]'
              }`}
              onClick={() => update({ currentlySmokes: true, quitYearsAgo: 0 })}
            >
              I smoke now
            </button>
            <button
              type="button"
              aria-pressed={answers.currentlySmokes === false}
              className={`min-h-14 rounded-2xl border px-4 text-left font-black ${
                answers.currentlySmokes === false
                  ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-aubergine)]'
                  : 'border-[var(--color-line)] bg-white text-[var(--color-brand-aubergine)]'
              }`}
              onClick={() => update({ currentlySmokes: false, quitYearsAgo: undefined })}
            >
              I quit
            </button>
          </div>
        </div>
        {answers.currentlySmokes === false ? (
          <label className="mt-5 block font-bold text-[var(--color-brand-aubergine)]">
            How many years ago did you quit?
            <input type="number" min={0} max={60} value={answers.quitYearsAgo ?? ''} onChange={(event) => update({ quitYearsAgo: numberOrUndefined(event.target.value) })} className="mt-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-2.5 sm:py-3" />
          </label>
        ) : null}
        {answers.currentlySmokes === true ? (
          <p className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4 text-sm font-bold text-[var(--color-brand-aubergine)]">
            Smoking now selected. No quit-year entry is needed.
          </p>
        ) : null}
        <p className="mt-5 rounded-2xl bg-[var(--color-surface)] p-4 text-sm font-bold text-[var(--color-brand-aubergine)]">
          Calculated pack-years: {formatPackYears(answers.packYears)}
        </p>
        <button type="button" className="btn btn-primary mt-5 w-full sm:mt-7 sm:w-auto" onClick={() => done()} disabled={!smokingDetailsComplete}>Use this</button>
      </fieldset>
    );
  }

  if (current === 'pcp') {
    return (
      <fieldset>
        <QuestionHeader fact="Some screenings require an order or referral.">
          Do you have a regular primary care clinician?
        </QuestionHeader>
        <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
          <Chip name="pcp" checked={answers.hasPCP === true} onChange={() => choose({ hasPCP: true })} label="Yes" />
          <Chip name="pcp" checked={answers.hasPCP === false} onChange={() => choose({ hasPCP: false })} label="No" />
        </div>
      </fieldset>
    );
  }

  if (current === 'addons') {
    return (
      <fieldset>
        <QuestionHeader fact="Add any screening you want to learn about, even if it is not formally recommended for you.">
          Any other screenings?
        </QuestionHeader>
        <div className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-2 sm:gap-3">
          {cancerTypes.map((type) => (
            <Chip key={type} name={`addon-${type}`} type="checkbox" checked={answers.additionalInterest.includes(type)} onChange={() => toggleAddon(type)} label={screenings[type].shortName} />
          ))}
        </div>
        <button type="button" className="btn btn-primary mt-5 w-full sm:mt-7 sm:w-auto" onClick={() => done()}>Done</button>
      </fieldset>
    );
  }

  return (
    <fieldset>
      <QuestionHeader fact="ZIP code is optional. It only pre-fills the locator. You can also use your current location on the locator page.">
        Want centers near you?
      </QuestionHeader>
      <label className="mt-5 block font-bold text-[var(--color-brand-aubergine)] sm:mt-7">
        ZIP code
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={answers.zip ?? ''}
          onChange={(event) => update({ zip: event.target.value })}
          placeholder="Optional"
          className="mt-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-2.5 sm:py-3"
        />
      </label>
      <button type="button" className="btn btn-primary mt-5 w-full sm:mt-7 sm:w-auto" onClick={build}>Build my guide</button>
    </fieldset>
  );
}

function normalizeAnswers(answers: DraftAnswers): Answers | null {
  if (!answers.ageBracket || answers.familyHistory.any === undefined || !answers.sexAtBirth || answers.smoked100Plus === undefined || answers.hasPCP === undefined) {
    return null;
  }

  const quitYearsAgo = answers.smoked100Plus
    ? answers.currentlySmokes
      ? 0
      : answers.quitYearsAgo
    : undefined;

  return {
    ...answers,
    ageBracket: answers.ageBracket,
    familyHistory: {
      any: answers.familyHistory.any,
      cancers: answers.familyHistory.any ? answers.familyHistory.cancers : [],
    },
    sexAtBirth: answers.sexAtBirth,
    smoked100Plus: answers.smoked100Plus,
    currentlySmokes: answers.smoked100Plus ? answers.currentlySmokes : undefined,
    packYears: answers.smoked100Plus ? calculatePackYears(answers.packsPerDay, answers.yearsSmoked) : undefined,
    quitYearsAgo,
    hasPCP: answers.hasPCP,
  };
}

function numberOrUndefined(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function calculatePackYears(packsPerDay?: number, yearsSmoked?: number) {
  if (packsPerDay === undefined || yearsSmoked === undefined) return undefined;
  return Math.round(packsPerDay * yearsSmoked * 10) / 10;
}

function isSmokingDetailsComplete(answers: DraftAnswers) {
  const hasPackYears = (answers.packsPerDay ?? 0) > 0 && (answers.yearsSmoked ?? 0) > 0;
  const hasCurrentStatus = answers.currentlySmokes === true || answers.currentlySmokes === false;
  const hasQuitYears = answers.currentlySmokes === true || (answers.quitYearsAgo !== undefined && answers.quitYearsAgo >= 0);
  return hasPackYears && hasCurrentStatus && hasQuitYears;
}

function updateSmokingHistory(next: DraftAnswers, update: (partial: Partial<DraftAnswers>) => void) {
  update({
    packsPerDay: next.packsPerDay,
    yearsSmoked: next.yearsSmoked,
    packYears: calculatePackYears(next.packsPerDay, next.yearsSmoked),
  });
}

function formatPackYears(packYears?: number) {
  return packYears === undefined ? 'Enter packs per day and years smoked' : packYears.toFixed(1);
}

function QuestionHeader({ children, fact }: { children: React.ReactNode; fact: string }) {
  return (
    <>
      <legend className="assessment-question display-md w-full text-[var(--color-brand-aubergine)]">{children}</legend>
      <Fact>{fact}</Fact>
    </>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <div className="assessment-fact mt-5 flex items-start gap-3 rounded-2xl bg-[var(--color-surface)] p-4 text-sm font-semibold leading-6 text-[var(--color-brand-aubergine)]">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-primary)]" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

function Chip({
  label,
  name,
  checked,
  onChange,
  type = 'radio',
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  type?: 'radio' | 'checkbox';
}) {
  const id = `${name}-${label}`.replace(/\s+/g, '-').toLowerCase();
  return (
    <label>
      <input id={id} className="chip-input" type={type} name={name} checked={checked} onChange={onChange} />
      <span className="chip-label">{label}</span>
    </label>
  );
}
