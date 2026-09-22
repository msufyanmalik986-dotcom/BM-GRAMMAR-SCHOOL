import { PageHero } from '../../components/cards.jsx';
import { SCHOOL } from '../../lib/content.js';

export const metadata = { title: 'Privacy', description: 'How BM Grammar School handles the information you share through this website.', alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Privacy' }]} eyebrow="Your Data" title="Privacy" lead="A plain-language summary of what this website stores and why. This page is maintained by the school office." />
      <section className="section">
        <div className="container container--narrow card card--pad">
          <div className="prose" style={{ maxWidth: 'none' }}>
            <h3>What we collect</h3>
            <p className="muted">Account details you provide when registering (name, email, optional phone); admission application details you submit (student and parent/guardian information); and messages you send through the contact form.</p>
            <h3>How it is used</h3>
            <p className="muted">Your information is used only to process admissions, communicate with you about your application, and respond to your messages. Application records are visible only to you and the school office. We do not sell or share your information with third parties.</p>
            <h3>What we do not do</h3>
            <p className="muted">This website does not use third-party advertising trackers and does not publish student or parent personal information publicly.</p>
            <h3>Storage and security</h3>
            <p className="muted">Passwords are stored using strong one-way hashing. Sessions use secure, HTTP-only cookies. Draft applications you start are stored on your own device until you submit them.</p>
            <h3>Contact</h3>
            <p className="muted">Questions about your data? Call {SCHOOL.phoneDisplay} or email {SCHOOL.email}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
