import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SecurityClient } from '../../../components/account-client.jsx';
import { SESSION_COOKIE, userFromToken } from '../../../lib/auth.js';

export const metadata = { title: 'Security — Dashboard', robots: { index: false, follow: false } };

export default async function SecurityPage() {
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login');
  return <SecurityClient />;
}
