import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { RegisterForm } from '../../components/auth-forms.jsx';
import { SESSION_COOKIE, userFromToken } from '../../lib/auth.js';

export const metadata = { title: 'Register', description: 'Create your BM Grammar School parent account to apply online and track admissions.', robots: { index: false, follow: true } };

export default function RegisterPage() {
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (user) redirect('/dashboard');
  return <RegisterForm />;
}
