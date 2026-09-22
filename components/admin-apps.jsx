'use client';
import { useCallback, useEffect, useState } from 'react';
import Icon from './icons.jsx';
import { StatusBadge, useToast, EmptyState } from './ui.jsx';

const STATUSES = ['submitted', 'under_review', 'accepted', 'rejected'];

export default function AdminApps() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('');
  const [campus, setCampus] = useState('');
  const [term, setTerm] = useState('');
  const [branches, setBranches] = useState([]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (campus) params.set('campus', campus);
    if (term) params.set('q', term);
    const res = await fetch(`/api/admin/applications?${params}`);
    const json = await res.json();
    setRows(json.success ? json.data : []);
  }, [status, campus, term]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch('/api/public/branches').then((r) => r.json()).then((j) => setBranches(j.success ? j.data : [])).catch(() => {});
  }, []);

  async function update(id, newStatus) {
    const res = await fetch(`/api/admin/applications/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    const json = await res.json();
    if (!res.ok) { toast(json.error?.message || 'Unable to update.', 'error'); return; }
    toast('Status updated — the applicant has been notified.', 'success');
    load();
  }

  return (
    <>
      <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', marginBottom: 20 }}>Admission Applications</h1>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <input className="input" style={{ maxWidth: 260 }} placeholder="Search reference, student, parent…" value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Search applications" />
        <select className="select" style={{ maxWidth: 180 }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="select" style={{ maxWidth: 200 }} value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Filter by campus">
          <option value="">All campuses</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      {rows === null ? (
        <p className="small muted">Loading applications…</p>
      ) : rows.length === 0 ? (
        <EmptyState icon="file-text" title="No applications match" text="Adjust the filters, or wait for new applications from the public admission form." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Reference</th><th>Student</th><th>Parent</th><th>Campus</th><th>Class</th><th>Submitted</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td><span className="code-ref">{a.reference_number}</span></td>
                  <td><b>{a.student_name}</b></td>
                  <td>{a.parent_name}<br /><span className="tiny muted">{a.phone}</span></td>
                  <td>{a.campus_name}</td>
                  <td>{a.applying_class}</td>
                  <td>{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <select className="select" style={{ padding: '7px 9px', fontSize: '0.83rem' }} value={a.status} onChange={(e) => update(a.id, e.target.value)} aria-label={`Update status for ${a.reference_number}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
