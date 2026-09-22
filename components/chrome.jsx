'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from './icons.jsx';
import { useToast } from './ui.jsx';
import { NAV, SCHOOL } from '../lib/content.js';

/* ---------------- Preloader (first visit only, ~2s, reduced-motion aware) ---------------- */
export function Preloader() {
  const [mode, setMode] = useState('hidden'); // hidden | show | done
  useEffect(() => {
    if (sessionStorage.getItem('bmgs_seen')) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMode('show');
    const hold = reduced ? 250 : 1900;
    const t1 = setTimeout(() => {
      setMode('done');
      sessionStorage.setItem('bmgs_seen', '1');
    }, hold);
    const t2 = setTimeout(() => setMode('hidden'), hold + 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (mode === 'hidden') return null;
  return (
    <div className={`preloader ${mode === 'done' ? 'is-done' : ''}`} aria-hidden="true">
      <div className="preloader__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="preloader__logo" src="/assets/brand/logo.jpg" alt="" />
        <p className="preloader__text">Welcome to BM Grammar School</p>
        <div className="preloader__bar"><i /></div>
      </div>
    </div>
  );
}

/* ---------------- Scroll progress ---------------- */
export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      ref.current.style.width = `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}

/* ---------------- Offline banner ---------------- */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    setOffline(!navigator.onLine);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return <div className="offline-banner" role="alert">You&rsquo;re currently offline. Your admission draft is saved on this device — retry when connected.</div>;
}

/* ---------------- Search dialog ---------------- */
export function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); else { setQuery(''); setResults(null); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  useEffect(() => {
    if (query.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.success ? json.data : []);
      } catch { setResults([]); }
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query, open]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" style={{ alignItems: 'flex-start', paddingTop: '9vh' }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Search the website" style={{ width: 'min(640px,100%)' }}>
        <div className="pw-wrap" style={{ marginBottom: 14 }}>
          <input
            ref={inputRef}
            className="input"
            style={{ paddingLeft: 46 }}
            placeholder="Search pages, campuses, events, FAQs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
          />
          <Icon name="search" size={19} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
        </div>
        <div style={{ maxHeight: '52vh', overflowY: 'auto' }}>
          {loading && <p className="small muted">Searching…</p>}
          {!loading && results && results.length === 0 && (
            <p className="small muted" style={{ padding: '12px 4px' }}>No results found for &ldquo;{query}&rdquo;. Try &ldquo;admission&rdquo;, &ldquo;campus&rdquo; or &ldquo;open house&rdquo;.</p>
          )}
          {!loading && results?.map((r) => (
            <Link key={`${r.type}-${r.url}`} href={r.url} className="search-hit" onClick={onClose}>
              <span className={`badge ${r.type === 'Campus' ? 'badge--red' : r.type === 'Event' ? 'badge--blue' : r.type === 'FAQ' ? 'badge--amber' : 'badge--gray'} type`}>{r.type}</span>
              <span>
                <b style={{ fontSize: '0.95rem' }}>{r.title}</b>
                <span className="small muted" style={{ display: 'block' }}>{r.description}</span>
              </span>
            </Link>
          ))}
          {!results && !loading && (
            <p className="small muted">Search across school pages, campuses, events, notices and frequently asked questions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Account menu ---------------- */
function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const toast = useToast();
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const initial = (user.name || 'U').trim().charAt(0).toUpperCase();
  const firstName = (user.name || '').split(' ')[0];
  return (
    <div className="acct" ref={ref}>
      <button className="acct__btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" aria-label={`Account menu for ${user.name}`}>
        <span className="acct__avatar" aria-hidden="true">{initial}</span>
        <span className="acct__name">Welcome, {firstName}</span>
        <Icon name="chevron-down" size={15} />
      </button>
      {open && (
        <div className="acct__menu" role="menu">
          <div className="acct__head">
            <b style={{ fontSize: '0.93rem' }}>{user.name}</b>
            <span className="small muted" style={{ display: 'block' }}>{user.email}</span>
          </div>
          <Link href="/dashboard" role="menuitem" onClick={() => setOpen(false)}><Icon name="home" size={16} /> Dashboard</Link>
          <Link href="/dashboard/applications" role="menuitem" onClick={() => setOpen(false)}><Icon name="file-text" size={16} /> My Applications</Link>
          <Link href="/dashboard/profile" role="menuitem" onClick={() => setOpen(false)}><Icon name="user" size={16} /> My Profile</Link>
          <Link href="/dashboard/security" role="menuitem" onClick={() => setOpen(false)}><Icon name="shield" size={16} /> Settings</Link>
          {user.role === 'ADMIN' && <Link href="/admin" role="menuitem" onClick={() => setOpen(false)}><Icon name="settings" size={16} /> Administration</Link>}
          <button
            role="menuitem"
            className="danger"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              toast('Signed out. See you soon.', 'info');
              router.push('/');
              router.refresh();
            }}
          >
            <Icon name="log-out" size={16} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Header ---------------- */
export default function Header({ user }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setDrawer(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);
  const clear = pathname === '/' && !scrolled && !drawer;
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'));

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header className={`site-header ${clear ? 'is-clear' : 'is-solid'}`}>
        <div className="container">
          <Link href="/" className="brand" aria-label="BM Grammar School — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/assets/brand/logo.jpg" alt="" />
            <span>
              <span className="brand__name" style={{ display: 'block' }}>BM Grammar School</span>
              <span className="brand__sub" style={{ display: 'block' }}>Karachi · Regd.</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Primary">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`nav-link ${isActive(n.href) ? 'is-active' : ''}`} aria-current={isActive(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button className="btn btn--ghost btn--icon" onClick={() => setSearch(true)} aria-label="Search (press slash)">
              <Icon name="search" size={19} />
            </button>
            {user ? (
              <AccountMenu user={user} />
            ) : (
              <>
                <Link href="/login" className="btn btn--outline btn--sm signin-link">Sign In</Link>
                <Link href="/admissions/apply" className="btn btn--primary btn--sm">Apply Online</Link>
              </>
            )}
            <button className="hamburger" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`drawer-backdrop ${drawer ? 'is-open' : ''}`} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside className={`drawer ${drawer ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer__head">
          <span className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/assets/brand/logo.jpg" alt="" />
            <span className="brand__name">BM Grammar School</span>
          </span>
          <button className="btn btn--ghost btn--icon" onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="x" size={22} /></button>
        </div>
        <nav aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? 'is-active' : ''}>{n.label} <Icon name="chevron-right" size={17} /></Link>
          ))}
          <Link href="/campuses">Campuses <Icon name="chevron-right" size={17} /></Link>
          <Link href="/notices">Notices <Icon name="chevron-right" size={17} /></Link>
          <Link href="/faq">FAQ <Icon name="chevron-right" size={17} /></Link>
        </nav>
        <div className="drawer__actions">
          {user ? (
            <Link href="/dashboard" className="btn btn--secondary btn--block"><Icon name="home" size={17} /> Welcome, {(user.name || '').split(' ')[0]} — Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn--outline btn--block">Sign In</Link>
              <Link href="/register" className="btn btn--secondary btn--block">Register</Link>
            </>
          )}
          <Link href="/admissions/apply" className="btn btn--primary btn--block">Apply Online</Link>
          <a href={`tel:${SCHOOL.phoneIntl}`} className="btn btn--ghost btn--block"><Icon name="phone" size={17} /> {SCHOOL.phoneDisplay}</a>
        </div>
      </aside>

      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}

/* ---------------- Floating mobile CTA ---------------- */
export function FloatingCTA() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname === '/admissions/apply') return null;
  return (
    <Link href="/admissions/apply" className="btn btn--primary floating-cta">
      Apply Online <Icon name="arrow-right" className="icon--arrow" />
    </Link>
  );
}
