import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '../../../components/icons.jsx';
import { PageHero, EventCard } from '../../../components/cards.jsx';
import { ShareButton } from '../../../components/share.jsx';
import { q } from '../../../lib/db.js';

export function generateStaticParams() {
  return q.events().map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }) {
  const e = q.event(params.slug);
  if (!e) return { title: 'Event not found' };
  return { title: e.title, description: e.description?.slice(0, 160), alternates: { canonical: `/events/${e.slug}` } };
}

export default function EventDetailPage({ params }) {
  const e = q.event(params.slug);
  if (!e) notFound();
  const related = q.events().filter((x) => x.slug !== e.slug).slice(0, 2);
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Events', href: '/events' }, { label: e.title }]}
        eyebrow={e.category || 'Event'}
        title={e.title}
        lead={e.location}
      />
      <section className="section">
        <div className="container grid grid--3" style={{ gridTemplateColumns: '1.25fr 0.75fr', alignItems: 'start' }}>
          <div>
            <div className="media media--169 media--frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.image || '/assets/img/library-reading.jpg'} alt={`Representational image for ${e.title}`} />
              <span className="media__credit">Representational image</span>
            </div>
            <div className="prose" style={{ marginTop: 28, maxWidth: 'none' }}>
              <p className="lead">{e.description}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }} className="no-print">
              <ShareButton title={e.title} />
              <Link href="/events" className="btn btn--outline"><Icon name="arrow-left" size={16} /> Back to Events</Link>
            </div>
          </div>
          <aside className="card card--pad" style={{ position: 'sticky', top: 'calc(var(--header-h) + 20px)' }}>
            <h3 style={{ marginBottom: 14 }}>Event information</h3>
            <p className="campus-card__row"><Icon name="calendar" size={17} /> {e.date_label || 'Date to be announced'}</p>
            <p className="campus-card__row" style={{ marginTop: 10 }}><Icon name="map-pin" size={17} /> {e.location}</p>
            <p className="campus-card__row" style={{ marginTop: 10 }}><Icon name="users" size={17} /> Families, students and community</p>
            <hr className="divider" style={{ margin: '16px 0' }} />
            <Link href="/admissions/apply" className="btn btn--primary btn--block">Apply Online</Link>
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <h2 style={{ marginBottom: 24 }}>Related events</h2>
            <div className="grid grid--2">{related.map((r) => <EventCard key={r.slug} event={r} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
