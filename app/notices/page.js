import Link from 'next/link';
import { PageHero, NoticeCard } from '../../components/cards.jsx';
import { EmptyState } from '../../components/ui.jsx';
import { q } from '../../lib/db.js';
import { SCHOOL } from '../../lib/content.js';

export const metadata = {
  title: 'Notices',
  description: 'Official notices and announcements from BM Grammar School Karachi, published by the school office.',
  alternates: { canonical: '/notices' },
};

export default function NoticesPage() {
  const notices = q.notices();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Notices' }]}
        eyebrow="School Office"
        title="Notices & Announcements"
        lead="Official notices — admissions windows, Open House dates, examination schedules — are published here by the school office."
      />
      <section className="section">
        <div className="container">
          {notices.length === 0 ? (
            <EmptyState
              icon="file-text"
              title="No notices published yet"
              text={`The school office publishes notices on this page. For current information — including Open House dates and admission windows — call ${SCHOOL.phoneDisplay} or contact us through the contact page.`}
              action={<Link href="/contact" className="btn btn--primary">Contact the School Office</Link>}
            />
          ) : (
            <div className="grid grid--2">{notices.map((n) => <NoticeCard key={n.id} notice={n} />)}</div>
          )}
        </div>
      </section>
    </>
  );
}
