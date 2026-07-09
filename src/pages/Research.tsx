import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trials } from '../lib/gedi';
import { researchSections } from '../lib/researchPapers';

export default function Research() {
  return (
    <>
      <section className="bg-[var(--color-brand-navy)] py-16 text-white md:py-24">
        <div className="container-gedi">
          <p className="eyebrow text-[var(--color-brand-sky)]">Research that informs our approach</p>
          <h1 className="display-lg mt-4 max-w-4xl">Evidence from across cancer screening</h1>
          <p className="body-lg mt-6 max-w-3xl text-white/75">
            Our eligibility logic follows USPSTF screening guidelines. The platform is informed by peer-reviewed research across multiple cancer types — including work on screening eligibility, health equity, disparities in access, and early detection.
          </p>
        </div>
      </section>

      <section className="container-gedi py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card p-7">
            <img
              src="/research/chi-fu-jeffrey-yang-local.png"
              alt="Dr. Chi-Fu Jeffrey Yang"
              className="aspect-square w-full rounded-3xl object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-[var(--color-brand-primary)]">Founding research</p>
            <h2 className="display-md mt-3 text-[var(--color-brand-aubergine)]">Clinical research rooted in thoracic surgery and equity</h2>
            <p className="mt-5 leading-7 text-[var(--color-ink-muted)]">
              Dr. Chi-Fu Jeffrey Yang is a thoracic surgeon at Massachusetts General Hospital and the Founding Director of CAIIRE. His lab’s work on lung cancer screening eligibility, screening equity, and earlier detection helped inspire the platform’s focus on clear, guideline-based education.
            </p>
            <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">
              Beyond lung cancer, our approach is informed by USPSTF recommendations and peer-reviewed research across breast, colorectal, cervical, and prostate cancer screening — as well as health disparities research on access barriers and community-based interventions.
            </p>
            <a href="https://yang-lab.mgh.harvard.edu/" target="_blank" rel="noreferrer" className="btn btn-secondary mt-6">
              Visit the lab <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="container-gedi pb-14 md:pb-20">
        <p className="eyebrow text-[var(--color-brand-primary)]">Active clinical trials</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {trials.map((trial) => (
            <article key={trial.name} className="card flex h-full flex-col p-7">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">{trial.name}</h2>
                  <span className="rounded-full bg-[var(--color-brand-sage)] px-3 py-1 text-xs font-black text-[var(--color-eligible-ink)]">{trial.status}</span>
                </div>
                <p className="mt-2 font-bold text-[var(--color-ink-muted)]">{trial.fullName}</p>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div><dt className="font-black">PI</dt><dd>{trial.pi}</dd></div>
                  <div><dt className="font-black">Funder</dt><dd>{trial.funder} · {trial.amount}</dd></div>
                  <div><dt className="font-black">Sites</dt><dd>{trial.sites}</dd></div>
                </dl>
                <p className="mt-5 leading-7 text-[var(--color-ink-muted)]">{trial.summary}</p>
              </div>
              <a href={trial.url} target="_blank" rel="noreferrer" className="btn btn-secondary mt-6 w-full">
                Open trial site <ExternalLink className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="container-gedi pb-14 md:pb-20">
        <p className="eyebrow text-[var(--color-brand-primary)]">Key publications by cancer type</p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)] sm:text-base">
          Click a category to view the research that informs our screening guidance for each cancer type.
        </p>
        <div className="mt-6 grid gap-4">
          {researchSections.map((section) => (
            <ResearchCategory key={section.category} section={section} />
          ))}
        </div>
      </section>

      <section className="container-gedi pb-20">
        <div className="rounded-[32px] bg-[var(--color-brand-primary-soft)] p-7 md:p-10">
          <p className="eyebrow text-[var(--color-brand-primary)]">How research shapes our platform</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              ['Pack-year context', 'USPSTF eligibility is kept visible while noting published concerns that pack-year rules can under-screen some groups.'],
              ['Equity prompts', 'Family history and exposure risk create a doctor-discussion pathway instead of a hard no.'],
              ['Action design', 'The guide connects eligibility to call scripts so users can move from guideline information to a practical next step.'],
            ].map(([title, body]) => (
              <article key={title} className="rounded-3xl bg-white p-6">
                <h2 className="text-xl font-black text-[var(--color-brand-aubergine)]">{title}</h2>
                <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{body}</p>
              </article>
            ))}
          </div>
          <Link to="/initiatives" className="btn btn-primary mt-7">
            Get involved <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function ResearchCategory({ section }: { section: (typeof researchSections)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-[var(--color-surface)]"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="h-5 w-5 text-[var(--color-brand-primary)]" /> : <ChevronRight className="h-5 w-5 text-[var(--color-brand-primary)]" />}
          <h2 className="text-xl font-black text-[var(--color-brand-aubergine)]">{section.category}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-brand-primary-soft)] px-3 py-1 text-xs font-black text-[var(--color-brand-primary)]">
          {section.papers.length} {section.papers.length === 1 ? 'paper' : 'papers'}
        </span>
      </button>
      {open ? (
        <div className="border-t border-[var(--color-line)] px-6 pb-6 pt-4">
          <div className="grid gap-4">
            {section.papers.map((paper) => (
              <a key={paper.pmid} href={paper.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-transform hover:-translate-y-0.5">
                <p className="text-xs font-black text-[var(--color-brand-primary)]">{paper.journal} · {paper.year} · PMID {paper.pmid}</p>
                <h3 className="mt-2 text-base font-black leading-snug text-[var(--color-brand-aubergine)]">{paper.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{paper.authors}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">{paper.relevance}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
