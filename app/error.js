'use client';
import Link from 'next/link';
import Icon from '../components/icons.jsx';

export default function ErrorBoundary({ error, retry }) {
  return (
    <div className="container" style={{ paddingTop: 'calc(var(--header-h) + 70px)', paddingBottom: 100, textAlign: 'center' }}>
      <span className="icon-circle" style={{ margin: '0 auto', width: 62, height: 62, background: 'var(--color-error-soft)', color: 'var(--color-error)' }}>
        <Icon name="alert" size={28} />
      </span>
      <h1 style={{ fontSize: '1.8rem', margin: '18px 0 10px' }}>Something went wrong on our side.</h1>
      <p className="muted" style={{ maxWidth: 480, margin: '0 auto 26px' }}>
        The problem has been noted and does not affect your saved data. Please try again — or return to the home page.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn--primary" onClick={() => retry()}>Try Again</button>
        <Link href="/" className="btn btn--outline">Go Home</Link>
      </div>
    </div>
  );
}
