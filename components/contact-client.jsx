'use client';
import { useState } from 'react';
import Icon from './icons.jsx';
import { Field, useToast } from './ui.jsx';

export default function ContactClient() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 3) errs.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (form.phone && !/^(\+92|0)?3\d{2}[-\s]?\d{7}$/.test(form.phone)) errs.phone = 'Please enter a valid phone number.';
    if (form.message.trim().length < 10) errs.message = 'Please write a message of at least 10 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, subject: form.subject, message: form.message, website: form.website }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || 'Failed');
      toast('Thank you. Your message has been received.', 'success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    } catch {
      toast('Unable to send your message right now. Please try again or call the school office.', 'error');
    }
    setBusy(false);
  }

  return (
    <form className="card card--pad" onSubmit={submit} noValidate>
      <h3 style={{ marginBottom: 6 }}>Send a message</h3>
      <p className="small muted" style={{ marginBottom: 20 }}>The school office responds to messages during school days.</p>
      {/* Honeypot — hidden from humans */}
      <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <div className="form-grid">
        <Field label="Full Name" required htmlFor="c-name" error={errors.name}>
          <input id="c-name" className="input" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} autoComplete="name" />
        </Field>
        <Field label="Email" required htmlFor="c-email" error={errors.email}>
          <input id="c-email" className="input" type="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} autoComplete="email" />
        </Field>
      </div>
      <div className="form-grid">
        <Field label="Phone (optional)" htmlFor="c-phone" error={errors.phone}>
          <input id="c-phone" className="input" type="tel" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} autoComplete="tel" placeholder="03XX-XXXXXXX" />
        </Field>
        <Field label="Subject" htmlFor="c-subject">
          <input id="c-subject" className="input" value={form.subject} onChange={set('subject')} placeholder="Admission enquiry" />
        </Field>
      </div>
      <Field label="Message" required htmlFor="c-message" error={errors.message}>
        <textarea id="c-message" className="textarea" value={form.message} onChange={set('message')} aria-invalid={!!errors.message} />
      </Field>
      <button className={`btn btn--primary ${busy ? 'is-loading' : ''}`} disabled={busy}>
        {busy ? 'Sending…' : 'Send Message'} {!busy && <Icon name="send" size={16} />}
      </button>
    </form>
  );
}
