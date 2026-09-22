import Link from 'next/link';
import Icon from '../../components/icons.jsx';
import { Reveal } from '../../components/ui.jsx';
import { PageHero, SectionHeading, CTABand } from '../../components/cards.jsx';
import { SCHOOL } from '../../lib/content.js';
import { q } from '../../lib/db.js';

export const metadata = {
  title: 'About',
  description: 'Who we are, our educational philosophy, our principal and the learning environment at BM Grammar School, Karachi.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const principal = q.faculty().find((f) => f.position === 'Principal');
  return (
    <>
      <PageHero
        crumbs={[{ label: 'About' }]}
        eyebrow="Who We Are"
        title="A school built on discipline, care and vision."
        lead={`${SCHOOL.name} provides education from Montessori to Matric in Karachi, guided by its motto: \u201C${SCHOOL.tagline}.\u201D`}
      />

      <section className="section">
        <div className="container split">
          <Reveal>
            <span className="eyebrow">Our Story</span>
            <h2 style={{ marginTop: 14 }}>Rooted in the communities of Orangi Town</h2>
            <div className="prose" style={{ marginTop: 16 }}>
              <p className="lead">
                BM Grammar School serves the neighbourhoods of Orangi Town, Karachi through its campuses in Al Sadaf
                Colony, Mominabad and Orangi Town, with its documented head campus at Plot No. 518, Sector No. 4/F,
                Islam Nagar.
              </p>
              <p className="muted">
                The school was established to give families of the area an accessible, disciplined and complete
                education — from a child&rsquo;s first Montessori classroom through Matriculation — with admission kept
                free so that no family is turned away at the door.
              </p>
              <p className="muted">
                Classes are held separately for boys and girls, taught by professional teachers, and reinforced with
                regular daily tasks. Parents remain partners in their child&rsquo;s progress through Monthly Open
                Houses and the school&rsquo;s larger Open House gatherings.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="media media--43 media--frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/hero-classroom.jpg" alt="Representational image: a welcoming classroom with teacher and students" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading center eyebrow="Educational Philosophy" title="What we stand for" />
          <div className="grid grid--3">
            {[
              { icon: 'book-open', t: 'Vision', d: `\u201C${SCHOOL.tagline}\u201D — the school works to give every student a new vision for their thoughts and their future.` },
              { icon: 'shield', t: 'Discipline', d: 'Structured classes, regular tasks and examination practice build habits that last beyond school.' },
              { icon: 'users', t: 'Parent Partnership', d: 'Monthly Open Houses keep parents informed and involved in every stage of progress.' },
              { icon: 'cap', t: 'Complete Path', d: 'One continuous programme from Montessori to Matric, so students never have to switch schools.' },
              { icon: 'star', t: 'Positive Environment', d: 'Separate boys\u2019 and girls\u2019 classes in a respectful, encouraging atmosphere.' },
              { icon: 'home', t: 'Community', d: 'Campuses placed within the neighbourhoods we serve, with free admission for all families.' },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i % 3}>
                <div className="card card--hover card--pad" style={{ height: '100%' }}>
                  <span className={`icon-circle ${i % 2 ? 'icon-circle--blue' : ''}`}><Icon name={c.icon} size={20} /></span>
                  <h3 style={{ margin: '14px 0 8px' }}>{c.t}</h3>
                  <p className="small muted">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card card--pad" style={{ maxWidth: 780, margin: '0 auto' }}>
            <div className="principal-card">
              <span className="avatar" aria-hidden="true">{(principal?.name || 'P B').split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <div>
                <span className="eyebrow">Principal&rsquo;s Office</span>
                <h3 style={{ marginTop: 8 }}>{principal?.name || SCHOOL.principal}</h3>
                <p className="muted" style={{ marginTop: 6 }}>{principal?.bio || `${SCHOOL.principalRole} of ${SCHOOL.name}.`}</p>
                <p className="tiny muted" style={{ marginTop: 10 }}>The principal&rsquo;s full message and biography are published by the school office.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container split">
          <Reveal delay={1}>
            <div className="media media--32 media--frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/library-reading.jpg" alt="Representational image: guided reading in a library" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div>
          </Reveal>
          <Reveal>
            <span className="eyebrow eyebrow--blue">Learning Environment & Student Development</span>
            <h2 style={{ marginTop: 14 }}>Every child known, every parent involved.</h2>
            <p className="muted" style={{ marginTop: 14 }}>
              Students develop academically through a staged programme and personally through participation, tasks and
              school gatherings. The community dimension — Open Houses at the campuses and at Ali Baba Stadium, Orangi
              Town No. 4 — keeps the school connected to the families it serves.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <Link href="/academics" className="btn btn--secondary">Academics <Icon name="arrow-right" className="icon--arrow" /></Link>
              <Link href="/campus-life" className="btn btn--outline">Campus Life</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section"><div className="container"><CTABand /></div></section>
    </>
  );
}
