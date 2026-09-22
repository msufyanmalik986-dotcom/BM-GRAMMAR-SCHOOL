import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Icon from '../../components/icons.jsx';
import DashNav from '../../components/dash-nav.jsx';
import { SESSION_COOKIE, userFromToken } from '../../lib/auth.js';

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = await userFromToken(token);
  if (!user) redirect('/login?next=' + encodeURIComponent('/dashboard'));
  return (
    <div className="container section--tight" style={{ paddingTop: 'calc(var(--header-h) + 40px)', paddingBottom: 80 }}>
      <div className="dash">
        <aside className="dash__side">
          <div className="card card--pad" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="acct__avatar" style={{ width: 46, height: 46, fontSize: 1.1 }} aria-hidden="true">{(user.name || 'U').charAt(0).toUpperCase()}</span>
              <div style={{ minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: '0.98rem' }}>{user.name}</b>
                <span className="tiny muted" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
              </div>
            </div>
          </div>
          <DashNav />
        </aside>
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
