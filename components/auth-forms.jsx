'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from './icons.jsx';
import { Field, PasswordInput, useToast } from './ui.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function AuthShell({ title, sub, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-card card card--pad" style={{ padding: 34 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="auth-logo" src="/assets/brand/logo.jpg" alt="BM Grammar School emblem" />
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem' }}>{title}</h2>
        <p className="small muted" style={{ textAlign: 'center', margin: '8px 0 24px' }}>{sub}</p>
        {children}
      </div>
    </div>
  );
}

function safeNext(v) {
  return v && v.startsWith('/') && !v.startsWith('//') ? v : '/dashboard';
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email)) { setError('Please enter a valid email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setBusy(true);
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, remember }) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setError(json.error?.message || 'Unable to sign in.'); return; }
    toast(`Welcome back, ${json.data.name.split(' ')[0]}.`, 'success');
    router.push(safeNext(params.get('next')));
    router.refresh();
  }
  return (
    <AuthShell title="Sign In" sub="Welcome back to BM Grammar School.">
      <form onSubmit={submit} noValidate>
        {error && <p className="error-text" role="alert" style={{ marginBottom: 14 }}><Icon name="alert" size={15} /> {error}</p>}
        <Field label="Email" required htmlFor="l-email">
          <input id="l-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" required htmlFor="l-pass">
          <PasswordInput id="l-pass" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <label className="checkbox-row"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
          <Link href="/forgot-password" className="small" style={{ color: 'var(--color-secondary)', fontWeight: 650 }}>Forgot password?</Link>
        </div>
        <button className={`btn btn--primary btn--block ${busy ? 'is-loading' : ''}`} disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 18 }}>
          New to the portal? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (f.name.trim().length < 3) errs.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(f.email)) errs.email = 'Please enter a valid email address.';
    if (f.phone && !/^(\+92|0)?3\d{2}[-\s]?\d{7}$/.test(f.phone)) errs.phone = 'Please enter a valid phone number.';
    if (f.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (f.confirm !== f.password) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(f) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setErrors({ email: json.error?.message || 'Unable to register.' }); return; }
    toast(`Welcome, ${json.data.name.split(' ')[0]}. Your account is ready.`, 'success');
    router.push(safeNext(params.get('next')));
    router.refresh();
  }
  return (
    <AuthShell title="Create Account" sub="One account for admissions, applications and updates.">
      <form onSubmit={submit} noValidate>
        <Field label="Full Name" required htmlFor="r-name" error={errors.name}>
          <input id="r-name" className="input" autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} />
        </Field>
        <div className="form-grid">
          <Field label="Email" required htmlFor="r-email" error={errors.email}>
            <input id="r-email" className="input" type="email" autoComplete="email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email} />
          </Field>
          <Field label="Phone (optional)" htmlFor="r-phone" error={errors.phone}>
            <input id="r-phone" className="input" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} aria-invalid={!!errors.phone} />
          </Field>
        </div>
        <Field label="Password" required htmlFor="r-pass" error={errors.password} hint="At least 8 characters.">
          <PasswordInput id="r-pass" value={f.password} onChange={set('password')} autoComplete="new-password" invalid={!!errors.password} />
        </Field>
        <Field label="Confirm Password" required htmlFor="r-confirm" error={errors.confirm}>
          <PasswordInput id="r-confirm" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" invalid={!!errors.confirm} />
        </Field>
        <button className={`btn btn--primary btn--block ${busy ? 'is-loading' : ''}`} disabled={busy}>{busy ? 'Creating account…' : 'Register'}</button>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 18 }}>
          Already registered? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return;
    setBusy(true);
    await fetch('/api/auth/forgot', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
    setBusy(false);
    setSent(true);
  }
  return (
    <AuthShell title="Forgot Password" sub="We'll prepare a secure reset link for your account.">
      {sent ? (
        <div className="empty-state" style={{ border: 0, padding: '10px 0 0' }}>
          <div className="icon-wrap"><Icon name="mail" size={24} /></div>
          <h3>Check your inbox</h3>
          <p>If an account exists for {email}, a password reset link is on its way. The link expires in one hour. If you don't see it, contact the school office.</p>
          <Link href="/login" className="btn btn--outline btn--sm">Back to Sign In</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <Field label="Email" required htmlFor="f-email">
            <input id="f-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <button className={`btn btn--primary btn--block ${busy ? 'is-loading' : ''}`} disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</button>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetForm() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const router = useRouter();
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (pw !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, password: pw }) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setError(json.error?.message || 'This reset link is invalid or has expired.'); return; }
    toast('Password updated. You can sign in now.', 'success');
    router.push('/login');
  }
  return (
    <AuthShell title="Set a New Password" sub="Choose a strong password you haven't used before.">
      <form onSubmit={submit} noValidate>
        {error && <p className="error-text" role="alert" style={{ marginBottom: 14 }}><Icon name="alert" size={15} /> {error}</p>}
        <Field label="New Password" required htmlFor="n-pass" hint="At least 8 characters.">
          <PasswordInput id="n-pass" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
        </Field>
        <Field label="Confirm New Password" required htmlFor="n-confirm">
          <PasswordInput id="n-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </Field>
        <button className={`btn btn--primary btn--block ${busy ? 'is-loading' : ''}`} disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
      </form>
    </AuthShell>
  );
}
