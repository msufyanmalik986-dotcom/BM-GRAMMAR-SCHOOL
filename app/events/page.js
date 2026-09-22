import { Reveal } from '../../components/ui.jsx';
import { PageHero, EventCard, SectionHeading } from '../../components/cards.jsx';
import { q } from '../../lib/db.js';
import { SCHOOL } from '../../lib/content.js';

export const metadata = {
  title: 'Events',
  description: 'Events and Open Houses at BM Grammar School Karachi, including the Monthly Open House and the Grand Open House at Ali Baba Stadium, Orangi Town No. 4.',
  alternates: { canonical: '/events' },
};

export default function EventsPage() {
  const events = q.events();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Events' }]}
        eyebrow="Events & Open House"
        title="Gatherings that keep school and family close."
        lead="Open Houses are the school's standing invitation to parents. Exact dates are announced by the school office on its official channels."
      />

      <section className="section">
        <div className="container">
          <div className="grid grid--2">
            {events.map((e, i) => (
              <Reveal key={e.slug} delay={i % 2}><EventCard event={e} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--ink">
        <div className="container split">
          <div>
            <span className="eyebrow eyebrow--light">Featured · Open House</span>
            <h2 style={{ marginTop: 14 }}>Open House at BM Grammar School</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              From the Monthly Open House at each campus to the large gathering at {SCHOOL.openHouseVenue}, these events
              are where families see student work, meet teachers and hear the school&rsquo;s plans directly from its leadership.
            </p>
            <p className="small" style={{ color: '#b9bec8', marginTop: 14 }}>
              Event dates, guest lists and programmes are announced by the school office. Call {SCHOOL.phoneDisplay} for the next Open House date.
            </p>
          </div>
          <div className="media media--43 media--frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/sports-ground.jpg" alt="Representational image: an outdoor school gathering" loading="lazy" />
            <span className="media__credit">Representational image</span>
          </div>
        </div>
      </section>
    </>
  );
}
