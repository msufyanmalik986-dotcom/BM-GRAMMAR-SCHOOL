import Link from 'next/link';
import Icon from '../../components/icons.jsx';
import { Reveal } from '../../components/ui.jsx';
import { PageHero, SectionHeading, CTABand } from '../../components/cards.jsx';
import Journey from '../../components/journey.jsx';
import { LEVELS } from '../../lib/content.js';

export const metadata = {
  title: 'Academics',
  description: 'Academic programme of BM Grammar School Karachi: Montessori, Primary, Middle, Secondary and Matric, with activities and parent engagement.',
  alternates: { canonical: '/academics' },
};

export default function AcademicsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Academics' }]}
        eyebrow="Academic Overview"
        title="From the first classroom to the board examinations."
        lead="BM Grammar School runs a complete Montessori-to-Matric programme with separate boys\u2019 and girls\u2019 classes, qualified teachers and continuous assessment."
      />

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Educational Journey" title="Five stages, one continuous programme"
            lead="Select a stage to see its focus. Each stage prepares students for the next, ending in full Matriculation preparation." />
          <Journey />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading center eyebrow="Stage by Stage" title="How each stage teaches" />
          <div className="grid grid--2">
            {LEVELS.map((l, i) => (
              <Reveal key={l.key} delay={i % 2}>
                <div className="card card--hover" style={{ height: '100%' }}>
                  <div className="media media--169">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.image} alt={l.alt} loading="lazy" />
                    <span className="media__credit">Representational image</span>
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>{l.title}</h3><span className="badge badge--blue">{l.ages}</span>
                    </div>
                    <p className="small muted" style={{ marginTop: 10 }}>{l.blurb}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={1}>
              <div className="card card--pad" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, background: 'var(--color-ink)', color: '#e8e6e1', border: 0 }}>
                <span className="eyebrow eyebrow--light">Activities & Development</span>
                <h3 style={{ color: '#fff' }}>Beyond the textbook</h3>
                <p className="small" style={{ color: '#b9bec8' }}>
                  Alongside academics, students take part in activities, participation rounds and school gatherings that
                  build confidence and character. Parents see this progress first-hand at the Monthly Open House.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  <Link href="/campus-life" className="btn btn--light btn--sm">Campus Life</Link>
                  <Link href="/admissions/apply" className="btn btn--primary btn--sm">Apply Online</Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Parent Engagement" title="Parents are part of the academics"
            lead="Assessment only matters when families can see it. The school keeps parents close to the classroom." />
          <div className="grid grid--3">
            {[
              { icon: 'file-text', t: 'Regular Tasks', d: 'Daily classwork and home tasks keep practice continuous and visible.' },
              { icon: 'users', t: 'Monthly Open House', d: 'A standing monthly meeting between parents and teachers at each campus.' },
              { icon: 'star', t: 'Open House Events', d: 'Larger school gatherings, including at Ali Baba Stadium, Orangi Town No. 4.' },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i}>
                <div className="card card--pad" style={{ height: '100%' }}>
                  <span className="icon-circle"><Icon name={c.icon} size={20} /></span>
                  <h3 style={{ margin: '12px 0 8px' }}>{c.t}</h3>
                  <p className="small muted">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/admissions" className="btn btn--primary btn--lg">Admissions Information <Icon name="arrow-right" className="icon--arrow" /></Link>
          </div>
        </div>
      </section>

      <section className="section section--alt"><div className="container"><CTABand /></div></section>
    </>
  );
}
