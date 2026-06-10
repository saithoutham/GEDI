import { ArrowRight, ClipboardList, DollarSign, FileQuestion, Microscope } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { screenings, scripts, type CancerType } from '../lib/gedi';

type Detail = {
  eligible: string;
  testLike: string;
  results: string;
  cost: string;
  science: string;
  faqs: Array<[string, string]>;
  sources: Array<{ label: string; url: string }>;
};

const details: Record<CancerType, Detail> = {
  lung: {
    eligible: 'Annual low-dose CT is generally considered for adults 50-80 with a qualifying smoking history who currently smoke or quit within the past 15 years GEDI also flags family history and major environmental exposure as reasons to talk with a clinician',
    testLike: 'LDCT is a quick chest CT done with a lower radiation dose than a diagnostic CT You lie on the scanner table, hold your breath briefly, and usually leave within the same visit without needles or sedation',
    results: 'Many scans are negative or show small nodules that only need repeat imaging Abnormal results are often reported with Lung-RADS categories that guide whether follow-up is annual screening, short-interval imaging, or specialist evaluation',
    cost: 'Preventive LDCT is commonly covered when eligibility criteria and shared decision-making requirements are met Ask whether the facility bills it as lung cancer screening and whether your clinician needs to send an order',
    science: 'Peer-reviewed lung cancer screening research has raised concerns that pack-year criteria may miss risk in some groups, while CT screening has been associated with earlier-stage diagnosis and survival gains',
    faqs: [
      ['Will I need contrast?', 'Screening LDCT usually does not use IV contrast Confirm when scheduling'],
      ['What if I quit more than 15 years ago?', 'Current coverage rules may not include you, but family history, exposures, or symptoms are still worth discussing'],
      ['Can one imaging center handle lung and breast screening?', 'Often yes Radiology groups may offer both LDCT and mammography Ask which screening services are offered and whether a clinician order is required'],
    ],
    sources: [
      { label: 'USPSTF lung screening recommendation', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening' },
      { label: 'CDC cancer screening overview', url: 'https://www.cdc.gov/cancer/prevention/screening.html' },
      { label: 'Potter/Yang JCO 2024', url: 'https://pubmed.ncbi.nlm.nih.gov/38537159/' },
    ],
  },
  breast: {
    eligible: 'Average-risk people with breasts can usually start talking about mammography at 40 ACS recommends annual screening at 45-54 and continued screening every 1-2 years after 55 while overall health supports it',
    testLike: 'A mammogram is a low-dose X-ray of the breast Each breast is compressed for a few seconds while images are taken The appointment is usually short, but follow-up imaging may be needed if something is unclear',
    results: 'Results commonly use BI-RADS categories A normal result returns you to routine screening; an incomplete or suspicious result may mean diagnostic mammography, ultrasound, MRI, or biopsy',
    cost: 'Screening mammography is often covered as preventive care If uninsured or underinsured, CDC-supported breast and cervical screening programs can help route people to low-cost services',
    science: 'The strongest action step is matching age, risk, and access Family history of breast or ovarian cancer should trigger a separate risk conversation, including genetic-risk assessment when appropriate',
    faqs: [
      ['Do I need a referral?', 'Many screening mammograms can be scheduled directly, but insurance and state rules vary'],
      ['What is 3D mammography?', 'Tomosynthesis creates layered images and may reduce callbacks for some people Ask whether it is offered and covered'],
      ['What if I have dense breasts?', 'Ask whether supplemental ultrasound or MRI is appropriate for your risk profile'],
    ],
    sources: [
      { label: 'USPSTF breast screening recommendation', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening' },
      { label: 'CDC cancer screening overview', url: 'https://www.cdc.gov/cancer/prevention/screening.html' },
      { label: 'FDA MQSA facility search', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfMQSA/mqsa.cfm' },
    ],
  },
  cervical: {
    eligible: 'People with a cervix at average risk generally start cervical screening at 25 and continue through at least 65 Primary HPV testing every 5 years is the preferred ACS pathway when available',
    testLike: 'A clinician collects a cervical sample for HPV testing, Pap testing, or both Some newer pathways allow self-collected HPV samples in health care settings when available',
    results: 'A negative result usually means routine repeat screening HPV-positive or abnormal Pap results may mean repeat testing, colposcopy, or treatment of precancerous changes',
    cost: 'Cervical screening is commonly covered as preventive care CDC breast and cervical screening programs can help people who are uninsured, underinsured, or have limited income',
    science: 'Cervical screening can prevent cancer by finding HPV-related precancerous changes before they become invasive cancer',
    faqs: [
      ['Do I still need screening after HPV vaccination?', 'Yes Vaccination lowers risk but does not replace screening'],
      ['What if I had a hysterectomy?', 'Ask whether your cervix was removed and why surgery was done; that changes screening needs'],
      ['Can cervical and breast screening happen together?', 'Sometimes Women’s health clinics may coordinate Pap/HPV testing and mammography referral'],
    ],
    sources: [
      { label: 'USPSTF cervical screening recommendation', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening' },
      { label: 'NCI cervical screening', url: 'https://www.cancer.gov/types/cervical/screening' },
      { label: 'CDC NBCCEDP', url: 'https://www.cdc.gov/breast-cervical-cancer-screening/about/index.html' },
    ],
  },
  colorectal: {
    eligible: 'Average-risk adults generally start colorectal cancer screening at 45 Family history, inflammatory bowel disease, or prior polyps can move that conversation earlier',
    testLike: 'Options include stool-based tests done at home and visual exams such as colonoscopy Colonoscopy requires bowel prep and sedation but can remove some precancerous polyps during the exam',
    results: 'A negative stool test returns you to the recommended interval for that test A positive stool test needs follow-up colonoscopy Colonoscopy findings determine whether you repeat in 10 years, sooner, or need treatment',
    cost: 'Coverage depends on test type and whether a positive stool test is followed by colonoscopy Ask how the full screening sequence is billed before choosing a test',
    science: 'Colorectal screening can detect cancer early and can prevent some cancers by finding and removing precancerous polyps',
    faqs: [
      ['Is a stool test enough?', 'For many average-risk adults it can be, if done on schedule and followed by colonoscopy when positive'],
      ['How long is colonoscopy prep?', 'Prep usually starts the day before, but exact instructions vary by facility'],
      ['Can one place handle other screenings too?', 'Colonoscopy usually requires a GI or endoscopy center, so GEDI separates it from imaging-based searches'],
    ],
    sources: [
      { label: 'USPSTF colorectal screening recommendation', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening' },
      { label: 'CDC colorectal screening overview', url: 'https://www.cdc.gov/colorectal-cancer/screening/index.html' },
    ],
  },
  prostate: {
    eligible: 'Prostate screening is usually a shared decision ACS recommends discussing PSA testing at 50 for average-risk people with a prostate, and earlier for higher-risk groups including strong family history',
    testLike: 'PSA screening is a blood test It may be paired with a clinical discussion about urinary symptoms, family history, race, prior PSA values, and what you would do with an abnormal result',
    results: 'A high PSA does not automatically mean cancer Follow-up may include repeat PSA, risk calculators, MRI, urology referral, or biopsy depending on context',
    cost: 'Ask whether the visit and PSA are billed as preventive screening or diagnostic evaluation Coverage can vary because the decision is preference-sensitive',
    science: 'The key issue is balancing early detection of higher-risk cancers against false positives, overdiagnosis, biopsy harms, and treatment side effects',
    faqs: [
      ['Should everyone get PSA screening?', 'No It should be a decision made after discussing benefits and harms'],
      ['Does family history matter?', 'Yes A first-degree relative with prostate cancer can move the discussion earlier'],
      ['Can a PCP order it?', 'Often yes A urologist may be involved if PSA is abnormal or risk is higher'],
    ],
    sources: [
      { label: 'USPSTF prostate screening recommendation', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/prostate-cancer-screening' },
      { label: 'CDC prostate screening overview', url: 'https://www.cdc.gov/prostate-cancer/screening/' },
    ],
  },
  liver: {
    eligible: 'Routine liver cancer screening is not for average-risk adults It is considered for higher-risk groups, especially people with cirrhosis, chronic hepatitis B, or certain inherited liver conditions',
    testLike: 'High-risk screening usually uses liver ultrasound, sometimes with an AFP blood test, at regular intervals Your liver specialist or primary clinician decides whether this applies',
    results: 'Normal imaging returns you to repeat surveillance A concerning ultrasound or AFP trend may lead to contrast CT, MRI, or specialist evaluation',
    cost: 'Because this is risk-based surveillance, coverage depends on the underlying liver diagnosis and the clinician order Ask the ordering clinician what diagnosis code and interval are being used',
    science: 'Liver tumors can be hard to feel or detect early by symptoms, which is why surveillance is focused on people with known liver disease risk',
    faqs: [
      ['Who should ask about this?', 'Anyone with cirrhosis, chronic hepatitis B, hereditary hemochromatosis, or prior liver cancer risk counseling'],
      ['Is AFP enough by itself?', 'No AFP can be normal in early liver cancer and elevated for reasons other than cancer'],
      ['Where do I schedule it?', 'Usually radiology for ultrasound, coordinated by primary care, hepatology, or gastroenterology'],
    ],
    sources: [
      { label: 'NCI cancer screening tests', url: 'https://www.cancer.gov/about-cancer/screening/screening-tests' },
    ],
  },
  skin: {
    eligible: 'Routine whole-body skin screening for average-risk adults is not a universal recommendation It is more commonly risk-based: personal history, suspicious lesions, many atypical moles, immunosuppression, or strong UV exposure history',
    testLike: 'A skin exam is a visual check, often by a dermatologist The clinician may use a dermatoscope and may photograph or biopsy suspicious spots',
    results: 'Most spots are watched or documented A suspicious lesion may be biopsied; pathology determines whether it is benign, precancerous, melanoma, or another skin cancer',
    cost: 'Coverage depends on whether the visit is preventive, risk-based, or diagnostic for a specific lesion If you have a changing spot, say that clearly when scheduling',
    science: 'The evidence for population-wide skin screening is different from breast, cervical, colorectal, and lung screening GEDI treats it as risk-based education unless symptoms or risk factors are present',
    faqs: [
      ['What should I watch for?', 'A changing, bleeding, painful, asymmetric, or unusually colored spot should be checked'],
      ['Can a PCP do this?', 'Primary care can look at concerning lesions; dermatology handles higher-risk exams and biopsies'],
      ['How often should I go?', 'That depends on personal risk and prior findings Ask for a specific interval after your exam'],
    ],
    sources: [
      { label: 'CDC cancer screening overview', url: 'https://www.cdc.gov/cancer/prevention/screening.html' },
      { label: 'CDC skin cancer information', url: 'https://www.cdc.gov/skin-cancer/about/index.html' },
    ],
  },
  'oral-hpv': {
    eligible: 'There is no routine population screening test for HPV-related oropharyngeal cancer GEDI includes it for education, symptom awareness, vaccination history, and dentist or clinician conversations',
    testLike: 'A dentist, ENT clinician, or primary care clinician may examine the mouth, throat, neck, and lymph nodes Testing is driven by symptoms or concerning findings, not a routine HPV swab',
    results: 'A normal exam means monitoring and routine dental/medical care Persistent throat pain, trouble swallowing, a neck lump, or a non-healing mouth sore may need ENT evaluation',
    cost: 'Routine dental or medical exams vary by plan Symptom-driven evaluation is usually billed diagnostically',
    science: 'HPV vaccination reduces risk of HPV-related cancers Screening is not established the way cervical HPV testing is',
    faqs: [
      ['Can I get an oral HPV screening test?', 'Routine oral HPV testing is not used like cervical HPV testing Ask about symptoms and exam findings instead'],
      ['Who should I see?', 'Start with a dentist, primary care clinician, or ENT if symptoms persist'],
      ['Does vaccination still help?', 'HPV vaccination can prevent infections linked to several cancers; ask a clinician if you are eligible'],
    ],
    sources: [
      { label: 'NCI cancer screening tests', url: 'https://www.cancer.gov/about-cancer/screening/screening-tests' },
      { label: 'NCI cancer screening tests', url: 'https://www.cancer.gov/about-cancer/screening/screening-tests' },
    ],
  },
};

export default function CancerDetail() {
  const params = useParams();
  const cancer = params.cancer as CancerType | undefined;
  if (!cancer || !screenings[cancer]) return <Navigate to="/guidelines" replace />;
  const item = screenings[cancer];
  const detail = details[cancer];
  const script = scripts[cancer as keyof typeof scripts];

  return (
    <article className="container-gedi py-14 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <figure className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white shadow-[var(--shadow-gedi)]">
          <img src="/community/mgh-lung-ct.jpg" alt="Radiology technologist preparing a patient for a CT scan" className="aspect-[4/3] w-full object-cover" />
        </figure>
        <div>
          <p className="eyebrow text-[var(--color-brand-primary)]">{item.test}</p>
          <h1 className="display-lg mt-4 text-[var(--color-brand-aubergine)]">{item.name}</h1>
          <p className="body-lg mt-5 text-[var(--color-ink-muted)]">{item.detail}</p>
          <Link to="/assessment" className="btn btn-primary mt-7">
            Start assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <DetailCard icon={<ClipboardList />} title="Am I eligible?">{detail.eligible}</DetailCard>
        <DetailCard icon={<Microscope />} title="What the test is like">{detail.testLike}</DetailCard>
        <DetailCard icon={<FileQuestion />} title="What the results mean">{detail.results}</DetailCard>
        <DetailCard icon={<DollarSign />} title="Cost and insurance">{detail.cost}</DetailCard>
      </div>

      <section className="mt-12 card p-7">
        <h2 className="display-md text-[var(--color-brand-aubergine)]">The science behind it</h2>
        <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">{detail.science}</p>
      </section>

      {script ? (
        <section className="mt-12 card p-7">
          <h2 className="display-md text-[var(--color-brand-aubergine)]">What to ask when you call</h2>
          <ul className="mt-5 space-y-3">
            {script.map((line) => (
              <li key={line} className="rounded-2xl bg-[var(--color-surface)] p-4 leading-7 text-[var(--color-ink-muted)]">{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="display-md text-[var(--color-brand-aubergine)]">Frequently asked questions</h2>
        <div className="mt-5 grid gap-4">
          {detail.faqs.map(([question, answer]) => (
            <details key={question} className="card p-5">
              <summary className="cursor-pointer font-black text-[var(--color-brand-aubergine)]">{question}</summary>
              <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-white p-6">
        <h2 className="font-black text-[var(--color-brand-aubergine)]">Sources</h2>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-[var(--color-brand-navy)]">
          {detail.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer" className="underline">{source.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function DetailCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <div className="text-[var(--color-brand-primary)]">{icon}</div>
      <h2 className="mt-4 text-2xl font-black text-[var(--color-brand-aubergine)]">{title}</h2>
      <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{children}</p>
    </section>
  );
}
