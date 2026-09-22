'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from './icons.jsx';
import { Field, PasswordInput, useToast, StatusBadge } from './ui.jsx';

const DRAFT_KEY = 'bmgs_apply_draft_v1';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+92|0)?3\d{2}[-\s]?\d{7}$|^0\d{2}[-\s]?\d{7}$/;

const STEP_LABELS = ['Campus', 'Class', 'Student', 'Parent / Guardian', 'Review', 'Submit'];

function uuid() {
  try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2) + Date.now(); }
}

export default function ApplyClient({ branches, user, classOptions }) {
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [key, setKey] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [data, setData] = useState({
    campusId: '', applyingClass: '',
    studentName: '', dateOfBirth: '', gender: '', previousSchool: '', previousClass: '',
    parentName: '', relationship: '', phone: '', email: '', address: '', notes: '',
  });
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));

  /* Restore draft */
  useEffect(() => {
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { /* ignore */ }
    if (draft && draft.data) {
      setData({ ...data, ...draft.data });
      setStep(Math.min(draft.step || 0, 4));
      setKey(draft.key || uuid());
      if (draft.data.studentName) toast('Draft restored — continue where you left off.', 'info');
    } else {
      setKey(uuid());
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Prefill parent details from the signed-in account */
  useEffect(() => {
    if (!ready || !user) return;
    setData((d) => ({
      ...d,
      parentName: d.parentName || user.name || '',
      email: d.email || user.email || '',
      phone: d.phone || user.phone || '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  /* Autosave */
  useEffect(() => {
    if (!ready || result) return;
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step, key }));
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    }, 350);
    return () => clearTimeout(t);
  }, [data, step, key, ready, result]);

  const campus = useMemo(() => branches.find((b) => String(b.id) === String(data.campusId)), [branches, data.campusId]);

  function validate(s) {
    const e = {};
    if (s === 0 && !data.campusId) e.campusId = 'Please choose a campus.';
    if (s === 1 && !data.applyingClass) e.applyingClass = 'Please choose a class.';
    if (s === 2) {
      if (data.studentName.trim().length < 3) e.studentName = 'Please enter the student\u2019s full name.';
      if (!data.dateOfBirth) e.dateOfBirth = 'Please enter the date of birth.';
      else {
        const age = (Date.now() - new Date(data.dateOfBirth).getTime()) / (365.25 * 864e5);
        if (Number.isNaN(age) || age < 2 || age > 25) e.dateOfBirth = 'Please enter a valid date of birth.';
      }
      if (!data.gender) e.gender = 'Please select the student\u2019s gender.';
    }
    if (s === 3) {
      if (data.parentName.trim().length < 3) e.parentName = 'Please enter the parent / guardian name.';
      if (!data.relationship) e.relationship = 'Please select your relationship to the student.';
      if (!PHONE_RE.test(data.phone)) e.phone = 'Please enter a valid phone number.';
      if (!EMAIL_RE.test(data.email)) e.email = 'Please enter a valid email address.';
      if (data.address.trim().length < 10) e.address = 'Please enter your complete home address.';
    }
    if (s === 4 && !confirm) e.confirm = 'Please confirm the information is accurate before submitting.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit() {
    if (!validate(4)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, idempotencyKey: key }),
      });
      const json = await res.json();
      if (res.status === 401) {
        toast('Please sign in to submit your application. Your draft is saved.', 'info');
        window.location.href = `/login?next=${encodeURIComponent('/admissions/apply')}`;
        return;
      }
      if (!res.ok || !json.success) {
        toast(json.error?.message || 'Unable to submit the application. Please try again.', 'error');
        setBusy(false);
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      setResult(json.data);
      setStep(5);
      toast('Application submitted successfully.', 'success');
    } catch {
      toast('Network problem — your draft is saved on this device. Please try again.', 'error');
    }
    setBusy(false);
  }

  /* ---------------- Success screen ---------------- */
  if (result) {
    return (
      <div className="container container--narrow" style={{ paddingBlock: 60 }}>
        <div className="card card--pad" style={{ textAlign: 'center', padding: '46px 30px' }}>
          <span className="icon-circle" style={{ margin: '0 auto', width: 64, height: 64, background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <Icon name="check-circle" size={30} />
          </span>
          <h1 style={{ fontSize: '2rem', margin: '18px 0 8px' }}>Application Submitted</h1>
          <p className="muted">Keep your reference number safe — you will need it when contacting the school office.</p>
          <p style={{ margin: '18px 0', fontFamily: 'ui-monospace,monospace', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>{result.referenceNumber}</p>
          <div className="card card--pad" style={{ textAlign: 'left', maxWidth: 460, margin: '0 auto' }}>
            <p className="campus-card__row"><Icon name="user" size={17} /> {result.studentName}</p>
            <p className="campus-card__row" style={{ marginTop: 8 }}><Icon name="map-pin" size={17} /> {result.campusName}</p>
            <p className="campus-card__row" style={{ marginTop: 8 }}><Icon name="cap" size={17} /> Applying for: {result.applyingClass}</p>
            <p className="campus-card__row" style={{ marginTop: 8 }}><Icon name="calendar" size={17} /> {new Date(result.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="campus-card__row" style={{ marginTop: 8 }}><Icon name="info" size={17} /> Status: <StatusBadge status={result.status} /></p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }} className="no-print">
            <Link href={`/dashboard/applications/${result.id}`} className="btn btn--primary">View Application</Link>
            <Link href="/dashboard" className="btn btn--outline">Go to Dashboard</Link>
            <button className="btn btn--ghost" onClick={() => window.print()}><Icon name="printer" size={16} /> Print Receipt</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container container--narrow" style={{ paddingBlock: 46 }}>
      {/* Progress */}
      <div className="steps-label"><span>Step {Math.min(step + 1, 6)} of 6 — {STEP_LABELS[Math.min(step, 5)]}</span><span aria-live="polite">{saved ? 'Draft saved ✓' : '\u00A0'}</span></div>
      <div className="steps-bar" aria-hidden="true">
        {STEP_LABELS.map((_, i) => <span key={i} className={`seg ${i <= step ? 'is-done' : ''}`} />)}
      </div>

      <div className="card card--pad" style={{ padding: '30px clamp(20px,4vw,38px)' }}>
        {/* STEP 0: campus */}
        {step === 0 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Choose your campus</h2>
            <p className="small muted" style={{ marginBottom: 22 }}>Select the BM Grammar School campus nearest to your home.</p>
            <div className="select-cards">
              {branches.map((b) => (
                <button key={b.id} type="button" className={`select-card ${String(data.campusId) === String(b.id) ? 'is-selected' : ''}`} onClick={() => setData({ ...data, campusId: String(b.id) })} aria-pressed={String(data.campusId) === String(b.id)}>
                  <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <b>{b.name}</b>
                    <Icon name="check-circle" className="check" size={18} />
                  </span>
                  <span className="small muted">{b.address || 'Address on office record — Orangi Town, Karachi'}</span>
                </button>
              ))}
            </div>
            {errors.campusId && <p className="error-text" style={{ marginTop: 12 }} role="alert"><Icon name="alert" size={14} /> {errors.campusId}</p>}
          </>
        )}

        {/* STEP 1: class */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Choose the applying class</h2>
            <p className="small muted" style={{ marginBottom: 22 }}>From Montessori through Matric (Class 10).</p>
            <div className="select-cards">
              {classOptions.map((c) => (
                <button key={c} type="button" className={`select-card ${data.applyingClass === c ? 'is-selected' : ''}`} onClick={() => setData({ ...data, applyingClass: c })} aria-pressed={data.applyingClass === c} style={{ padding: '14px 16px' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <b style={{ fontSize: '0.95rem' }}>{c}</b>
                    <Icon name="check-circle" className="check" size={18} />
                  </span>
                </button>
              ))}
            </div>
            {errors.applyingClass && <p className="error-text" style={{ marginTop: 12 }} role="alert"><Icon name="alert" size={14} /> {errors.applyingClass}</p>}
          </>
        )}

        {/* STEP 2: student */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Student information</h2>
            <p className="small muted" style={{ marginBottom: 22 }}>Tell us about the student applying for admission.</p>
            <div className="form-grid">
              <Field label="Student Full Name" required htmlFor="a-sname" error={errors.studentName}>
                <input id="a-sname" className="input" value={data.studentName} onChange={set('studentName')} aria-invalid={!!errors.studentName} autoComplete="off" />
              </Field>
              <Field label="Date of Birth" required htmlFor="a-dob" error={errors.dateOfBirth}>
                <input id="a-dob" className="input" type="date" value={data.dateOfBirth} onChange={set('dateOfBirth')} aria-invalid={!!errors.dateOfBirth} />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Gender" required htmlFor="a-gender" error={errors.gender}>
                <select id="a-gender" className="select" value={data.gender} onChange={set('gender')} aria-invalid={!!errors.gender}>
                  <option value="">Select…</option><option>Male</option><option>Female</option>
                </select>
              </Field>
              <Field label="Previous School (if any)" htmlFor="a-pschool">
                <input id="a-pschool" className="input" value={data.previousSchool} onChange={set('previousSchool')} />
              </Field>
            </div>
            <Field label="Previous Class (if any)" htmlFor="a-pclass">
              <select id="a-pclass" className="select" value={data.previousClass} onChange={set('previousClass')}>
                <option value="">None / first admission</option>
                {classOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </>
        )}

        {/* STEP 3: parent */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Parent / Guardian</h2>
            <p className="small muted" style={{ marginBottom: 22 }}>The campus office will use these details to contact you. They stay private.</p>
            <div className="form-grid">
              <Field label="Full Name" required htmlFor="a-pname" error={errors.parentName}>
                <input id="a-pname" className="input" value={data.parentName} onChange={set('parentName')} aria-invalid={!!errors.parentName} />
              </Field>
              <Field label="Relationship" required htmlFor="a-rel" error={errors.relationship}>
                <select id="a-rel" className="select" value={data.relationship} onChange={set('relationship')} aria-invalid={!!errors.relationship}>
                  <option value="">Select…</option><option>Father</option><option>Mother</option><option>Guardian</option><option>Other</option>
                </select>
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Phone" required htmlFor="a-phone" error={errors.phone}>
                <input id="a-phone" className="input" type="tel" value={data.phone} onChange={set('phone')} aria-invalid={!!errors.phone} placeholder="03XX-XXXXXXX" />
              </Field>
              <Field label="Email" required htmlFor="a-email" error={errors.email}>
                <input id="a-email" className="input" type="email" value={data.email} onChange={set('email')} aria-invalid={!!errors.email} />
              </Field>
            </div>
            <Field label="Home Address" required htmlFor="a-address" error={errors.address}>
              <textarea id="a-address" className="textarea" style={{ minHeight: 84 }} value={data.address} onChange={set('address')} aria-invalid={!!errors.address} />
            </Field>
            <Field label="Notes for the campus office (optional)" htmlFor="a-notes">
              <textarea id="a-notes" className="textarea" style={{ minHeight: 70 }} value={data.notes} onChange={set('notes')} />
            </Field>
          </>
        )}

        {/* STEP 4: review */}
        {step === 4 && (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Review your application</h2>
            <p className="small muted" style={{ marginBottom: 22 }}>Check each section once more. You can edit anything before submitting.</p>
            {[
              { t: 'Campus', rows: [['Campus', campus?.name || '—'], ['Phone', campus?.phone || '—']], s: 0 },
              { t: 'Class', rows: [['Applying class', data.applyingClass || '—']], s: 1 },
              { t: 'Student', rows: [['Name', data.studentName], ['Date of birth', data.dateOfBirth], ['Gender', data.gender], ['Previous school', data.previousSchool || '—'], ['Previous class', data.previousClass || '—']], s: 2 },
              { t: 'Parent / Guardian', rows: [['Name', data.parentName], ['Relationship', data.relationship], ['Phone', data.phone], ['Email', data.email], ['Address', data.address], ['Notes', data.notes || '—']], s: 3 },
            ].map((sec) => (
              <div key={sec.t} className="card card--pad" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem' }}>{sec.t}</h3>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep(sec.s)}><Icon name="edit" size={14} /> Edit</button>
                </div>
                <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px 14px', marginTop: 12 }}>
                  {sec.rows.map(([k, v]) => (
                    <div key={k} style={{ display: 'contents' }}>
                      <dt className="tiny muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 2 }}>{k}</dt>
                      <dd className="small" style={{ margin: 0 }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            {!user && (
              <div className="card card--pad" style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-secondary)' }}>
                <p className="small" style={{ margin: 0 }}>
                  <b>Sign in required to submit.</b> Your application is attached to a parent account so only you and the
                  school office can see it. Your draft is saved on this device — sign in or register and come straight back.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <Link href={`/login?next=${encodeURIComponent('/admissions/apply')}`} className="btn btn--secondary btn--sm">Sign In</Link>
                  <Link href={`/register?next=${encodeURIComponent('/admissions/apply')}`} className="btn btn--outline btn--sm">Register</Link>
                </div>
              </div>
            )}
            <label className="checkbox-row" style={{ marginTop: 18 }}>
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
              I confirm that the information provided is accurate and complete.
            </label>
            {errors.confirm && <p className="error-text" style={{ marginTop: 8 }} role="alert"><Icon name="alert" size={14} /> {errors.confirm}</p>}
          </>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          {step > 0 ? (
            <button type="button" className="btn btn--outline" onClick={() => setStep(step - 1)}><Icon name="arrow-left" size={16} /> Back</button>
          ) : <span />}
          {step < 4 ? (
            <button type="button" className="btn btn--primary" onClick={next}>Continue <Icon name="arrow-right" className="icon--arrow" /></button>
          ) : (
            <button type="button" className={`btn btn--primary btn--lg ${busy ? 'is-loading' : ''}`} disabled={busy || !user} onClick={submit}>
              {busy ? 'Submitting application…' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
      <p className="tiny muted" style={{ marginTop: 14, textAlign: 'center' }}>
        Progress is saved automatically on this device. Nothing is sent to the school until you submit.
      </p>
    </div>
  );
}
