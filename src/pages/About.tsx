import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="container-gedi py-14 md:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-[var(--color-brand-primary)]">About GEDI</p>
        <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">A public education tool for cancer screening conversations</h1>
        <p className="body-lg mt-6 text-[var(--color-ink-muted)]">
          GEDI helps people review routine screening guidance, understand when a clinician conversation may be needed, and prepare careful questions. It follows published screening recommendations where enough information is available and was inspired in part by clinical research and ALCSI community outreach.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          ['Evidence first', 'Guideline-based information, with research limitations presented clearly and carefully.'],
          ['Privacy by default', 'Assessment answers stay in sessionStorage unless a user explicitly opts to save or send a guide.'],
          ['Clinician-centered', 'The product is built to support informed conversations with licensed health professionals.'],
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
            For lung screening education, ALCSI’s screening line is available at 1-844-YES-LUNG. For personal medical decisions, review your GEDI summary with a licensed clinician.
          </p>
          <a href="tel:18449375864" className="btn btn-secondary mt-6">Call 1-844-YES-LUNG</a>
        </section>
      </div>
      <div className="mt-10 rounded-3xl bg-[var(--color-brand-primary-soft)] p-7">
        <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">Medical disclaimer</h2>
        <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">
          GEDI is an informational tool. It is not a diagnosis, medical advice, or a substitute for consultation with a licensed healthcare professional. Screening decisions can change based on symptoms, prior results, personal history, family history, and local clinical guidance.
        </p>
        <Link to="/assessment" className="btn btn-primary mt-6">Start assessment</Link>
      </div>
    </section>
  );
}
