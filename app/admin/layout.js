import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, userFromToken } from '../../lib/auth.js';

export const metadata = { title: 'Administration', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }) {
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login?next=' + encodeURIComponent('/admin'));
  if (user.role !== 'ADMIN') {
    return (
      <div className="container section" style={{ paddingTop: 'calc(var(--header-h) + 60px)' }}>
        <div className="empty-state">
          <div className="icon-wrap"><span className="icon-circle" style={{ width: 58, height: 58 }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></span></div>
          <h3>Administration is restricted</h3>
          <p>Your account does not have administration access. If you believe this is an error, contact the school office.</p>
        </div>
      </div>
    );
  }
  return <div className="container section--tight" style={{ paddingTop: 'calc(var(--header-h) + 40px)', paddingBottom: 80 }}>{children}</div>;
}

