import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Icon from '../../components/icons.jsx';
import { StatusBadge } from '../../components/ui.jsx';
import { SESSION_COOKIE, userFromToken } from '../../lib/auth.js';
import { db, q } from '../../lib/db.js';

export const metadata = { title: 'Overview — Dashboard', robots: { index: false, follow: false } };

export default function DashboardOverview() {
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login');
  const apps = db.prepare(`SELECT a.*, b.name AS campus_name FROM admission_applications a JOIN branches b ON b.id = a.campus_id WHERE a.user_id = ? ORDER BY a.created_at DESC`).all(user.id);
  const pending = apps.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
  const accepted = apps.filter((a) => a.status === 'accepted').length;
  const profileComplete = [user.name, user.email, user.phone].filter(Boolean).length;
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>Welcome, {user.name}</h1>
          <p className="muted" style={{ marginTop: 6 }}>Your admissions and account, in one place.</p>
        </div>
        <Link href="/admissions/apply" className="btn btn--primary">New Application <Icon name="arrow-right" className="icon--arrow" /></Link>
      </div>

      <div className="stat-cards" style={{ marginBottom: 26 }}>
        <div className="card stat-card"><div className="num">{apps.length}</div><div className="lbl">My Applications</div></div>
        <div className="card stat-card"><div className="num" style={{ color: 'var(--color-warning)' }}>{pending}</div><div className="lbl">Pending Review</div></div>
        <div className="card stat-card"><div className="num" style={{ color: 'var(--color-success)' }}>{accepted}</div><div className="lbl">Accepted</div></div>
        <div className="card stat-card"><div className="num">{Math.round((profileComplete / 3) * 100)}%</div><div className="lbl">Profile Completion</div></div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: 14 }}>Recent applications</h2>
      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="icon-wrap"><Icon name="file-text" size={26} /></div>
          <h3>No applications yet</h3>
          <p>Start your child&rsquo;s free admission application — it takes about five minutes and your progress is saved as you go.</p>
          <Link href="/admissions/apply" className="btn btn--primary">Apply Online</Link>
        </div>
      ) : (
        <div className="grid grid--2">
          {apps.slice(0, 4).map((a) => (
            <Link key={a.id} href={`/dashboard/applications/${a.id}`} className="card card--hover card--pad" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <b className="code-ref">{a.reference_number}</b>
                <StatusBadge status={a.status} />
              </div>
              <h3 style={{ margin: '12px 0 4px', fontSize: '1.1rem' }}>{a.student_name}</h3>
              <p className="small muted">{a.campus_name} · {a.applying_class}</p>
              <p className="tiny muted" style={{ marginTop: 8 }}>Submitted {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid--2" style={{ marginTop: 26 }}>
        <div className="card card--pad">
          <h3 style={{ marginBottom: 8 }}>Account security</h3>
          <p className="small muted">Keep your account safe — review your password and active sessions any time.</p>
          <Link href="/dashboard/security" className="btn btn--outline btn--sm" style={{ marginTop: 12 }}><Icon name="shield" size={15} /> Security Settings</Link>
        </div>
        <div className="card card--pad">
          <h3 style={{ marginBottom: 8 }}>Need help?</h3>
          <p className="small muted">The school office assists with applications on 0312-2690757 during school days.</p>
          <Link href="/contact" className="btn btn--outline btn--sm" style={{ marginTop: 12 }}><Icon name="phone" size={15} /> Contact</Link>
        </div>
      </div>
    </>
  );
}
