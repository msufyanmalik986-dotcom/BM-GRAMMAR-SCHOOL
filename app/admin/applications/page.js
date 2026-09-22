import { cookies } from 'next/headers';
import AdminApps from '../../../components/admin-apps.jsx';
import { SESSION_COOKIE, userFromToken } from '../../../lib/auth.js';

export const metadata = { title: 'Applications â€” Administration', robots: { index: false, follow: false } };

export default async function AdminApplicationsPage() {
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user || user.role !== 'ADMIN') return null;
  return <AdminApps />;
}

