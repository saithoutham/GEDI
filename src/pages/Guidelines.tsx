import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cancerTypes, screenings } from '../lib/gedi';

export default function Guidelines() {
  return (
    <section className="container-gedi py-14 md:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-[var(--color-brand-primary)]">Guidelines</p>
        <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">Plain-language screening guidance for clinician conversations</h1>
        <p className="body-lg mt-5 text-[var(--color-ink-muted)]">
          These cards summarize the screening pathways GEDI uses for education. Risk-based topics are included for learning and should be discussed with a licensed clinician.
        </p>
      </div>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MedicalGuideline',
          name: 'GEDI cancer screening guideline index',
          guidelineSubject: cancerTypes.map((type) => screenings[type].name),
        })}
      </script>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {cancerTypes.map((type) => (
          <article key={type} className="card p-6">
            <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">{screenings[type].name}</h2>
                  {screenings[type].comingSoon ? <span className="rounded-full bg-[var(--color-not-recommended)] px-3 py-1 text-xs font-black">Risk-based</span> : null}
                </div>
                <p className="mt-1 font-bold text-[var(--color-ink-muted)]">{screenings[type].test}</p>
                <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">{screenings[type].description}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/guide/${type}`} className="btn btn-secondary">
                    Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
            </div>
          </article>
        ))}
      </div>
      <section className="mt-10 rounded-3xl bg-white p-6 text-sm leading-6 text-[var(--color-ink-muted)]">
        <h2 className="font-black text-[var(--color-brand-aubergine)]">Sources used across this guide</h2>
        <p className="mt-2">
          GEDI summarizes screening pathways from USPSTF, CDC, NCI, and selected peer-reviewed research. Full source links appear at the bottom of each detail page.
        </p>
      </section>
    </section>
  );
}
