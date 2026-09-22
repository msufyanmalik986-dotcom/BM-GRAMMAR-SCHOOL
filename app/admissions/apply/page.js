import { cookies } from 'next/headers';
import ApplyClient from '../../../components/apply-client.jsx';
import { SESSION_COOKIE, userFromToken } from '../../../lib/auth.js';
import { q } from '../../../lib/db.js';
import { CLASS_OPTIONS } from '../../../lib/content.js';

export const metadata = {
  title: 'Apply Online',
  description: 'Start your free online admission application to BM Grammar School Karachi. Six guided steps with automatic draft saving.',
  robots: { index: false, follow: true },
};

export default function ApplyPage() {
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value) || null;
  return (
    <>
      <header className="page-hero" style={{ paddingBottom: 26 }}>
        <div className="container">
          <span className="eyebrow">Online Admission</span>
          <h1 style={{ fontSize: 'clamp(1.8rem,3.4vw,2.6rem)' }}>Apply Online</h1>
          <p className="lead">Admission is free. Six guided steps — your progress saves as you go.</p>
        </div>
      </header>
      <ApplyClient branches={q.branches()} user={user} classOptions={CLASS_OPTIONS} />
    </>
  );
}
