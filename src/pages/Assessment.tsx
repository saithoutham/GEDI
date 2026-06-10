import { AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react';
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

export default function Assessment() {
  const [answers, setAnswers] = useState<AssessmentAnswers>(initialAnswers);
  const packYears = calculatePackYears(answers.packsPerDay, answers.yearsSmoked);
  const evaluation = evaluateScreening(answers);

  function update(partial: Partial<AssessmentAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
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
  }

  return (
    <section className="min-h-[calc(100vh-96px)] bg-[var(--color-brand-primary-soft)]/40 py-5 sm:py-8 md:py-12">
      <div className="container-gedi">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow text-[var(--color-brand-primary)]">Assessment</p>
          <h1 className="display-md mt-3 text-[var(--color-brand-aubergine)]">Cancer screening eligibility intake.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)] sm:text-base">
            This intake uses demographics, smoking history, anatomy, and selected risk factors to summarize screening topics to discuss with a licensed clinician. It is educational and does not diagnose cancer.
          </p>
        </div>

        <div className="mx-auto mt-5 grid max-w-5xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
            <FormSection title="Participant demographics">
              <RadioRow
                label="Do you want to be contacted about screening information?"
                value={answers.contactConsent ? 'yes' : 'no'}
                onChange={(value) => update({ contactConsent: value === 'yes' })}
                options={[
                  ['yes', 'Yes'],
                  ['no', 'No'],
                ]}
              />
              {answers.contactConsent ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Participant name (first, last)" value={answers.participantName ?? ''} onChange={(value) => update({ participantName: value })} required />
                  <TextField label="Participant phone number" value={answers.phoneNumber ?? ''} onChange={(value) => update({ phoneNumber: value })} inputMode="tel" required />
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField label="Participant age" value={answers.age ?? ''} onChange={setAge} min={0} max={120} required />
                <TextField label="If race is other, please specify" value={answers.raceOther ?? ''} onChange={(value) => update({ raceOther: value })} />
              </div>
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
              <CheckboxGroup title="Race (select all that apply)" required>
                {(Object.keys(raceLabels) as RaceOption[]).map((race) => (
                  <CheckboxRow key={race} checked={answers.race.includes(race)} onChange={() => toggleRace(race)} label={raceLabels[race]} />
                ))}
              </CheckboxGroup>
            </FormSection>

            <FormSection title="Clinical context">
              <RadioRow<RoutineScreeningIntent>
                label="Is this for routine screening, or are there symptoms or prior cancer history?"
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
              <RadioRow
                label="Have you ever been told you have an inherited cancer syndrome or need special screening?"
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
              <CheckboxGroup title="Anatomy and procedure history">
                <CheckboxRow checked={answers.anatomy.breastScreeningApplies} onChange={() => toggleAnatomy('breastScreeningApplies')} label="Breast screening applies to me" />
                <CheckboxRow checked={answers.anatomy.hasCervix} onChange={() => toggleAnatomy('hasCervix')} label="I currently have a cervix" />
                <CheckboxRow checked={answers.cervicalRisk.cervixRemoved} onChange={() => toggleRisk('cervicalRisk', 'cervixRemoved')} label="My cervix was removed for a non-cancer reason" />
                <CheckboxRow checked={answers.anatomy.hasProstate} onChange={() => toggleAnatomy('hasProstate')} label="I currently have a prostate" />
                <CheckboxRow checked={answers.anatomy.unknown} onChange={() => toggleAnatomy('unknown')} label="I am not sure which anatomy-based screenings apply" />
              </CheckboxGroup>
              <RadioRow
                label="Have you had regular normal Pap or HPV tests in the past?"
                value={answers.priorCervicalScreening}
                onChange={(value) => update({ priorCervicalScreening: value })}
                options={[
                  ['yes', 'Yes'],
                  ['no', 'No'],
                  ['not-sure', 'Not sure'],
                ]}
              />
              <RadioRow
                label="Have you ever completed colorectal cancer screening?"
                value={answers.priorColorectalScreening}
                onChange={(value) => update({ priorColorectalScreening: value })}
                options={[
                  ['yes', 'Yes'],
                  ['no', 'No'],
                  ['not-sure', 'Not sure'],
                ]}
              />
            </FormSection>

            <FormSection title="Smoking status">
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
              {answers.smokingStatus === 'current' || answers.smokingStatus === 'former' ? (
                <>
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
                </>
              ) : null}
              <CheckboxGroup title="Lung-specific risk and safety questions">
                <RiskCheckbox group="lungRisk" field="symptoms" answers={answers} onChange={toggleRisk} label="New/worsening cough, coughing blood, unexplained weight loss, or other concerning lung symptoms" />
                <RiskCheckbox group="lungRisk" field="healthLimitsCurativeTreatment" answers={answers} onChange={toggleRisk} label="Major health problem that would substantially limit life expectancy or ability/willingness to have curative lung surgery" />
                <RiskCheckbox group="lungRisk" field="copdOrPulmonaryFibrosis" answers={answers} onChange={toggleRisk} label="COPD, emphysema, or pulmonary fibrosis" />
                <RiskCheckbox group="lungRisk" field="occupationalExposure" answers={answers} onChange={toggleRisk} label="Significant exposure to asbestos, radon, arsenic, silica, diesel exhaust, or similar carcinogens" />
                <RiskCheckbox group="lungRisk" field="otherSmokingRelatedCancer" answers={answers} onChange={toggleRisk} label="Prior smoking-related cancer such as bladder, head, or neck cancer" />
              </CheckboxGroup>
            </FormSection>

            <FormSection title="Cancer-specific eligibility questions">
              <QuestionPanel title="Breast cancer">
                <RiskCheckbox group="breastRisk" field="personalHistoryOrHighRiskLesion" answers={answers} onChange={toggleRisk} label="Personal history of breast cancer or a high-risk breast lesion" />
                <RiskCheckbox group="breastRisk" field="geneticMutation" answers={answers} onChange={toggleRisk} label="Known BRCA1/2, PALB2, PTEN, or similar mutation in self or close family" />
                <RiskCheckbox group="breastRisk" field="chestRadiationYoung" answers={answers} onChange={toggleRisk} label="Chest radiation between about ages 10 and 30" />
                <RiskCheckbox group="breastRisk" field="denseBreasts" answers={answers} onChange={toggleRisk} label="Told you have dense breasts on mammogram" />
                <RiskCheckbox group="breastRisk" field="firstDegreeRelativeEarly" answers={answers} onChange={toggleRisk} label="Parent, sibling, or child with breast cancer before age 50" />
              </QuestionPanel>

              <QuestionPanel title="Cervical cancer">
                <RiskCheckbox group="cervicalRisk" field="priorHighGradeLesionOrCancer" answers={answers} onChange={toggleRisk} label="Prior cervical cancer or high-grade cervical precancer" />
                <RiskCheckbox group="cervicalRisk" field="immunocompromised" answers={answers} onChange={toggleRisk} label="HIV, organ transplant, chronic immune suppression, or similar condition" />
                <RiskCheckbox group="cervicalRisk" field="desExposure" answers={answers} onChange={toggleRisk} label="Known DES exposure before birth" />
                <RiskCheckbox group="cervicalRisk" field="adequatePriorScreening" answers={answers} onChange={toggleRisk} label="Age 65+ with adequate prior normal Pap/HPV screening" />
              </QuestionPanel>

              <QuestionPanel title="Colorectal cancer">
                <RiskCheckbox group="colorectalRisk" field="personalHistory" answers={answers} onChange={toggleRisk} label="Personal history of colorectal cancer or adenomatous/high-risk polyps" />
                <RiskCheckbox group="colorectalRisk" field="inflammatoryBowelDisease" answers={answers} onChange={toggleRisk} label="Crohn disease or ulcerative colitis for many years" />
                <RiskCheckbox group="colorectalRisk" field="familyEarly" answers={answers} onChange={toggleRisk} label="First-degree relative with colorectal cancer or advanced adenoma before age 60" />
                <RiskCheckbox group="colorectalRisk" field="familyMultiple" answers={answers} onChange={toggleRisk} label="Two or more first-degree relatives with colorectal cancer at any age" />
                <RiskCheckbox group="colorectalRisk" field="geneticSyndrome" answers={answers} onChange={toggleRisk} label="Known Lynch syndrome, FAP, or similar inherited colorectal cancer syndrome" />
              </QuestionPanel>

              <QuestionPanel title="Prostate cancer">
                <RiskCheckbox group="prostateRisk" field="familyEarly" answers={answers} onChange={toggleRisk} label="Father, brother, or son diagnosed with prostate cancer before age 65" />
                <RiskCheckbox group="prostateRisk" field="familyMultiple" answers={answers} onChange={toggleRisk} label="Multiple family members diagnosed with prostate cancer" />
                <RiskCheckbox group="prostateRisk" field="brcaMutation" answers={answers} onChange={toggleRisk} label="Known BRCA1 or BRCA2 mutation in self or family" />
                <RiskCheckbox group="prostateRisk" field="africanAncestry" answers={answers} onChange={toggleRisk} label="Black or African ancestry" />
                <RiskCheckbox group="prostateRisk" field="priorHighRiskBiopsy" answers={answers} onChange={toggleRisk} label="Prior prostate biopsy with high-risk abnormal result" />
              </QuestionPanel>

              <QuestionPanel title="Liver, skin, and oral/HPV-related cancers">
                <RiskCheckbox group="liverRisk" field="cirrhosis" answers={answers} onChange={toggleRisk} label="Cirrhosis or advanced liver scarring" />
                <RiskCheckbox group="liverRisk" field="hepatitisB" answers={answers} onChange={toggleRisk} label="Chronic hepatitis B" />
                <RiskCheckbox group="liverRisk" field="hepatitisC" answers={answers} onChange={toggleRisk} label="Chronic hepatitis C" />
                <RiskCheckbox group="liverRisk" field="hemochromatosis" answers={answers} onChange={toggleRisk} label="Hereditary hemochromatosis or inherited liver disease risk" />
                <RiskCheckbox group="skinRisk" field="changingLesion" answers={answers} onChange={toggleRisk} label="Changing, bleeding, painful, or unusual mole/skin spot" />
                <RiskCheckbox group="skinRisk" field="personalHistory" answers={answers} onChange={toggleRisk} label="Personal history of melanoma or other skin cancer" />
                <RiskCheckbox group="skinRisk" field="immunosuppressed" answers={answers} onChange={toggleRisk} label="Immune suppression, organ transplant, or long-term immune-suppressing medication" />
                <RiskCheckbox group="skinRisk" field="manyAtypicalMoles" answers={answers} onChange={toggleRisk} label="Many moles or atypical moles" />
                <RiskCheckbox group="skinRisk" field="highUvExposure" answers={answers} onChange={toggleRisk} label="High UV exposure, indoor tanning, or blistering sunburn history" />
                <RiskCheckbox group="oralRisk" field="persistentSymptoms" answers={answers} onChange={toggleRisk} label="Persistent mouth sore, throat pain, swallowing trouble, voice change, or neck lump" />
                <RiskCheckbox group="oralRisk" field="tobaccoOrHeavyAlcohol" answers={answers} onChange={toggleRisk} label="Current or prior tobacco use or heavy alcohol use" />
                <RiskCheckbox group="oralRisk" field="hpvRelatedHistory" answers={answers} onChange={toggleRisk} label="History of HPV-related disease or concern about HPV-related cancer risk" />
              </QuestionPanel>
            </FormSection>
          </form>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <ResultsView results={evaluation.results} alerts={evaluation.alerts} />
          </aside>
        </div>
      </div>
    </section>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-gedi)]">
      <h2 className="border-b border-[var(--color-line)] bg-[var(--color-brand-primary-soft)] px-5 py-3 text-lg font-black text-[var(--color-brand-aubergine)]">
        {title}
      </h2>
      <div className="grid gap-5 p-5">{children}</div>
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
    <div className="rounded-3xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-gedi)]">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-[var(--color-brand-primary)]" />
        <div>
          <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">Eligibility summary</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
            Results update as fields are completed. This is educational and should be reviewed with a licensed clinician.
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
          Enter at least age and demographic details to see screening information.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3">
        <Link to="/guidelines" className="btn btn-primary">
          Review guideline details <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/assessment" reloadDocument className="btn btn-secondary">
          Start over
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
