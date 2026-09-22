import Link from 'next/link';
import Icon from '../components/icons.jsx';
import { Reveal } from '../components/ui.jsx';
import Journey from '../components/journey.jsx';
import { SectionHeading, CampusCard, EventCard, CTABand, ContactQuickCard } from '../components/cards.jsx';
import { SCHOOL, LEVELS, DAILY_FLOW } from '../lib/content.js';
import { q } from '../lib/db.js';

export const metadata = {
  title: 'BM Grammar School — Montessori to Matric | Karachi',
  description:
    'BM Grammar School Karachi: Montessori to Matric education, separate boys\u2019 and girls\u2019 classes, qualified teachers, monthly Open Houses and free admission across Al Sadaf Colony, Mominabad and Orangi Town campuses.',
  alternates: { canonical: '/' },
};

const QUICK = [
  { icon: 'file-text', title: 'Online Admission', text: 'Start your child\u2019s application in minutes and track it from your dashboard.', href: '/admissions/apply', cta: 'Apply Online' },
  { icon: 'cap', title: 'Academics', text: 'Explore education from Montessori to Matric with structured, disciplined teaching.', href: '/academics', cta: 'Explore Academics' },
  { icon: 'map-pin', title: 'Our Campuses', text: 'Find the nearest BM Grammar School campus in Orangi Town, Karachi.', href: '/campuses', cta: 'Find a Campus' },
  { icon: 'phone', title: 'Contact', text: 'Call the school office or write to us — we are happy to help.', href: '/contact', cta: 'Get in Touch' },
];

