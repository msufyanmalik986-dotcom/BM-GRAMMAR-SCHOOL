import { PageHero } from '../../components/cards.jsx';
import { SCHOOL } from '../../lib/content.js';

export const metadata = { title: 'Terms', description: 'Terms of use for the BM Grammar School website and online admission portal.', alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Terms' }]} eyebrow="Terms of Use" title="Terms" lead="The simple terms that govern the use of this website and the online admission system." />
      <section className="section">
        <div className="container container--narrow card card--pad">
          <div className="prose" style={{ maxWidth: 'none' }}>
            <h3>Use of this website</h3>
            <p className="muted">This website provides information about {SCHOOL.name} and an online admission application facility. Please use it lawfully and provide accurate information in any form you submit.</p>
            <h3>Online applications</h3>
            <p className="muted">Submitting an application does not guarantee admission; applications are reviewed by the campus office. You confirm that the information you provide is accurate. Keep your reference number for follow-up.</p>
            <h3>Accounts</h3>
            <p className="muted">You are responsible for keeping your password confidential. Account activity is tied to your account so that only you and the school office can view your applications.</p>
            <h3>Content</h3>
            <p className="muted">School information published here is maintained by the school office and updated as verified details become available. Photographs marked as representational are professional imagery used for illustration.</p>
            <h3>Contact</h3>
            <p className="muted">For any question about these terms, contact the school office on {SCHOOL.phoneDisplay}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
