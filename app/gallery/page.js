import GalleryClient from '../../components/gallery-client.jsx';
import { PageHero } from '../../components/cards.jsx';
import { q } from '../../lib/db.js';

export const metadata = {
  title: 'Gallery',
  description: 'Gallery of BM Grammar School Karachi — professional representational imagery of classrooms, learning and activities. School-event photographs are added by the office.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryPage() {
  const items = q.gallery();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Gallery' }]}
        eyebrow="Gallery"
        title="Learning, in pictures."
        lead="Professional representational imagery illustrating the environments we strive for. Photographs from actual school events are added by the office as they become available."
      />
      <section className="section">
        <div className="container">
          <GalleryClient items={items} />
        </div>
      </section>
    </>
  );
}
