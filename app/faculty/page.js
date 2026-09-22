import Icon from '../../components/icons.jsx';
import { Reveal } from '../../components/ui.jsx';
import { PageHero, SectionHeading, FacultyCard, CTABand } from '../../components/cards.jsx';
import { q } from '../../lib/db.js';

export const metadata = {
  title: 'Faculty',
  description: 'Leadership and teaching faculty of BM Grammar School Karachi. Professional, qualified teachers across all levels from Montessori to Matric.',
  alternates: { canonical: '/faculty' },
};

export default function FacultyPage() {
  const faculty = q.faculty();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Faculty' }]}
        eyebrow="Our People"
        title="Professional teachers, led with experience."
        lead="BM Grammar School is led by Principal Shakeel Ahmed Bhatti and staffed by professional, qualified teachers across every level."
      />

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Leadership" title="School leadership" />
          <div className="grid grid--3">
            {faculty.map((f, i) => (
              <Reveal key={f.id} delay={i}><FacultyCard member={f} /></Reveal>
            ))}
          </div>
          <p className="tiny muted" style={{ marginTop: 18 }}>
            Full faculty profiles — names, qualifications and subjects — are published by the school office as they are verified.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading center eyebrow="Teaching at BM Grammar School" title="What we expect of every teacher" />
          <div className="grid grid--3">
            {[
              { icon: 'book-open', t: 'Prepared Lessons', d: 'Every class is planned: what is taught today is practised today and reviewed tomorrow.' },
              { icon: 'users', t: 'Every Child Seen', d: 'Small routines — questions, participation, checks — ensure no student drifts unnoticed.' },
              { icon: 'edit', t: 'Regular Tasks', d: 'Teachers set and check daily tasks so practice is continuous and measurable.' },
              { icon: 'shield', t: 'Discipline & Care', d: 'A respectful classroom where discipline and warmth go together.' },
              { icon: 'star', t: 'Board Preparation', d: 'Secondary and Matric teachers train students in examination discipline and past-paper practice.' },
              { icon: 'mail', t: 'Parent Communication', d: 'Teachers meet parents at the Monthly Open House and share honest progress.' },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i % 3}>
                <div className="card card--hover card--pad" style={{ height: '100%' }}>
                  <span className={`icon-circle ${i % 2 ? 'icon-circle--blue' : ''}`}><Icon name={c.icon} size={20} /></span>
                  <h3 style={{ margin: '12px 0 8px' }}>{c.t}</h3>
                  <p className="small muted">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section"><div className="container"><CTABand title="Meet us in person" text="The best way to meet our teachers is at the Monthly Open House — or start an application and visit your campus office." /></div></section>
    </>
  );
}
