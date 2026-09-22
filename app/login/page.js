import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LoginForm } from '../../components/auth-forms.jsx';
import { SESSION_COOKIE, userFromToken } from '../../lib/auth.js';

export const metadata = { title: 'Sign In', description: 'Sign in to your BM Grammar School account to track applications and manage your profile.', robots: { index: false, follow: true } };

export default function LoginPage() {
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (user) redirect('/dashboard');
  return <LoginForm />;
}
