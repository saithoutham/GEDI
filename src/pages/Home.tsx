import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { papers, screenings, type CancerType } from '../lib/gedi';

const valueProps = [
  {
    title: 'Start with guidance',
    body: 'GEDI summarizes published screening recommendations in plain language. It is educational and does not diagnose cancer or replace medical advice.',
  },
  {
    title: 'Know what to discuss',
    body: 'Some screening decisions depend on symptoms, personal history, family history, or prior results. GEDI helps identify topics to review with a clinician.',
  },
  {
    title: 'Review several topics',
    body: 'GEDI brings major screening pathways into one place so people can prepare careful questions before a clinical visit.',
  },
];

const covered: CancerType[] = ['lung', 'breast', 'cervical', 'colorectal', 'prostate', 'liver', 'skin', 'oral-hpv'];

const outreachPhotos = [
  {
    src: '/community/homepage/outreach-1.jpg',
    alt: 'ALCSI volunteer speaking with a community member at a lung cancer screening outreach table',
  },
  {
    src: '/community/homepage/outreach-2.jpg',
    alt: 'Volunteers and community members reviewing lung cancer screening information outdoors',
  },
  {
    src: '/community/homepage/outreach-3.jpg',
    alt: 'Lung cancer awareness volunteers holding ribbon signs',
  },
  {
    src: '/community/homepage/outreach-4.jpg',
    alt: 'Indoor community health fair with ALCSI lung cancer screening materials',
  },
  {
    src: '/community/homepage/outreach-5.jpg',
    alt: 'Students speaking with an older adult about lung cancer awareness',
  },
  {
    src: '/community/homepage/outreach-6.jpg',
    alt: 'Community lung cancer screening outreach table at a public park',
  },
];

export default function Home() {
  return (
    <>
      <section className="pb-12 pt-8 md:pb-16 md:pt-12">
        <div className="w-full px-3 sm:px-6 lg:px-10">
          <div className="grid gap-8 rounded-[32px] bg-[var(--color-brand-primary-soft)] p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-10">
            <div className="min-w-0 text-left">
              <h1 className="display-xl max-w-5xl text-[var(--color-brand-aubergine)]">
                <span className="block">Understand cancer</span>
                <span className="block">screening guidance</span>
              </h1>
              <p className="body-lg reveal mt-6 max-w-2xl text-[var(--color-ink-muted)] [animation-delay:120ms]">
                GEDI summarizes screening pathways and helps people prepare careful questions for a licensed clinician.
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
                Built from published screening guidance and peer-reviewed research context.
              </p>
            </div>
            <HomepagePhotoCarousel />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="w-full px-3 sm:px-6 lg:px-10 grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-end">
          <div>
            <p className="eyebrow text-[var(--color-brand-primary)]">Why this matters</p>
            <h2 className="display-lg mt-4 max-w-4xl text-[var(--color-brand-aubergine)]">
              Screening guidance is most useful when people understand what may apply to them
            </h2>
          </div>
          <div className="body-lg text-[var(--color-ink-muted)]">
            <p>
              GEDI turns dense recommendations into a careful summary that people can bring to a clinical visit.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="w-full px-3 sm:px-6 lg:px-10 grid gap-4 md:grid-cols-3">
          {valueProps.map((item) => (
            <article key={item.title} className="card p-7">
              <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">{item.title}</h2>
              <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-14 md:py-24">
        <div className="w-full px-3 sm:px-6 lg:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['01', 'Share basic context', 'Age, sex assigned at birth, prior screening, and smoking history help summarize relevant guidance.'],
              ['02', 'Review the summary', 'GEDI shows screening topics with status labels and the reason each one appears.'],
              ['03', 'Prepare for care', 'Use the summary and plain-language prompts when speaking with a licensed clinician.'],
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
        <div className="w-full px-3 sm:px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-[var(--color-brand-primary)]">Screenings we cover</p>
              <h2 className="display-md mt-3 text-[var(--color-brand-aubergine)]">One guide, multiple screening topics</h2>
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
                    <span className="rounded-full bg-[var(--color-not-recommended)] px-3 py-1 text-xs font-bold">Risk-based</span>
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
        <div className="w-full px-3 sm:px-6 lg:px-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-[var(--color-brand-sky)]">Research context</p>
            <h2 className="display-md mt-4">Built to communicate evidence carefully</h2>
            <p className="mt-5 leading-7 text-white/75">
              GEDI follows published screening guidelines and references peer-reviewed work on lung cancer screening eligibility, equity, and early detection.
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
        <div className="w-full px-3 sm:px-6 lg:px-10">
          <p className="eyebrow text-[var(--color-brand-primary)]">Community outreach</p>
          <h2 className="display-md mt-3 max-w-3xl text-[var(--color-brand-aubergine)]">Information is strongest when it reaches people where they are</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {['1,000+ student members', '145+ chapters', '1,500+ outreach events', '70,000+ people educated'].map((stat) => (
              <div key={stat} className="rounded-3xl bg-[var(--color-brand-aubergine)] p-6 text-center font-black text-white shadow-[var(--shadow-gedi)]">{stat}</div>
            ))}
          </div>
          <Link to="/initiatives" className="btn btn-secondary mt-8">
            Learn about outreach <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-[var(--color-brand-primary)] py-16 text-white md:py-20">
        <div className="w-full px-3 text-center sm:px-6 lg:px-10">
          <h2 className="display-md">Start with information you can discuss with a clinician</h2>
          <Link to="/assessment" className="btn btn-light-contrast mt-8">
            Check my eligibility <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

function HomepagePhotoCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % outreachPhotos.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <figure className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[var(--shadow-gedi)]">
      <div className="relative aspect-[4/3] w-full bg-[var(--color-surface)]">
        {outreachPhotos.map((photo, index) => (
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === active ? 'opacity-100' : 'opacity-0'
            }`}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      <figcaption className="flex items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-[var(--color-brand-aubergine)]">
        <span>Community lung cancer screening outreach</span>
        <span className="shrink-0 tabular-nums text-[var(--color-ink-muted)]">{active + 1}/{outreachPhotos.length}</span>
      </figcaption>
    </figure>
  );
}