export default function HomePage() {
  const branches = q.branches();
  const events = q.events().slice(0, 2);
  const gallery = q.gallery().slice(0, 6);
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/img/hero-classroom.jpg" alt="" />
        </div>
        <div className="hero__overlay" aria-hidden="true" />
        <div className="container">
          <div className="hero__content">
            <span className="hero__kicker"><Icon name="star" size={14} /> Montessori to Matric · Karachi</span>
            <h1>{SCHOOL.headline}</h1>
            <p className="lead">
              BM Grammar School serves the families of Orangi Town with separate boys&rsquo; and girls&rsquo; classes,
              professional teachers, regular student tasks and a positive learning environment — with free admission.
            </p>
            <div className="hero__actions">
              <Link href="/admissions/apply" className="btn btn--primary btn--lg">Apply Online <Icon name="arrow-right" className="icon--arrow" /></Link>
              <Link href="/about" className="btn btn--light-outline btn--lg">Explore Our School</Link>
            </div>
            <p className="hero__motto"><Icon name="book-open" size={18} /> &ldquo;{SCHOOL.tagline}&rdquo;</p>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          Scroll <Icon name="arrow-down" size={16} />
        </div>
      </section>

      {/* ---------- QUICK ACTIONS ---------- */}
      <div className="container" style={{ position: 'relative', zIndex: 6 }}>
        <div className="qa-grid">
          {QUICK.map((qa, i) => (
            <Reveal key={qa.title} delay={Math.min(i, 3)}>
              <Link href={qa.href} className="card card--hover qa-card" style={{ height: '100%' }}>
                <span className="icon-wrap"><Icon name={qa.icon} size={22} /></span>
                <h3>{qa.title}</h3>
                <p>{qa.text}</p>
                <span className="qa-arrow">{qa.cta} <Icon name="arrow-right" className="icon--arrow" size={16} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---------- WELCOME ---------- */}
      <section className="section">
        <div className="container split">
          <Reveal>
            <div className="img-duo" style={{ paddingBottom: '18%' }}>
              <div className="media media--43 media--back">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/img/library-reading.jpg" alt="Representational image: a teacher reading with children in a library" loading="lazy" />
              </div>
              <div className="media media--square media--front">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/img/montessori-learning.jpg" alt="Representational image: a child learning with number cards" loading="lazy" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <span className="eyebrow">Welcome to BM Grammar School</span>
            <h2 style={{ marginTop: 14 }}>A trusted place to learn, from the first classroom to Matric.</h2>
            <p className="lead" style={{ marginTop: 16 }}>
              BM Grammar School is a Karachi institution providing education from Montessori to Matric across its
              campuses in Orangi Town. The school pairs disciplined, structured teaching with a warm and positive
              environment, and keeps parents closely involved through regular tasks and Monthly Open Houses.
            </p>
            <ul className="focus-list" style={{ marginTop: 22 }}>
              <li><Icon name="check-circle" size={17} /> Separate classes for boys and girls</li>
              <li><Icon name="check-circle" size={17} /> Professional, qualified teachers</li>
              <li><Icon name="check-circle" size={17} /> Regular daily student tasks</li>
              <li><Icon name="check-circle" size={17} /> Monthly Open Houses for parents</li>
            </ul>
            <Link href="/about" className="btn btn--secondary" style={{ marginTop: 26 }}>Discover Our Story <Icon name="arrow-right" className="icon--arrow" /></Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- ACADEMIC JOURNEY ---------- */}
      <section className="section section--alt">
        <div className="container">
          <SectionHeading
            eyebrow="Academic Journey"
            title="One continuous path: Montessori → Matric"
            lead="Each stage builds carefully on the last. Select a stage to see how learning develops."
          />
          <Journey />
        </div>
      </section>

      {/* ---------- EDUCATIONAL ENVIRONMENT ---------- */}
      <section className="section">
        <div className="container split">
          <Reveal>
            <span className="eyebrow eyebrow--blue">Educational Environment</span>
            <h2 style={{ marginTop: 14 }}>Discipline, warmth and daily practice.</h2>
            <p className="lead" style={{ marginTop: 16 }}>
              Learning at BM Grammar School is structured and continuous. Concepts taught in class are reinforced the
              same day through tasks and practice, and progress is reviewed with parents — never left to chance.
            </p>
            <div className="grid grid--2" style={{ marginTop: 26, gap: 16 }}>
              <div className="card card--pad"><span className="icon-circle"><Icon name="users" size={20} /></span><h3 style={{ fontSize: '1.05rem', margin: '12px 0 6px' }}>Qualified Teachers</h3><p className="small muted">Professional teachers who plan, teach and review every class.</p></div>
              <div className="card card--pad"><span className="icon-circle icon-circle--blue"><Icon name="book-open" size={20} /></span><h3 style={{ fontSize: '1.05rem', margin: '12px 0 6px' }}>Positive Environment</h3><p className="small muted">A respectful, focused atmosphere where every child can ask and answer.</p></div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="media media--32 media--frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/teacher-classroom.jpg" alt="Representational image: a teacher in a prepared classroom" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- BOYS & GIRLS ---------- */}
      <section className="section section--white" style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <SectionHeading center eyebrow="Separate Learning Environments" title="Dedicated classes for boys and girls"
            lead="The school provides separate classes for boys and girls, so every student learns in a comfortable, focused and respectful setting." />
          <div className="grid grid--2" style={{ maxWidth: 860, margin: '0 auto' }}>
            <Reveal><div className="card card--pad" style={{ textAlign: 'center', paddingBlock: 40 }}>
              <span className="icon-circle" style={{ margin: '0 auto', background: 'var(--color-secondary-soft)', color: 'var(--color-secondary)' }}><Icon name="cap" size={22} /></span>
              <h3 style={{ margin: '14px 0 8px' }}>Boys&rsquo; Classes</h3>
              <p className="small muted">Structured classes with disciplined routines, daily tasks and continuous assessment from Montessori to Matric.</p>
            </div></Reveal>
            <Reveal delay={1}><div className="card card--pad" style={{ textAlign: 'center', paddingBlock: 40 }}>
              <span className="icon-circle" style={{ margin: '0 auto' }}><Icon name="cap" size={22} /></span>
              <h3 style={{ margin: '14px 0 8px' }}>Girls&rsquo; Classes</h3>
              <p className="small muted">A safe, encouraging environment with the same rigorous programme, qualified teachers and parent engagement.</p>
            </div></Reveal>
          </div>
        </div>
      </section>

      {/* ---------- DAILY RHYTHM ---------- */}
      <section className="section">
        <div className="container">
          <SectionHeading center eyebrow="Student Activities" title="The rhythm of a school day"
            lead="A representation of how regular student tasks reinforce learning — concept, task, participation, practice and progress." />
          <ol className="flow">
            {DAILY_FLOW.map((s, i) => (
              <Reveal as="li" key={s.title} delay={Math.min(i, 3)}><h3>{s.title}</h3><p>{s.text}</p></Reveal>
            ))}
          </ol>
          <p className="tiny muted" style={{ textAlign: 'center', marginTop: 18 }}>This illustrates the school&rsquo;s every-day approach to tasks and practice, not a fixed timetable.</p>
        </div>
      </section>

      {/* ---------- CAMPUSES ---------- */}
      <section className="section section--alt">
        <div className="container">
          <SectionHeading eyebrow="Our Campuses" title="Three campuses across Orangi Town, Karachi"
            lead="Choose the campus nearest to your home. Each campus follows the same Montessori-to-Matric programme." />
          <div className="grid grid--3">
            {branches.map((b, i) => (
              <Reveal key={b.slug} delay={Math.min(i, 2)}><CampusCard branch={b} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- OPEN HOUSE ---------- */}
      <section className="section section--ink">
        <div className="container split">
          <Reveal>
            <span className="eyebrow eyebrow--light">Open House</span>
            <h2 style={{ marginTop: 14 }}>Open House at BM Grammar School</h2>
            <p className="lead" style={{ marginTop: 16 }}>
              The school holds Monthly Open Houses where parents meet teachers and review their child&rsquo;s progress.
              A larger Open House gathering takes place at {SCHOOL.openHouseVenue} — the school office announces each date
              on its official channels.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
              <Link href="/events/monthly-open-house" className="btn btn--primary">About Open House</Link>
              <a href={`tel:${SCHOOL.phoneIntl}`} className="btn btn--light-outline"><Icon name="phone" size={17} /> Ask for this month&rsquo;s date</a>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="media media--43 media--frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/sports-ground.jpg" alt="Representational image: students at an outdoor school gathering" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- EVENTS ---------- */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Events" title="School events and gatherings"
            lead="Open Houses and school gatherings are announced by the school office. Check back for updated dates." />
          <div className="grid grid--2">
            {events.map((e, i) => (
              <Reveal key={e.slug} delay={i}><EventCard event={e} /></Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link href="/events" className="btn btn--outline">Explore Events <Icon name="arrow-right" className="icon--arrow" /></Link>
          </div>
        </div>
      </section>

      {/* ---------- GALLERY PREVIEW ---------- */}
      <section className="section section--alt">
        <div className="container">
          <SectionHeading center eyebrow="Gallery" title="Learning, in pictures"
            lead="Professional representational imagery illustrating the environments we strive for. School-event photographs are added by the office." />
          <div className="masonry">
            {gallery.map((g) => (
              <figure className="g-item" key={g.id} style={{ cursor: 'default' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image_url} alt={g.alt_text} loading="lazy" />
                <figcaption>{g.title} · Representational</figcaption>
              </figure>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link href="/gallery" className="btn btn--secondary">View Gallery <Icon name="arrow-right" className="icon--arrow" /></Link>
          </div>
        </div>
      </section>

      {/* ---------- ADMISSIONS CTA + CONTACT ---------- */}
      <section className="section">
        <div className="container" style={{ display: 'grid', gap: 28 }}>
          <CTABand />
          <div className="grid grid--2" style={{ alignItems: 'stretch' }}>
            <ContactQuickCard />
            <div className="card card--pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
              <h3>Have a question?</h3>
              <p className="muted" style={{ fontSize: '0.95rem' }}>
                Whether you are choosing a campus, confirming this year&rsquo;s Open House date, or starting an
                application, the school office will guide you. You can also send a message through the contact page and
                the office will respond.
              </p>
              <div><Link href="/contact" className="btn btn--outline btn--sm">Contact BM Grammar School <Icon name="arrow-right" className="icon--arrow" /></Link></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
