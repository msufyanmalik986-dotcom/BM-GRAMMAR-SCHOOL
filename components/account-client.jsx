'use client';
import { useState } from 'react';
import Icon from './icons.jsx';
import { Field, PasswordInput, Modal, useToast } from './ui.jsx';

export function ProfileClient({ user }) {
  const toast = useToast();
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    const errs = {};
    if (name.trim().length < 3) errs.name = 'Please enter your full name.';
    if (phone && !/^(\+92|0)?3\d{2}[-\s]?\d{7}$/.test(phone)) errs.phone = 'Please enter a valid phone number.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await fetch('/api/me', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, phone }) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { toast(json.error?.message || 'Unable to update profile.', 'error'); return; }
    toast('Profile updated.', 'success');
    window.setTimeout(() => window.location.reload(), 600);
  }
  return (
    <>
      <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', marginBottom: 20 }}>My Profile</h1>
      <div className="grid grid--2" style={{ alignItems: 'start' }}>
        <form className="card card--pad" onSubmit={save} noValidate>
          <Field label="Full Name" required htmlFor="p-name" error={errors.name}>
            <input id="p-name" className="input" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
          </Field>
          <Field label="Phone" htmlFor="p-phone" error={errors.phone}>
            <input id="p-phone" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} />
          </Field>
          <Field label="Email" htmlFor="p-email" hint="Email is your sign-in identity and cannot be changed here.">
            <input id="p-email" className="input" value={user.email} readOnly style={{ background: 'var(--color-surface-warm)' }} />
          </Field>
          <button className={`btn btn--primary ${busy ? 'is-loading' : ''}`} disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
        </form>
        <div className="card card--pad">
          <h3 style={{ marginBottom: 12 }}>Account</h3>
          <p className="campus-card__row"><Icon name="user" size={17} /> {user.name}</p>
          <p className="campus-card__row" style={{ marginTop: 10 }}><Icon name="mail" size={17} /> {user.email}</p>
          <p className="campus-card__row" style={{ marginTop: 10 }}><Icon name="phone" size={17} /> {user.phone || 'No phone on record'}</p>
          <p className="campus-card__row" style={{ marginTop: 10 }}><Icon name="calendar" size={17} /> Account created {new Date(user.created_at + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </>
  );
}

export function SecurityClient() {
  const toast = useToast();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sessionsBusy, setSessionsBusy] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    if (pw.next.length < 8) { toast('New password must be at least 8 characters.', 'error'); return; }
    if (pw.next !== pw.confirm) { toast('New passwords do not match.', 'error'); return; }
    setBusy(true);
    const res = await fetch('/api/me/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(pw) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { toast(json.error?.message || 'Unable to change password.', 'error'); return; }
    toast('Password changed successfully.', 'success');
    setPw({ current: '', next: '', confirm: '' });
  }

  async function signOutAll() {
    setSessionsBusy(true);
    await fetch('/api/me/sessions', { method: 'DELETE' });
    toast('All other sessions signed out. You will be signed out everywhere on next visit.', 'info');
    setSessionsBusy(false);
    setConfirmOpen(false);
    setTimeout(() => { window.location.href = '/login'; }, 900);
  }

  return (
    <>
      <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', marginBottom: 20 }}>Security</h1>
      <div className="grid grid--2" style={{ alignItems: 'start' }}>
        <form className="card card--pad" onSubmit={changePassword} noValidate>
          <h3 style={{ marginBottom: 14 }}>Change password</h3>
          <Field label="Current Password" required htmlFor="s-cur">
            <PasswordInput id="s-cur" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          </Field>
          <Field label="New Password" required htmlFor="s-new" hint="At least 8 characters.">
            <PasswordInput id="s-new" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          </Field>
          <Field label="Confirm New Password" required htmlFor="s-confirm">
            <PasswordInput id="s-confirm" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          </Field>
          <button className={`btn btn--primary ${busy ? 'is-loading' : ''}`} disabled={busy}>{busy ? 'Updating…' : 'Change Password'}</button>
        </form>
        <div className="card card--pad">
          <h3 style={{ marginBottom: 12 }}>Sessions</h3>
          <p className="small muted">Signing out all sessions invalidates every device except this one, which is then redirected to sign in again with your new credentials.</p>
          <button className="btn btn--outline" style={{ marginTop: 14 }} onClick={() => setConfirmOpen(true)} disabled={sessionsBusy}>
            <Icon name="log-out" size={16} /> Sign Out All Sessions
          </button>
        </div>
      </div>
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Sign out all sessions?">
        <p className="muted" style={{ marginBottom: 20 }}>Every signed-in device will be signed out and will need your password again. Continue?</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn--ghost" onClick={() => setConfirmOpen(false)}>Cancel</button>
          <button className="btn btn--danger" onClick={signOutAll}>{sessionsBusy ? 'Signing out…' : 'Sign Out All'}</button>
        </div>
      </Modal>
    </>
  );
}
