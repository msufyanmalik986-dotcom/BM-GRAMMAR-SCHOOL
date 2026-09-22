import Icon from '../../components/icons.jsx';
import { Reveal } from '../../components/ui.jsx';
import { PageHero, SectionHeading, CTABand } from '../../components/cards.jsx';

export const metadata = {
  title: 'Facilities',
  description: 'Learning spaces and student environment at BM Grammar School Karachi: classrooms, learning spaces and activity areas.',
  alternates: { canonical: '/facilities' },
};

export default function FacilitiesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Facilities' }]}
        eyebrow="Learning Spaces"
        title="Spaces arranged for learning."
        lead="The school maintains classrooms and activity spaces designed around one purpose: a positive, focused environment for every student."
      />

      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {[
              { img: '/assets/img/hero-classroom.jpg', alt: 'Representational image: a bright classroom', t: 'Classrooms', d: 'Bright, organised classrooms for separate boys\u2019 and girls\u2019 classes at every level.' },
              { img: '/assets/img/montessori-learning.jpg', alt: 'Representational image: early-years activity area', t: 'Early-Years Spaces', d: 'Activity-friendly spaces where Montessori students learn by doing.' },
              { img: '/assets/img/library-reading.jpg', alt: 'Representational image: reading and study space', t: 'Reading & Study Areas', d: 'Quiet corners and reading spaces that grow language and habit.' },
              { img: '/assets/img/science-lab.jpg', alt: 'Representational image: practical science space', t: 'Practical Work Areas', d: 'Space for hands-on science and mathematics activity at middle and secondary levels.' },
              { img: '/assets/img/sports-ground.jpg', alt: 'Representational image: outdoor games area', t: 'Activity Areas', d: 'Outdoor space for games periods and school gatherings.' },
              { img: '/assets/img/teacher-classroom.jpg', alt: 'Representational image: prepared teaching environment', t: 'Student Environment', d: 'A disciplined, respectful atmosphere maintained in every campus.' },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i % 3}>
                <div className="card card--hover" style={{ height: '100%' }}>
                  <div className="media media--43">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt={f.alt} loading="lazy" />
                    <span className="media__credit">Representational image</span>
                  </div>
                  <div style={{ padding: '18px 22px 22px' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{f.t}</h3>
                    <p className="small muted" style={{ marginTop: 8 }}>{f.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="tiny muted" style={{ marginTop: 22 }}>
            Campus-specific facility details (buildings, timings and allocations) are maintained by the school office and published as they are verified.
          </p>
        </div>
      </section>

      <section className="section section--alt"><div className="container"><CTABand /></div></section>
    </>
  );
}
