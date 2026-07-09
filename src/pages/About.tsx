import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="container-gedi py-14 md:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-[var(--color-brand-primary)]">About</p>
        <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">Advocacy, education, and awareness for cancer screening</h1>
        <p className="body-lg mt-6 text-[var(--color-ink-muted)]">
          The Global Early Detection Initiative (GEDI) empowers individuals with evidence-based cancer screening education to promote informed decision-making, increase access to preventive care, and reduce the burden of cancer through early detection. It follows USPSTF screening recommendations and was inspired by clinical research and community outreach.
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
            For questions, collaboration inquiries, or feedback:
          </p>
          <p className="mt-2 text-lg font-black text-[var(--color-brand-primary)]">
            <a href="mailto:Info@globalearlydetection.org" className="hover:underline">Info@globalearlydetection.org</a>
          </p>
          <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">
            For lung screening education, ALCSI’s screening line is also available at 1-844-YES-LUNG. For personal medical decisions, review your summary with a licensed clinician.
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
