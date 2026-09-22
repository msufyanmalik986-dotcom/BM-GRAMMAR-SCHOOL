import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '../../../components/cards.jsx';
import { q } from '../../../lib/db.js';

export function generateStaticParams() {
  return q.notices().map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }) {
  const n = q.notice(params.slug);
  if (!n) return { title: 'Notice not found' };
  return { title: n.title, description: (n.content || '').slice(0, 160) };
}

export default function NoticeDetailPage({ params }) {
  const n = q.notice(params.slug);
  if (!n) notFound();
  return (
    <>
      <PageHero crumbs={[{ label: 'Notices', href: '/notices' }, { label: n.title }]} eyebrow={n.category || 'Notice'} title={n.title}
        lead={n.published_at ? `Published ${new Date(n.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : undefined} />
      <section className="section">
        <div className="container container--narrow">
          <div className="card card--pad">
            <div className="prose" style={{ maxWidth: 'none' }}>
              {(n.content || '').split('\n').map((p, i) => <p key={i} className="muted">{p}</p>)}
            </div>
            <div style={{ marginTop: 26 }}>
              <Link href="/notices" className="btn btn--outline">All Notices</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
