import Link from 'next/link';
import { cookies } from 'next/headers';
import Icon from '../../components/icons.jsx';
import { SESSION_COOKIE, userFromToken } from '../../lib/auth.js';
import { db } from '../../lib/db.js';

export const metadata = { title: 'Administration Overview', robots: { index: false, follow: false } };

export default async function AdminOverview() {
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user || user.role !== 'ADMIN') return null;
  const apps = db.prepare('SELECT COUNT(*) c FROM admission_applications').get().c;
  const pending = db.prepare("SELECT COUNT(*) c FROM admission_applications WHERE status IN ('submitted','under_review')").get().c;
  const users = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  const messages = db.prepare("SELECT COUNT(*) c FROM contact_messages WHERE status = 'new'").get().c;
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>Administration</h1>
        <Link href="/admin/applications" className="btn btn--primary"><Icon name="file-text" size={17} /> Manage Applications</Link>
      </div>
      <div className="stat-cards">
        <div className="card stat-card"><div className="num">{apps}</div><div className="lbl">Applications</div></div>
        <div className="card stat-card"><div className="num" style={{ color: 'var(--color-warning)' }}>{pending}</div><div className="lbl">Awaiting Review</div></div>
        <div className="card stat-card"><div className="num">{users}</div><div className="lbl">Parent Accounts</div></div>
        <div className="card stat-card"><div className="num" style={{ color: 'var(--color-secondary)' }}>{messages}</div><div className="lbl">New Messages</div></div>
      </div>
      <div className="grid grid--3" style={{ marginTop: 26 }}>
        {[
          { href: '/admin/applications', icon: 'file-text', t: 'Applications', d: 'Review, filter and update admission application statuses.' },
          { href: '/admin/branches', icon: 'map-pin', t: 'Branches', d: 'Campus records: addresses, phones, maps and descriptions.' },
          { href: '/admin/events', icon: 'calendar', t: 'Events', d: 'Publish Open House dates and school events.' },
          { href: '/admin/gallery', icon: 'star', t: 'Gallery', d: 'Manage photographs, categories and alt text.' },
          { href: '/admin/faculty', icon: 'users', t: 'Faculty', d: 'Publish verified staff profiles.' },
          { href: '/admin/notices', icon: 'file-text', t: 'Notices', d: 'Publish official announcements.' },
          { href: '/admin/faqs', icon: 'info', t: 'FAQs', d: 'Curate frequently asked questions.' },
          { href: '/admin/messages', icon: 'mail', t: 'Messages', d: 'Read and manage contact form messages.' },
        ].map((c) => (
          <Link key={c.t} href={c.href} className="card card--hover card--pad">
            <span className="icon-circle"><Icon name={c.icon} size={19} /></span>
            <h3 style={{ margin: '12px 0 6px', fontSize: '1.05rem' }}>{c.t}</h3>
            <p className="small muted">{c.d}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

