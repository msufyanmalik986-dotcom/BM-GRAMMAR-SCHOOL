import { ForgotForm } from '../../components/auth-forms.jsx';

export const metadata = { title: 'Forgot Password', description: 'Reset your BM Grammar School account password.', robots: { index: false, follow: true } };

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
