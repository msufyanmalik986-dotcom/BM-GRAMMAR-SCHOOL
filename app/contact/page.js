import Icon from '../../components/icons.jsx';
import ContactClient from '../../components/contact-client.jsx';
import { PageHero, CampusCard, ContactQuickCard } from '../../components/cards.jsx';
import { Reveal } from '../../components/ui.jsx';
import { q } from '../../lib/db.js';
import { SCHOOL } from '../../lib/content.js';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with BM Grammar School Karachi — phone 0312-2690757, email bmgsone1@yahoo.com, campus addresses, maps and directions.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const branches = q.branches();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Contact' }]}
        eyebrow="Get in Touch"
        title="We're here to help."
        lead={`Call the school office on ${SCHOOL.phoneDisplay}, email ${SCHOOL.email}, or send a message below — the office reads every message.`}
      />
      <section className="section">
        <div className="container grid grid--3" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          <ContactClient />
          <div style={{ display: 'grid', gap: 18 }}>
            <ContactQuickCard />
            <div className="card card--pad">
              <h3 style={{ marginBottom: 8 }}>Official channels</h3>
              <ul style={{ display: 'grid', gap: 10 }}>
                {SCHOOL.social.map((s) => (
                  <li key={s.url} className="campus-card__row">
                    <span className="icon-circle" style={{ width: 34, height: 34 }}><IconSocial name={s.name} /></span>
                    <span><b className="small">{s.label}</b><br /><a className="tiny" style={{ color: 'var(--color-secondary)' }} href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace('https://www.', '')}</a></span>
                  </li>
                ))}
              </ul>
              <p className="tiny muted" style={{ marginTop: 12 }}>Only the school&rsquo;s verified official profiles are listed here.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section section--alt">
        <div className="container">
          <h2 style={{ marginBottom: 26 }}>Campus contacts</h2>
          <div className="grid grid--3">
            {branches.map((b, i) => (
              <Reveal key={b.slug} delay={i}><CampusCard branch={b} /></Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function IconSocial({ name }) {
  return <Icon name={name === 'YouTube' ? 'youtube' : 'facebook'} size={16} />;
}
