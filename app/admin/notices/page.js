import AdminList from '../_list.jsx';

export const metadata = { title: 'Notices — Administration', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', marginBottom: 6 }}>Notices</h1>
      <p className="small muted" style={{ marginBottom: 20 }}>Official announcements published by the school office.</p>
      <AdminList kind="notices" />
    </>
  );
}
