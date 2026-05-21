import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { papers, screenings, type CancerType } from '../lib/gedi';

const valueProps = [
  {
    title: 'Catch things early.',
    body: 'When found early, survival can be dramatically better for several screenable cancers. GEDI makes the next step specific.',
  },
  {
    title: "Spot what you can't feel.",
    body: 'Most screenable cancers cause no symptoms until they are harder to treat. Screening looks before your body can warn you.',
  },
  {
    title: 'Cover more than one.',
    body: 'GEDI checks the major screening pathways in one place and lets you add cancers you are curious about.',
  },
];

const covered: CancerType[] = ['lung', 'breast', 'cervical', 'colorectal', 'prostate', 'liver', 'skin', 'oral-hpv'];

export default function Home() {
  return (
    <>
      <section className="pb-12 pt-8 md:pb-16 md:pt-12">
        <div className="container-gedi">
          <div className="grid gap-8 rounded-[32px] bg-[var(--color-brand-primary-soft)] p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-10">
            <div className="min-w-0 text-left">
              <h1 className="display-xl max-w-5xl text-[var(--color-brand-aubergine)]">
                <span className="block">Catch it before</span>
                <span className="block">it catches you<span className="text-[var(--color-brand-primary)]">.</span></span>
              </h1>
              <p className="body-lg reveal mt-6 max-w-2xl text-[var(--color-ink-muted)] [animation-delay:120ms]">
                GEDI builds a personalized screening plan in under a minute. Then it helps you book the next step.
              </p>
              <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row [animation-delay:180ms]">
                <Link to="/assessment" className="btn btn-primary w-full sm:w-auto">
                  Check my eligibility
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/guidelines" className="btn btn-secondary w-full sm:w-auto">
                  Browse screenings
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-6 text-sm font-semibold leading-6 text-[var(--color-brand-aubergine)]">
                Built from ACS and USPSTF screening pathways, with research context from the Yang Lab at Mass General.
              </p>
            </div>
            <figure className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[var(--shadow-gedi)]">
              <img
                src="/community/alcsi-outreach.jpeg"
                alt="Community members raising lung cancer awareness"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="px-5 py-4 text-sm font-bold text-[var(--color-brand-aubergine)]">
                Community lung cancer awareness.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-gedi grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-end">
          <div>
            <p className="eyebrow text-[var(--color-brand-primary)]">The hard truth</p>
            <h2 className="display-lg mt-4 max-w-4xl text-[var(--color-brand-aubergine)]">
              Fewer than 5% of people eligible for lung cancer screening get one.
            </h2>
          </div>
          <div className="body-lg text-[var(--color-ink-muted)]">
            <p>
              Too many people who qualify never make it from guideline to appointment. GEDI is designed around that missing step.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-gedi grid gap-4 md:grid-cols-3">
          {valueProps.map((item) => (
            <article key={item.title} className="card p-7">
              <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">{item.title}</h2>
              <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-14 md:py-24">
        <div className="container-gedi">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['01', 'Tell us five things', 'Age, body parts relevant to screening, family history, smoking, and whether you have a PCP.'],
              ['02', 'See your plan', 'GEDI shows multiple cancer plans together, with status labels and the reason each appears.'],
              ['03', 'Call with a script', 'Find the right kind of center and use a plain-language call script for the screening.'],
            ].map(([number, title, body]) => (
              <article key={title} className="rounded-3xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-gedi)]">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-aubergine)] text-lg font-black text-white">{number}</span>
                <h2 className="mt-5 text-2xl font-black text-[var(--color-brand-aubergine)]">{title}</h2>
                <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-24">
        <div className="container-gedi">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-[var(--color-brand-primary)]">Screenings we cover</p>
              <h2 className="display-md mt-3 text-[var(--color-brand-aubergine)]">One plan, more than one cancer.</h2>
            </div>
            <Link to="/guidelines" className="btn btn-secondary">
              See guidelines <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {covered.map((type) => (
              <Link to={`/guide/${type}`} key={type} className="card p-6 transition-transform hover:-translate-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-black text-[var(--color-brand-aubergine)]">{screenings[type].shortName}</h3>
                  {screenings[type].comingSoon ? (
                    <span className="rounded-full bg-[var(--color-not-recommended)] px-3 py-1 text-xs font-bold">Expanding</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-bold text-[var(--color-brand-primary)]">{screenings[type].test}</p>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{screenings[type].ageRange}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-brand-navy)] py-16 text-white md:py-24">
        <div className="container-gedi grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-[var(--color-brand-sky)]">Powered by research</p>
            <h2 className="display-md mt-4">The recommendations are only as good as the science behind them.</h2>
            <p className="mt-5 leading-7 text-white/75">
              GEDI connects guideline logic to the Yang Lab’s published research on lung cancer screening eligibility, equity, and early detection.
            </p>
            <Link to="/research" className="btn mt-8 border border-[var(--color-brand-sky)] bg-[var(--color-brand-sky)] text-[var(--color-brand-navy)] hover:bg-white">
              See the research <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4">
            {papers.slice(0, 3).map((paper) => (
              <a key={paper.pmid} href={paper.url} target="_blank" rel="noreferrer" className="rounded-3xl border border-white/20 bg-white/10 p-5 text-white transition-colors hover:bg-white/15">
                <p className="text-sm font-bold text-[var(--color-brand-sky)]">
                  {paper.journal} · {paper.year} · PMID {paper.pmid}
                </p>
                <h3 className="mt-2 text-lg font-black">{paper.title}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-gedi">
          <p className="eyebrow text-[var(--color-brand-primary)]">On the ground</p>
          <h2 className="display-md mt-3 max-w-3xl text-[var(--color-brand-aubergine)]">Screening only matters if people actually get screened.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {['1,000+ student members', '145+ chapters', '1,500+ outreach events', '70,000+ people educated'].map((stat) => (
              <div key={stat} className="rounded-3xl bg-[var(--color-brand-aubergine)] p-6 text-center font-black text-white shadow-[var(--shadow-gedi)]">{stat}</div>
            ))}
          </div>
          <Link to="/initiatives" className="btn btn-secondary mt-8">
            Join the movement <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-[var(--color-brand-primary)] py-16 text-white md:py-20">
        <div className="container-gedi text-center">
          <h2 className="display-md">It takes 60 seconds. It could change everything.</h2>
          <Link to="/assessment" className="btn btn-light-contrast mt-8">
            Check my eligibility <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
