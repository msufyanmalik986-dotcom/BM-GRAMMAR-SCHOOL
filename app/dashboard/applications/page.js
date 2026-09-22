import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Icon from '../../../components/icons.jsx';
import { StatusBadge } from '../../../components/ui.jsx';
import { SESSION_COOKIE, userFromToken } from '../../../lib/auth.js';
import { db } from '../../../lib/db.js';

export const metadata = { title: 'My Applications — Dashboard', robots: { index: false, follow: false } };

export default function MyApplicationsPage() {
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login');
  const apps = db.prepare(`SELECT a.*, b.name AS campus_name FROM admission_applications a JOIN branches b ON b.id = a.campus_id WHERE a.user_id = ? ORDER BY a.created_at DESC`).all(user.id);
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)' }}>My Applications</h1>
        <Link href="/admissions/apply" className="btn btn--primary btn--sm">New Application</Link>
      </div>
      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="icon-wrap"><Icon name="file-text" size={26} /></div>
          <h3>No applications found</h3>
          <p>When you submit an admission application it will appear here with its live status.</p>
          <Link href="/admissions/apply" className="btn btn--primary">Start an Application</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Reference</th><th>Student</th><th>Campus</th><th>Class</th><th>Submitted</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td><span className="code-ref">{a.reference_number}</span></td>
                  <td><b>{a.student_name}</b></td>
                  <td>{a.campus_name}</td>
                  <td>{a.applying_class}</td>
                  <td>{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td><Link className="btn btn--outline btn--sm" href={`/dashboard/applications/${a.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
