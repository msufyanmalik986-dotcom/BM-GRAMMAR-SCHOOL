import Link from 'next/link';
import Icon from '../../components/icons.jsx';
import { Reveal } from '../../components/ui.jsx';
import { PageHero, SectionHeading, CTABand, CampusCard } from '../../components/cards.jsx';
import { q } from '../../lib/db.js';
import { SCHOOL } from '../../lib/content.js';

export const metadata = {
  title: 'Admissions',
  description: 'Admissions at BM Grammar School Karachi are free. Apply online in six guided steps and track your application from your dashboard.',
  alternates: { canonical: '/admissions' },
};

const STEPS = [
  { n: '01', t: 'Choose Campus', d: 'Pick the campus nearest to your home: Al Sadaf Colony, Mominabad or Orangi Town.' },
  { n: '02', t: 'Choose Class', d: 'Select the class your child is applying for, from Montessori to Matric.' },
  { n: '03', t: 'Student Information', d: 'Your child\u2019s name, date of birth and previous school details.' },
  { n: '04', t: 'Parent / Guardian', d: 'Your contact details so the campus office can reach you.' },
  { n: '05', t: 'Review', d: 'Check everything once before submitting — you can edit any section.' },
  { n: '06', t: 'Submit', d: 'Receive a reference number and track the status from your dashboard.' },
];

export default function AdmissionsPage() {
  const branches = q.branches();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Admissions' }]}
        eyebrow="Admissions"
        title="Admission is free. Apply online in minutes."
        lead={`As stated by the school, admission at ${SCHOOL.name} is free. The online application takes about five minutes and your progress is saved on your device as you go.`}
      />

      <section className="section">
        <div className="container">
          <SectionHeading center eyebrow="Admission Process" title="Six guided steps" />
          <div className="grid grid--3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i % 3}>
                <div className="card card--pad" style={{ height: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{s.n}</span>
                  <h3 style={{ margin: '10px 0 8px' }}>{s.t}</h3>
                  <p className="small muted">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/admissions/apply" className="btn btn--primary btn--lg">Apply Online <Icon name="arrow-right" className="icon--arrow" /></Link>
          </div>
          <p className="tiny muted" style={{ textAlign: 'center', marginTop: 14 }}>
            Your draft is saved on this device, so you can safely come back later. A parent account is required at final submission so your application stays private and trackable.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading eyebrow="Choose Your Campus" title="Three campuses, one programme" />
          <div className="grid grid--3">
            {branches.map((b, i) => (
              <Reveal key={b.slug} delay={i}><CampusCard branch={b} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid--2" style={{ alignItems: 'center' }}>
          <div>
            <span className="eyebrow">Good to know</span>
            <h2 style={{ marginTop: 12 }}>Honest answers before you apply</h2>
            <ul className="focus-list" style={{ marginTop: 20 }}>
              <li><Icon name="check-circle" size={17} /> Admission is free — you will not be asked for an admission fee.</li>
              <li><Icon name="check-circle" size={17} /> Classes are separate for boys and girls.</li>
              <li><Icon name="check-circle" size={17} /> Your application is private: only you and the school office can see it.</li>
              <li><Icon name="check-circle" size={17} /> The campus office will guide you on any documents needed after review.</li>
              <li><Icon name="check-circle" size={17} /> Questions? Call {SCHOOL.phoneDisplay} before or after applying.</li>
            </ul>
          </div>
          <div className="media media--43 media--frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/hero-classroom.jpg" alt="Representational image: a welcoming classroom" loading="lazy" />
            <span className="media__credit">Representational image</span>
          </div>
        </div>
      </section>

      <section className="section section--alt"><div className="container"><CTABand /></div></section>
    </>
  );
}
