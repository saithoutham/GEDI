import { ArrowRight, MapPin, Pencil, RotateCcw, Stethoscope } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { derivePlan, scripts, screenings, statusClasses, statusLabels, type Answers, type CancerType, type Plan, type ScreeningRec } from '../lib/gedi';

type SavedGuide = {
  answers: Answers;
  plan: Plan;
  createdAt: string;
};

type CtaOverride = {
  label: string;
  targetCancerTypes: CancerType[];
};

export default function Guide() {
  const saved = useSavedGuide();
  const [openScript, setOpenScript] = useState<CancerType | null>(null);
  const [editing, setEditing] = useState<CancerType | null>(null);
  const guideId = typeof window !== 'undefined' ? sessionStorage.getItem('gedi-guide-id') : null;
  const [overrides, setOverrides] = useState<Record<string, CtaOverride>>(() => {
    if (!guideId) return {};
    const raw = sessionStorage.getItem(`gedi-guide-overrides-${guideId}`);
    return raw ? (JSON.parse(raw) as Record<string, CtaOverride>) : {};
  });

  function saveOverride(type: CancerType, value: CtaOverride) {
    const next = { ...overrides, [type]: value };
    setOverrides(next);
    if (guideId) sessionStorage.setItem(`gedi-guide-overrides-${guideId}`, JSON.stringify(next));
  }

  if (!saved) {
    return (
      <section className="container-gedi py-20">
        <div className="card p-8 md:p-12">
          <p className="eyebrow text-[var(--color-brand-primary)]">No guide in this browser</p>
          <h1 className="display-md mt-3 text-[var(--color-brand-aubergine)]">Start with the assessment.</h1>
          <p className="body-lg mt-4 max-w-2xl text-[var(--color-ink-muted)]">
            GEDI stores answers in sessionStorage only. No saved guide is available in this browser session.
          </p>
          <Link to="/assessment" className="btn btn-primary mt-7">
            Take the assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  const recommendations: ScreeningRec[] = saved.plan.recommendations.length
    ? saved.plan.recommendations
    : (['lung', 'breast', 'cervical', 'colorectal', 'prostate'] as CancerType[]).map((type) => ({
        cancerType: type as CancerType,
        title: screenings[type as CancerType].name,
        test: screenings[type as CancerType].test,
        status: 'info' as const,
        summary: screenings[type as CancerType].description,
        rationale: 'No routine cancer screenings were recommended from your current answers. This card is available for general education.',
        sourceUrl: screenings[type as CancerType].sourceUrl,
      }));

  const familyList = saved.answers.familyHistory.cancers
    .map((type) => (type in screenings ? screenings[type as CancerType].shortName : type === 'ovarian' ? 'Ovarian' : 'Other'))
    .join(', ');
  const headline = familyList
    ? `Based on your age, body-part answers, and family history of ${familyList}, here is your plan.`
    : 'Based on what you shared, here are the screenings to consider.';

  return (
    <section className="container-gedi py-14 md:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-[var(--color-brand-primary)]">Your personalized plan</p>
        <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">{headline}</h1>
        <p className="body-lg mt-5 text-[var(--color-ink-muted)]">
          This guide cites ACS and USPSTF guideline pathways where GEDI has enough information. It also flags active research limitations, especially the Yang Lab’s work on pack-year bias in lung screening.
        </p>
      </div>

      {saved.plan.notes.length ? (
        <div className="mt-8 grid gap-3">
          {saved.plan.notes.map((note) => (
            <p key={note} className="rounded-2xl bg-[var(--color-brand-sky)]/45 p-4 text-sm font-semibold text-[var(--color-brand-navy)]">{note}</p>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-5">
        {recommendations.map((item) => (
          <GuideRecommendationCard
            key={item.cancerType}
            item={item}
            zip={saved.answers.zip}
            override={overrides[item.cancerType]}
            onOpenScript={() => setOpenScript(item.cancerType)}
            onEdit={() => setEditing(item.cancerType)}
          />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="display-md text-[var(--color-brand-aubergine)]">Schedule</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <ScheduleCard title="GEDI Locator" body="Search across multiple screening types without losing your plan context." to="/locate" icon={<MapPin className="h-6 w-6" />} />
          <ScheduleCard title="Book with a clinician" body="Use your plan to ask a primary care clinician or specialist for the screening order you need." />
          <ScheduleCard title="Find on ACS" body="Use the American Cancer Society screening location finder." href="https://getscreened.cancer.org/" />
          <ScheduleCard title="Free / low-cost" body="For breast and cervical screening support, start with CDC's NBCCEDP program directory." href="https://www.cdc.gov/breast-cervical-cancer-screening/about/index.html" />
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link to="/assessment" className="btn btn-secondary">
          <RotateCcw className="h-4 w-4" />
          Retake
        </Link>
        <Link to="/guidelines" className="btn btn-secondary">Add another screening</Link>
      </div>

      {openScript ? <ScriptSheet type={openScript} onClose={() => setOpenScript(null)} /> : null}
      {editing ? (
        <CustomizeDialog
          type={editing}
          current={overrides[editing] ?? { label: `Find a ${screenings[editing].shortName.toLowerCase()} screening center`, targetCancerTypes: [editing] }}
          onClose={() => setEditing(null)}
          onSave={(value) => {
            saveOverride(editing, value);
            setEditing(null);
          }}
        />
      ) : null}
    </section>
  );
}

function GuideRecommendationCard({
  item,
  zip,
  override,
  onOpenScript,
  onEdit,
}: {
  item: ScreeningRec;
  zip?: string;
  override?: CtaOverride;
  onOpenScript: () => void;
  onEdit: () => void;
}) {
  const targets = override?.targetCancerTypes?.length ? override.targetCancerTypes : [item.cancerType];
  const locateParams = new URLSearchParams();
  if (targets.length > 1) locateParams.set('types', targets.join(','));
  if (zip) locateParams.set('zip', zip);
  const locatePath = targets.length === 1 ? `/locate/${targets[0]}` : '/locate';
  const locateHref = `${locatePath}${locateParams.toString() ? `?${locateParams.toString()}` : ''}`;

  return (
    <article className="card p-6 md:p-8">
            <div className="grid gap-5">
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">{item.title}</h2>
                    <p className="mt-1 font-bold text-[var(--color-ink-muted)]">{item.test}</p>
                  </div>
                  <span className={`w-max rounded-full px-4 py-2 text-sm font-black ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span>
                </div>
                <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">{item.summary}</p>
                <details className="mt-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                  <summary className="cursor-pointer font-black text-[var(--color-brand-aubergine)]">Why this screening?</summary>
                  <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{item.rationale}</p>
                  {item.caveats ? <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{item.caveats}</p> : null}
                  <a className="mt-3 inline-flex font-bold text-[var(--color-brand-navy)] underline" href={item.sourceUrl} target="_blank" rel="noreferrer">
                    Source guideline
                  </a>
                </details>
                <div className="mt-6 flex flex-col gap-3 lg:flex-row">
                  <Link to={locateHref} className="btn btn-primary">
                    {override?.label ?? `Find a ${screenings[item.cancerType].shortName.toLowerCase()} screening center`}
                    <MapPin className="h-4 w-4" />
                  </Link>
                  <button type="button" className="btn btn-secondary" onClick={onOpenScript}>
                    What to ask your doctor
                    <Stethoscope className="h-4 w-4" />
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onEdit} aria-label={`Customize ${item.title} CTA`}>
                    <Pencil className="h-4 w-4" />
                    Customize CTA
                  </button>
                  <Link to={`/guide/${item.cancerType}`} className="btn btn-ghost self-center">
                    View full plan <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
  );
}

function useSavedGuide() {
  return useMemo(() => {
    const id = sessionStorage.getItem('gedi-guide-id');
    if (!id) return null;
    const raw = sessionStorage.getItem(`gedi-guide-${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGuide;
    if (!parsed.plan) parsed.plan = derivePlan(parsed.answers);
    return parsed;
  }, []);
}

function ScheduleCard({ title, body, to, href, icon }: { title: string; body: string; to?: string; href?: string; icon?: React.ReactNode }) {
  const content = (
    <article className="card h-full p-5">
      <div className="text-[var(--color-brand-primary)]">{icon}</div>
      <h3 className="mt-3 font-black text-[var(--color-brand-aubergine)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">{body}</p>
    </article>
  );
  if (to) return <Link to={to}>{content}</Link>;
  if (href) return <a href={href} target="_blank" rel="noreferrer">{content}</a>;
  return content;
}

function ScriptSheet({ type, onClose }: { type: CancerType; onClose: () => void }) {
  const script = scripts[type as keyof typeof scripts];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Call script">
      <div className="flex max-h-[min(760px,calc(100vh-32px))] w-full max-w-2xl flex-col rounded-3xl bg-white p-5 shadow-[var(--shadow-gedi)] md:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-4">
          <div>
            <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">What to ask your doctor</h2>
            <p className="mt-1 text-sm font-bold text-[var(--color-ink-muted)]">{screenings[type].name}</p>
          </div>
          <button type="button" className="btn btn-secondary min-h-10 px-4 text-sm" onClick={onClose}>Close</button>
        </div>
        {script ? (
          <ol className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {script.map((line) => (
              <li key={line} className="rounded-2xl bg-[var(--color-surface)] p-4 text-sm leading-6 text-[var(--color-ink-muted)]">{line}</li>
            ))}
          </ol>
        ) : null}
        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={() => navigator.clipboard.writeText((script ?? []).join('\n'))}
        >
          Copy to clipboard
        </button>
      </div>
    </div>
  );
}

function CustomizeDialog({ type, current, onClose, onSave }: { type: CancerType; current: CtaOverride; onClose: () => void; onSave: (value: CtaOverride) => void }) {
  const [label, setLabel] = useState(current.label);
  const [targets, setTargets] = useState<CancerType[]>(current.targetCancerTypes);
  function toggle(typeToToggle: CancerType) {
    setTargets((prev) => (prev.includes(typeToToggle) ? prev.filter((item) => item !== typeToToggle) : [...prev, typeToToggle]));
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Customize button">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">Customize this CTA</h2>
        <label className="mt-5 block font-bold text-[var(--color-brand-aubergine)]">
          Button label
          <input value={label} onChange={(event) => setLabel(event.target.value)} className="mt-2 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3" />
        </label>
        <fieldset className="mt-5">
          <legend className="font-bold text-[var(--color-brand-aubergine)]">Screenings this button covers</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(['lung', 'breast', 'cervical', 'colorectal', 'prostate'] as CancerType[]).map((item) => (
              <label key={item} className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface)] p-3 font-semibold">
                <input type="checkbox" checked={targets.includes(item)} onChange={() => toggle(item)} />
                {screenings[item].shortName}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => onSave({ label, targetCancerTypes: targets.length ? targets : [type] })}>Save</button>
        </div>
        <p className="sr-only" aria-live="polite">Button label updated</p>
      </div>
    </div>
  );
}
