import Link from 'next/link';
import Icon from '../../components/icons.jsx';
import { Reveal } from '../../components/ui.jsx';
import { PageHero, SectionHeading, CTABand } from '../../components/cards.jsx';
import { DAILY_FLOW, SCHOOL } from '../../lib/content.js';

export const metadata = {
  title: 'Campus Life',
  description: 'Student life at BM Grammar School Karachi: classroom learning, daily tasks, activities, Open Houses and parent interaction.',
  alternates: { canonical: '/campus-life' },
};

export default function CampusLifePage() {
  return (
    <>
      <PageHero
        dark
        crumbs={[{ label: 'Campus Life' }]}
        eyebrow="Student Life"
        title="A school day with rhythm and purpose."
        lead="Classroom learning, daily tasks, participation and regular parent interaction — campus life at BM Grammar School is structured, active and warm."
      />

      <section className="section">
        <div className="container split">
          <Reveal>
            <span className="eyebrow">Classroom Learning</span>
            <h2 style={{ marginTop: 14 }}>Lessons that continue after the bell.</h2>
            <p className="muted" style={{ marginTop: 14 }}>
              What is taught in class is reinforced the same day. Regular student tasks — classwork, home tasks and
              participation rounds — turn lessons into habits, and teachers review progress continuously.
            </p>
            <ol className="flow" style={{ marginTop: 28, gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
              {DAILY_FLOW.map((s) => (
                <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={1}>
            <div className="media media--32 media--frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/matric-exam.jpg" alt="Representational image: students writing with concentration" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading center eyebrow="Activities & Participation" title="Learning out loud"
            lead="Students take part in activities, sports periods and school gatherings that build confidence alongside academics." />
          <div className="grid grid--3">
            <Reveal><div className="media media--43 media--hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/sports-ground.jpg" alt="Representational image: students playing football during a games period" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div><h3 style={{ marginTop: 14 }}>Games & Sports</h3><p className="small muted">Outdoor games periods keep students active and teach teamwork.</p></Reveal>
            <Reveal delay={1}><div className="media media--43 media--hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/library-reading.jpg" alt="Representational image: reading circle in a library" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div><h3 style={{ marginTop: 14 }}>Reading & Language</h3><p className="small muted">Guided reading builds the language confidence every subject depends on.</p></Reveal>
            <Reveal delay={2}><div className="media media--43 media--hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/science-lab.jpg" alt="Representational image: practical science activity" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div><h3 style={{ marginTop: 14 }}>Practical Work</h3><p className="small muted">Hands-on activity brings science and mathematics to life.</p></Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <Reveal delay={1}>
            <div className="media media--43 media--frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/img/montessori-learning.jpg" alt="Representational image: early-years hands-on learning" loading="lazy" />
              <span className="media__credit">Representational image</span>
            </div>
          </Reveal>
          <Reveal>
            <span className="eyebrow eyebrow--blue">Parent Interaction</span>
            <h2 style={{ marginTop: 14 }}>Open doors, every month.</h2>
            <p className="muted" style={{ marginTop: 14 }}>
              The Monthly Open House is the heartbeat of parent interaction: families review work, meet teachers and
              plan the next steps with the administration. The school&rsquo;s larger Open House at {SCHOOL.openHouseVenue} brings
              the whole community together.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link href="/events" className="btn btn--secondary">Events & Open House <Icon name="arrow-right" className="icon--arrow" /></Link>
              <Link href="/gallery" className="btn btn--outline">View Gallery</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt"><div className="container"><CTABand /></div></section>
    </>
  );
}
