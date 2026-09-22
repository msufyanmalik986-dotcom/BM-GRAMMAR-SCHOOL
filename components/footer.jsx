import Link from 'next/link';
import Icon from './icons.jsx';
import { SCHOOL, NAV } from '../lib/content.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/brand/logo.jpg" alt="BM Grammar School official emblem" loading="lazy" />
              <div>
                <b>BM Grammar School</b>
                <span className="tiny" style={{ letterSpacing: '0.18em', textTransform: 'uppercase', color: '#939aa7' }}>Karachi · (Regd.)</span>
              </div>
            </div>
            <p className="small" style={{ maxWidth: 300 }}>
              {SCHOOL.tagline}. A Montessori-to-Matric school serving the families of Orangi Town, Karachi with separate boys&rsquo; and girls&rsquo; classes and qualified teachers.
            </p>
            <div className="footer__social" style={{ marginTop: 18 }}>
              <a href={SCHOOL.social[0].url} target="_blank" rel="noopener noreferrer" aria-label="BM Grammar School on Facebook"><Icon name="facebook" size={17} /></a>
              <a href={SCHOOL.social[1].url} target="_blank" rel="noopener noreferrer" aria-label="Al Sadaf Campus on Facebook"><Icon name="facebook" size={17} /></a>
              <a href={SCHOOL.social[2].url} target="_blank" rel="noopener noreferrer" aria-label="School YouTube channel"><Icon name="youtube" size={17} /></a>
            </div>
          </div>
          <nav aria-label="Explore">
            <h4>Explore</h4>
            <ul>
              {NAV.slice(1).map((n) => (
                <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
              ))}
              <li><Link href="/campuses">Campuses</Link></li>
              <li><Link href="/notices">Notices</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </nav>
          <nav aria-label="Account">
            <h4>Account</h4>
            <ul>
              <li><Link href="/login">Sign In</Link></li>
              <li><Link href="/register">Register</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/dashboard/applications">My Applications</Link></li>
              <li><Link href="/admissions/apply">Apply Online</Link></li>
            </ul>
          </nav>
          <div>
            <h4>Contact</h4>
            <ul className="footer__contact">
              <li><Icon name="map-pin" size={16} /> Plot No. 518, Sector No. 4/F, Islam Nagar, Orangi Town, Karachi</li>
              <li><Icon name="phone" size={16} /> <a href={`tel:${SCHOOL.phoneIntl}`}>{SCHOOL.phoneDisplay}</a></li>
              <li><Icon name="mail" size={16} /> <a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a></li>
              <li><Icon name="star" size={16} /> Open House: {SCHOOL.openHouseVenue}</li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} BM Grammar School, Karachi. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </span>
        </div>
        <p className="tiny" style={{ color: '#6b7280', paddingBottom: 22 }}>
          Photographs on this website are professional representational imagery used for illustration and do not depict actual students or staff of BM Grammar School.
        </p>
      </div>
    </footer>
  );
}
