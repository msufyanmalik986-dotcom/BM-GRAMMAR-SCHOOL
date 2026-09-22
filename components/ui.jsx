'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from './icons.jsx';

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-in'); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${delay ? `reveal-d${delay}` : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, status = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-3), { id, message, status }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  }, []);
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.status}`} role="status">
            <Icon name={t.status === 'success' ? 'check-circle' : t.status === 'error' ? 'alert' : 'info'} size={18} />
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification"><Icon name="x" size={15} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- Focus trap utility ---------------- */
function useTrap(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const node = ref.current;
    const focusables = () =>
      Array.from(node.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    (focusables()[0] || node).focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev && prev.focus && prev.focus();
    };
  }, [open, onClose]);
  return ref;
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, wide = false }) {
  const ref = useTrap(open, onClose);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref} style={wide ? { width: 'min(760px,100%)' } : undefined}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3>{title}</h3>
          <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close dialog"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Lightbox ---------------- */
export function Lightbox({ items, index, onClose, onIndex }) {
  const ref = useTrap(true, onClose);
  const touchX = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, items.length, onIndex]);
  if (index == null || !items.length) return null;
  const item = items[index];
  return (
    <div
      className="lightbox"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt || item.title}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx > 48) onIndex((index - 1 + items.length) % items.length);
        if (dx < -48) onIndex((index + 1) % items.length);
        touchX.current = null;
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button className="lightbox__btn lightbox__btn--close" onClick={onClose} aria-label="Close viewer"><Icon name="x" size={22} /></button>
      <button className="lightbox__btn lightbox__btn--prev" onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label="Previous image"><Icon name="chevron-left" size={24} /></button>
      <img src={item.src} alt={item.alt || item.title} />
      <button className="lightbox__btn lightbox__btn--next" onClick={() => onIndex((index + 1) % items.length)} aria-label="Next image"><Icon name="chevron-right" size={24} /></button>
      <p className="lightbox__cap">{item.caption || item.title}{item.representative ? ' · Representational image' : ''}</p>
    </div>
  );
}

/* ---------------- Accordion ---------------- */
export function Accordion({ question, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`accordion ${open ? 'is-open' : ''}`}>
      <button className="accordion__btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        {question}
        <Icon name="chevron-down" size={19} />
      </button>
      <div className="accordion__panel">
        <div className="accordion__inner">
          <div className="accordion__content">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Form primitives ---------------- */
export function Field({ label, required, error, hint, htmlFor, children }) {
  return (
    <div className="field">
      <label className="label" htmlFor={htmlFor}>
        {label} {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="error-text" role="alert"><Icon name="alert" size={14} /> {error}</span>}
    </div>
  );
}

export function PasswordInput({ id, value, onChange, autoComplete, invalid, placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        id={id}
        className="input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        placeholder={placeholder}
        required
      />
      <button type="button" className="pw-toggle" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
        <Icon name={show ? 'eye-off' : 'eye'} size={18} />
      </button>
    </div>
  );
}

/* ---------------- Copy button ---------------- */
export function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied', className = 'btn btn--outline btn--sm' }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        setCopied(true);
        toast(`${label === 'Copy address' ? 'Address' : label === 'Copy phone' ? 'Phone number' : 'Text'} copied`, 'info');
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={15} /> {copied ? copiedLabel : label}
    </button>
  );
}

/* ---------------- Status / badges ---------------- */
export function StatusBadge({ status }) {
  const map = {
    submitted: ['badge--blue', 'Submitted'],
    under_review: ['badge--amber', 'Under Review'],
    accepted: ['badge--green', 'Accepted'],
    rejected: ['badge--red', 'Rejected'],
  };
  const [cls, label] = map[status] || ['badge--gray', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function StatusTimeline({ status }) {
  const rejected = status === 'rejected';
  const done = status === 'accepted';
  const reviewing = status === 'under_review' || done || rejected;
  const decided = done || rejected;
  return (
    <div className="status-track" aria-label={`Application status: ${status.replace('_', ' ')}`}>
      <div className={`status-node is-done`}>Submitted</div>
      <div className={`status-node ${reviewing ? (rejected ? 'is-rejected' : decided ? 'is-done' : 'is-current') : ''}`}>Under Review</div>
      <div className={`status-node ${decided ? (rejected ? 'is-rejected' : 'is-done') : ''}`}>{rejected ? 'Rejected' : 'Decision'}</div>
    </div>
  );
}

/* ---------------- Empty / loading states ---------------- */
export function EmptyState({ icon = 'file-text', title, text, action }) {
  return (
    <div className="empty-state">
      <div className="icon-wrap"><Icon name={icon} size={26} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card card--pad" aria-hidden="true">
      <div className="skel" style={{ height: 16, width: '40%', marginBottom: 14 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skel" style={{ height: 12, marginBottom: 10, width: `${90 - i * 14}%` }} />
      ))}
    </div>
  );
}
