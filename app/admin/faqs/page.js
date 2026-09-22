import AdminList from '../_list.jsx';

export const metadata = { title: 'FAQs — Administration', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', marginBottom: 6 }}>FAQs</h1>
      <p className="small muted" style={{ marginBottom: 20 }}>Frequently asked questions shown on the public FAQ page.</p>
      <AdminList kind="faqs" />
    </>
  );
}
