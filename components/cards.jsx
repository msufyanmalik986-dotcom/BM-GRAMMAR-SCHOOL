import Link from 'next/link';
import Icon from './icons.jsx';
import { CopyButton } from './ui.jsx';
import { SCHOOL, mapDirectionsUrl, mapSearchUrl } from '../lib/content.js';

export function SectionHeading({ eyebrow, title, lead, center = false, light = false, blue = false }) {
  return (
    <div className={`section-head ${center ? 'section-head--center' : ''}`}>
      {eyebrow && <span className={`eyebrow ${light ? 'eyebrow--light' : blue ? 'eyebrow--blue' : ''}`}>{eyebrow}</span>}
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

export function Crumbs({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((c, i) => (
        <span key={c.href || i} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <span className="sep">/</span>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({ eyebrow, title, lead, crumbs, dark = false }) {
  return (
    <header className={`page-hero ${dark ? 'page-hero--ink' : ''}`}>
      <div className="container">
        {crumbs && <Crumbs items={crumbs} />}
        {eyebrow && <span className={`eyebrow ${dark ? 'eyebrow--light' : ''}`} style={{ marginTop: 16, display: 'inline-flex' }}>{eyebrow}</span>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </header>
  );
}

export function CampusCard({ branch }) {
  const monogram = branch.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <article className="card card--hover campus-card">
      <div className="campus-card__top">
        <span className="campus-card__monogram" aria-hidden="true">{monogram}</span>
        <div>
          <h3>{branch.name}</h3>
          <span className="tiny muted" style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Orangi Town · Karachi</span>
        </div>
      </div>
      <div className="campus-card__body">
        <p className="campus-card__row">
          <Icon name="map-pin" size={17} />
          <span>{branch.address || 'Street address on office record — call the school office for directions.'}</span>
        </p>
        <p className="campus-card__row">
          <Icon name="phone" size={17} />
          <span>{branch.phone || SCHOOL.phoneDisplay}</span>
        </p>
        <p className="small muted" style={{ margin: 0 }}>{branch.description}</p>
        <div className="campus-card__actions">
          <Link className="btn btn--primary btn--sm" href={`/campuses/${branch.slug}`}>View Campus <Icon name="arrow-right" className="icon--arrow" /></Link>
          <a className="btn btn--outline btn--sm" target="_blank" rel="noopener noreferrer" href={mapDirectionsUrl(branch.map_query || branch.name)}>
            <Icon name="navigate" size={15} /> Directions
          </a>
          <CopyButton text={branch.address || branch.map_query} label="Copy address" />
        </div>
      </div>
    </article>
  );
}

export function EventCard({ event }) {
  const d = event.date_value ? new Date(event.date_value) : null;
  return (
    <article className="card card--hover event-card">
      <div className="media media--169" style={{ position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image || '/assets/img/library-reading.jpg'} alt={`Representational image for ${event.title}`} loading="lazy" />
        {d ? (
          <div className="event-card__date">
            <b>{d.getDate()}</b>
            <span>{d.toLocaleString('en', { month: 'short' })} {d.getFullYear()}</span>
          </div>
        ) : (
          <span className="badge badge--red" style={{ position: 'absolute', top: 14, left: 14 }}>{event.category}</span>
        )}
      </div>
      <div className="event-card__body">
        <h3>{event.title}</h3>
        <div className="event-card__meta">
          <span><Icon name="calendar" size={15} /> {event.date_label || 'Date to be announced'}</span>
          <span><Icon name="map-pin" size={15} /> {event.location}</span>
        </div>
        <p className="small muted">{(event.description || '').slice(0, 130)}{(event.description || '').length > 130 ? '…' : ''}</p>
        <Link href={`/events/${event.slug}`} className="qa-arrow" style={{ marginTop: 'auto' }}>
          View Event <Icon name="arrow-right" className="icon--arrow" size={16} />
        </Link>
      </div>
    </article>
  );
}

export function NoticeCard({ notice }) {
  return (
    <article className="card card--hover card--pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <span className="badge badge--blue">{notice.category || 'Notice'}</span>
        <span className="tiny muted">{notice.published_at ? new Date(notice.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
      </div>
      <h3 style={{ margin: '12px 0 8px' }}><Link href={`/notices/${notice.slug}`}>{notice.title}</Link></h3>
      <p className="small muted">{(notice.content || '').slice(0, 160)}…</p>
    </article>
  );
}

export function FacultyCard({ member }) {
  const initials = member.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <article className="card card--hover card--pad" style={{ textAlign: 'center' }}>
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photo} alt={`Portrait of ${member.name}`} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px' }} />
      ) : (
        <span className="principal-card avatar" style={{ margin: '0 auto 14px', width: 96, height: 96, fontSize: 2.1 }}>{initials}</span>
      )}
      <h3>{member.name}</h3>
      <p className="eyebrow eyebrow--blue" style={{ justifyContent: 'center', marginTop: 8 }}>{member.position}</p>
      {member.qualification && <p className="small muted" style={{ marginTop: 8 }}>{member.qualification}</p>}
      {member.bio && <p className="small muted" style={{ marginTop: 10 }}>{member.bio}</p>}
    </article>
  );
}

export function CTABand({ title = 'Ready to take the next step?', text = 'Admission is free. Start your child\u2019s application online today, or contact the school office for guidance.' }) {
  return (
    <div className="cta-band">
      <div>
        <h2>{title}</h2>
        <p className="lead" style={{ marginTop: 10 }}>{text}</p>
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href="/admissions/apply" className="btn btn--light btn--lg">Apply Online <Icon name="arrow-right" className="icon--arrow" /></Link>
        <Link href="/contact" className="btn btn--light-outline btn--lg">Contact Us</Link>
      </div>
    </div>
  );
}

export function ContactQuickCard() {
  return (
    <div className="card card--pad" style={{ display: 'grid', gap: 14 }}>
      <h3>School Office</h3>
      <p className="campus-card__row"><Icon name="phone" size={17} /> <a href={`tel:${SCHOOL.phoneIntl}`} style={{ color: 'var(--color-secondary)', fontWeight: 650 }}>{SCHOOL.phoneDisplay}</a></p>
      <p className="campus-card__row"><Icon name="mail" size={17} /> <a href={`mailto:${SCHOOL.email}`} style={{ color: 'var(--color-secondary)', fontWeight: 650 }}>{SCHOOL.email}</a></p>
      <p className="campus-card__row"><Icon name="map-pin" size={17} /> Plot No. 518, Sector 4/F, Islam Nagar, Orangi Town, Karachi</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a className="btn btn--secondary btn--sm" href={`tel:${SCHOOL.phoneIntl}`}><Icon name="phone" size={15} /> Call School</a>
        <a className="btn btn--outline btn--sm" target="_blank" rel="noopener noreferrer" href={mapSearchUrl('BM Grammar School, Orangi Town, Karachi')}><Icon name="map-pin" size={15} /> View on Map</a>
      </div>
    </div>
  );
}
