import Link from 'next/link';
import Icon from '../components/icons.jsx';

export const metadata = { title: 'Page Not Found', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 70px)', paddingBottom: 100, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem,12vw,7.5rem)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: '1.7rem', margin: '10px 0 12px' }}>This page could not be found.</h1>
      <p className="muted" style={{ maxWidth: 460, margin: '0 auto 28px' }}>
        The page may have moved, or the address was typed incorrectly. Everything you need is a click away.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn--primary"><Icon name="home" size={17} /> Home</Link>
        <Link href="/about" className="btn btn--outline">Explore School</Link>
      </div>
    </div>
  );
}
