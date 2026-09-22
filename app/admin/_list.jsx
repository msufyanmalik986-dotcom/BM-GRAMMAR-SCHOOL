import { db } from '../../lib/db.js';

export default function AdminList({ kind }) {
  let head = [];
  let rows = [];
  if (kind === 'branches') {
    head = ['Name', 'Slug', 'Address', 'Phone', 'Active'];
    rows = db.prepare('SELECT * FROM branches ORDER BY id').all().map((b) => [b.name, b.slug, b.address || 'On office record', b.phone, b.active ? 'Yes' : 'No']);
  }
  if (kind === 'events') {
    head = ['Title', 'Category', 'Date', 'Location', 'Published'];
    rows = db.prepare('SELECT * FROM events ORDER BY id').all().map((e) => [e.title, e.category, e.date_label, e.location, e.published ? 'Yes' : 'No']);
  }
  if (kind === 'gallery') {
    head = ['Title', 'Category', 'Representational', 'Published'];
    rows = db.prepare('SELECT * FROM gallery_images ORDER BY id').all().map((g) => [g.title, g.category, g.representative ? 'Yes' : 'No', g.published ? 'Yes' : 'No']);
  }
  if (kind === 'faculty') {
    head = ['Name', 'Position', 'Qualification', 'Published'];
    rows = db.prepare('SELECT * FROM faculty ORDER BY id').all().map((f) => [f.name, f.position, f.qualification || '—', f.published ? 'Yes' : 'No']);
  }
  if (kind === 'notices') {
    head = ['Title', 'Category', 'Published at'];
    rows = db.prepare('SELECT * FROM notices ORDER BY id DESC').all().map((n) => [n.title, n.category, n.published_at || '—']);
  }
  if (kind === 'faqs') {
    head = ['Question', 'Category', 'Order'];
    rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order').all().map((f) => [f.question, f.category, f.sort_order]);
  }
  if (kind === 'messages') {
    head = ['From', 'Contact', 'Subject', 'Message', 'Status'];
    rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all().map((m) => [m.name, `${m.email}${m.phone ? ' · ' + m.phone : ''}`, m.subject || '—', m.message.slice(0, 80), m.status]);
  }
  return (
    <div>
      {rows.length === 0 ? (
        <p className="muted small">No records yet. Records created through the public website (applications, messages) and verified school content appear here for administration.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      )}
      <p className="tiny muted" style={{ marginTop: 14 }}>
        Records are managed through the school office content workflow and published to the public website when verified.
      </p>
    </div>
  );
}
