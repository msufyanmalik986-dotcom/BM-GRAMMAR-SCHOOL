import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileClient } from '../../../components/account-client.jsx';
import { SESSION_COOKIE, userFromToken } from '../../../lib/auth.js';

export const metadata = { title: 'My Profile — Dashboard', robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login');
  return <ProfileClient user={user} />;
}
