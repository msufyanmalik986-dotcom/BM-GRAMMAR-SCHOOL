import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '../../../components/icons.jsx';
import { Reveal, CopyButton } from '../../../components/ui.jsx';
import { PageHero, SectionHeading, CTABand, EventCard } from '../../../components/cards.jsx';
import { q } from '../../../lib/db.js';
import { SCHOOL, mapSearchUrl, mapDirectionsUrl } from '../../../lib/content.js';

export function generateStaticParams() {
  return q.branches().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }) {
  const b = q.branch(params.slug);
  if (!b) return { title: 'Campus not found' };
  return {
    title: `${b.name} — Campus`,
    description: `${b.name} of BM Grammar School Karachi. ${b.address ? `Address: ${b.address}.` : 'Contact the school office for the street address.'} Phone ${b.phone || SCHOOL.phoneDisplay}.`,
    alternates: { canonical: `/campuses/${b.slug}` },
  };
}

export default function CampusDetailPage({ params }) {
  const b = q.branch(params.slug);
  if (!b) notFound();
  const events = q.events();
  const mapUrl = mapSearchUrl(b.map_query || b.name);
  const dirUrl = mapDirectionsUrl(b.map_query || b.address || b.name);
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Campuses', href: '/campuses' }, { label: b.name }]}
        eyebrow="Campus"
        title={b.name}
        lead={b.description}
      />

      <section className="section">
        <div className="container grid grid--3" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 22 }}>
            <div className="card card--pad">
              <h3 style={{ marginBottom: 16 }}>Campus information</h3>
              <div style={{ display: 'grid', gap: 14 }}>
                <p className="campus-card__row"><Icon name="map-pin" size={18} /> <span>{b.address || 'Street address on office record — call the school office for directions.'}</span></p>
                <p className="campus-card__row"><Icon name="phone" size={18} /> <a href={`tel:${SCHOOL.phoneIntl}`} style={{ color: 'var(--color-secondary)', fontWeight: 650 }}>{b.phone || SCHOOL.phoneDisplay}</a></p>
                <p className="campus-card__row"><Icon name="cap" size={18} /> <span>Montessori to Matric · separate boys&rsquo; and girls&rsquo; classes · free admission.</span></p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
                <a className="btn btn--primary btn--sm" target="_blank" rel="noopener noreferrer" href={mapUrl}><Icon name="map-pin" size={15} /> View on Map</a>
                <a className="btn btn--secondary btn--sm" target="_blank" rel="noopener noreferrer" href={dirUrl}><Icon name="navigate" size={15} /> Get Directions</a>
                <a className="btn btn--outline btn--sm" href={`tel:${SCHOOL.phoneIntl}`}><Icon name="phone" size={15} /> Call School</a>
                <CopyButton text={b.address || b.map_query} label="Copy address" />
              </div>
            </div>

            <div className="card card--pad">
              <h3 style={{ marginBottom: 10 }}>Academics at this campus</h3>
              <p className="small muted">
                This campus follows the school&rsquo;s complete programme: Montessori, Primary, Middle, Secondary and
                Matric, with separate classes for boys and girls and the Monthly Open House for parents. Current class
                availability is confirmed by the campus office.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                {['Montessori', 'Primary', 'Middle', 'Secondary', 'Matric'].map((s) => (
                  <span key={s} className="badge badge--blue">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Location</h3>
              <p className="tiny muted">Map opens in Google Maps with the campus destination encoded.</p>
            </div>
            <div style={{ padding: 22, background: 'var(--color-surface-warm)' }}>
              <div className="media media--square" style={{ background: 'linear-gradient(140deg,var(--color-secondary-soft),#fff)' , display:'grid', placeItems:'center'}}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <span className="icon-circle icon-circle--blue" style={{ margin: '0 auto' }}><Icon name="map-pin" size={24} /></span>
                  <p className="strong" style={{ marginTop: 12 }}>{b.name}</p>
                  <p className="tiny muted" style={{ marginTop: 6 }}>{b.address || 'Orangi Town, Karachi'}</p>
                  <a className="btn btn--secondary btn--sm" style={{ marginTop: 14 }} target="_blank" rel="noopener noreferrer" href={mapUrl}>Open Map <Icon name="external" size={14} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeading eyebrow="Campus Events" title="Events at and near this campus" />
          <div className="grid grid--2">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      </section>

      <section className="section"><div className="container"><CTABand title={`Apply to ${b.name}`} text="Admission is free. Start the application online and select this campus, or call the school office for help." /></div></section>
    </>
  );
}
