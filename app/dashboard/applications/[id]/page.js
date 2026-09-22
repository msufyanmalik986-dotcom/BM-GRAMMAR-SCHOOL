import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Icon from '../../../../components/icons.jsx';
import { StatusBadge, StatusTimeline } from '../../../../components/ui.jsx';
import { SESSION_COOKIE, userFromToken } from '../../../../lib/auth.js';
import { db } from '../../../../lib/db.js';

export const metadata = { title: 'Application — Dashboard', robots: { index: false, follow: false } };

export default async function ApplicationDetailPage({ params }) {
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login');
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const app = db.prepare(`SELECT a.*, b.name AS campus_name, b.address AS campus_address, b.phone AS campus_phone
    FROM admission_applications a JOIN branches b ON b.id = a.campus_id WHERE a.id = ?`).get(id);
  /* Server-side ownership check — never expose another user's application. */
  if (!app || app.user_id !== user.id) notFound();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }} className="no-print">
        <div>
          <Link href="/dashboard/applications" className="tiny" style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>← My Applications</Link>
          <h1 style={{ fontSize: 'clamp(1.4rem,2.6vw,1.9rem)', marginTop: 6 }}>Application <span className="code-ref">{app.reference_number}</span></h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--outline btn--sm" onClick={() => window.print()}><Icon name="printer" size={15} /> Print Receipt</button>
          <StatusBadge status={app.status} />
        </div>
      </div>

      <div className="card card--pad" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 4 }}>Status</h3>
        <StatusTimeline status={app.status} />
        <p className="tiny muted" style={{ textAlign: 'center', marginTop: 10 }}>
          {app.status === 'submitted' && 'Received by the school office. It will move to review soon.'}
          {app.status === 'under_review' && 'The campus office is reviewing this application.'}
          {app.status === 'accepted' && 'Congratulations — the campus office will contact you for next steps.'}
          {app.status === 'rejected' && 'This application was not accepted on this occasion. Please contact the campus office for guidance.'}
        </p>
      </div>

      <div className="grid grid--2" style={{ alignItems: 'start' }}>
        <div className="card card--pad">
          <h3 style={{ marginBottom: 14 }}>Student</h3>
          <dl style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px 14px' }}>
            {[['Name', app.student_name], ['Date of birth', app.date_of_birth || '—'], ['Gender', app.gender || '—'], ['Previous school', app.previous_school || '—'], ['Previous class', app.previous_class || '—'], ['Applying class', app.applying_class]].map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt className="tiny muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 2 }}>{k}</dt>
                <dd className="small" style={{ margin: 0 }}>{v}</dd>
              </div>
            ))}
          </dl>
          <h3 style={{ margin: '22px 0 14px' }}>Parent / Guardian</h3>
          <dl style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px 14px' }}>
            {[['Name', app.parent_name], ['Relationship', app.relationship || '—'], ['Phone', app.phone], ['Email', app.email || '—'], ['Address', app.address || '—'], ['Notes', app.notes || '—']].map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt className="tiny muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 2 }}>{k}</dt>
                <dd className="small" style={{ margin: 0 }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card card--pad">
          <h3 style={{ marginBottom: 14 }}>Campus</h3>
          <p className="campus-card__row"><Icon name="map-pin" size={17} /> {app.campus_name}</p>
          {app.campus_address && <p className="campus-card__row" style={{ marginTop: 8 }}><Icon name="home" size={17} /> {app.campus_address}</p>}
          <p className="campus-card__row" style={{ marginTop: 8 }}><Icon name="phone" size={17} /> {app.campus_phone}</p>
          <hr className="divider" style={{ margin: '16px 0' }} />
          <p className="tiny muted">
            Submitted {new Date(app.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
            Last updated {new Date(app.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
            This application is private to your account and the school office.
          </p>
        </div>
      </div>
    </>
  );
}
