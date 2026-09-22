import { Suspense } from 'react';
import { ResetForm } from '../../components/auth-forms.jsx';

export const metadata = { title: 'Reset Password', description: 'Set a new password for your BM Grammar School account.', robots: { index: false, follow: true } };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
