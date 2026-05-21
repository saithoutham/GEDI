import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="container-gedi py-14 md:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-[var(--color-brand-primary)]">About GEDI</p>
        <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">A public screening platform built to close the action gap.</h1>
        <p className="body-lg mt-6 text-[var(--color-ink-muted)]">
          GEDI helps people understand screening eligibility, build a multi-cancer plan, and find the next practical step. It connects guideline logic with the Yang Lab’s research and ALCSI’s community screening work.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          ['Evidence first', 'Guideline-backed recommendations, with research limitations surfaced instead of hidden.'],
          ['Privacy by default', 'Assessment answers stay in sessionStorage unless a user explicitly opts to save or send a guide.'],
          ['Action, not awareness', 'The product is built around booking, calling, and asking the right questions.'],
        ].map(([title, body]) => (
          <article key={title} className="card p-6">
            <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">{title}</h2>
            <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{body}</p>
          </article>
        ))}
      </div>
      <div className="mt-10">
        <section className="card p-7">
          <h2 className="display-md text-[var(--color-brand-aubergine)]">Contact</h2>
          <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">
            For screening questions, ALCSI’s lung screening line is available at 1-844-YES-LUNG. For clinical decisions, bring your GEDI plan to a licensed clinician.
          </p>
          <a href="tel:18449375864" className="btn btn-secondary mt-6">Call 1-844-YES-LUNG</a>
        </section>
      </div>
      <div className="mt-10 rounded-3xl bg-[var(--color-brand-primary-soft)] p-7">
        <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">Medical disclaimer</h2>
        <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">
          GEDI is an informational tool. It is not a diagnosis and does not replace consultation with a licensed healthcare professional. Recommendations follow ACS and USPSTF guidelines, last reviewed May 20, 2026.
        </p>
        <Link to="/assessment" className="btn btn-primary mt-6">Start assessment</Link>
      </div>
    </section>
  );
}
