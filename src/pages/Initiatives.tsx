import { ExternalLink, Phone } from 'lucide-react';

export default function Initiatives() {
  return (
    <section className="container-gedi py-14 md:py-20">
      <div className="max-w-4xl">
        <p className="eyebrow text-[var(--color-brand-primary)]">Initiatives</p>
        <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">Community outreach for lung cancer screening education</h1>
        <p className="body-lg mt-6 text-[var(--color-ink-muted)]">
          GEDI works alongside the American Lung Cancer Screening Initiative, a student-led 501(c)(3) founded by Dr Yang, to put screening information into the hands of the people who need it most
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="card overflow-hidden p-3">
          <img src="/community/alcsi-outreach.jpeg" alt="ALCSI outreach event" className="aspect-[4/3] w-full rounded-[20px] object-cover" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {['1,000+ members', '145+ chapters', '1,500+ outreach events', '70,000+ people educated'].map((stat) => (
            <div key={stat} className="card p-6 text-center">
              <p className="font-display text-4xl text-[var(--color-brand-primary)]">{stat.split(' ')[0]}</p>
              <p className="mt-2 font-black text-[var(--color-brand-aubergine)]">{stat.replace(stat.split(' ')[0], '').trim()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <InitiativeCard title="Plus One Campaign" body="Learn about screening, then encourage one person who may qualify to ask a clinician about it" href="https://www.alcsi.org/plus-one-campaign" />
        <InitiativeCard title="INSPIRE Study" body="Free LDCT screening for Black men and women aged 50-80 with any smoking history in Boston and Chicago" href="https://inspirelungscreeningstudy.mgh.harvard.edu/" />
        <InitiativeCard title="Start a chapter" body="Mobilize a campus or community group around lung cancer screening access" href="https://www.alcsi.org/about/join" />
      </div>

      <section className="mt-12 card p-7">
        <h2 className="display-md text-[var(--color-brand-aubergine)]">Advocacy wins</h2>
        <ol className="mt-6 space-y-4 border-l-2 border-[var(--color-brand-primary)] pl-6">
          {[
            '2020: ALCSI worked with the US Senate on the first Senate resolution recognizing the importance of lung cancer screening',
            '2021: ALCSI helped draft Katherine’s Lung Cancer Early Detection and Survival Act',
            '680+ mayoral and gubernatorial proclamations recognized Lung Cancer Awareness Month',
            'ALCSI continues public input and outreach around USPSTF screening guideline implementation',
          ].map((item) => (
            <li key={item} className="leading-7 text-[var(--color-ink-muted)]">{item}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12 rounded-[32px] bg-[var(--color-brand-primary)] p-8 text-white md:p-10">
        <p className="eyebrow text-white/70">Questions about screening?</p>
        <h2 className="display-md mt-3">Call us 24/7</h2>
        <a href="tel:18449375864" className="btn btn-light-contrast mt-7">
          <Phone className="h-4 w-4" />
          1-844-YES-LUNG
        </a>
      </section>
    </section>
  );
}

function InitiativeCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="card block p-6 transition-transform hover:-translate-y-1">
      <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">{title}</h2>
      <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{body}</p>
      <span className="mt-5 inline-flex items-center gap-2 font-black text-[var(--color-brand-primary)]">
        Open <ExternalLink className="h-4 w-4" />
      </span>
    </a>
  );
}
