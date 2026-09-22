import { Reveal } from '../../components/ui.jsx';
import { PageHero, CampusCard, SectionHeading, ContactQuickCard } from '../../components/cards.jsx';
import { q } from '../../lib/db.js';

export const metadata = {
  title: 'Campuses',
  description: 'BM Grammar School campuses in Karachi: Al Sadaf Colony, Mominabad and Orangi Town. Addresses, phone, maps and directions.',
  alternates: { canonical: '/campuses' },
};

export default function CampusesPage() {
  const branches = q.branches();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Campuses' }]}
        eyebrow="Campus Directory"
        title="Find your nearest campus."
        lead="Three campuses serve the families of Orangi Town, Karachi. Each follows the same Montessori-to-Matric programme with free admission."
      />

      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {branches.map((b, i) => (
              <Reveal key={b.slug} delay={i}><CampusCard branch={b} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container grid grid--2" style={{ alignItems: 'start' }}>
          <div>
            <SectionHeading eyebrow="Comparing Campuses" title="Same programme, three neighbourhoods"
              lead="Every campus delivers the identical academic programme, separate boys\u2019 and girls\u2019 classes and the Monthly Open House. Choose the campus closest to your home — the school office can confirm current class availability at each location." />
          </div>
          <ContactQuickCard />
        </div>
      </section>
    </>
  );
}
