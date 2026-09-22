import FaqClient from '../../components/faq-client.jsx';
import { PageHero, ContactQuickCard } from '../../components/cards.jsx';
import { q } from '../../lib/db.js';

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about admissions, academics, campuses, applications, events and contact at BM Grammar School Karachi.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  const faqs = q.faqs();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        crumbs={[{ label: 'FAQ' }]}
        eyebrow="Questions, Answered"
        title="Frequently asked questions"
        lead="Straight answers about admissions, academics, campuses and applications. Anything else — the school office is one call away."
      />
      <section className="section">
        <div className="container grid grid--3" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start' }}>
          <FaqClient faqs={faqs} />
          <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 20px)', display: 'grid', gap: 18 }}>
            <ContactQuickCard />
          </div>
        </div>
      </section>
    </>
  );
}
