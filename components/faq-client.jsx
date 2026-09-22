'use client';
import { useMemo, useState } from 'react';
import { Accordion, EmptyState } from './ui.jsx';

export default function FaqClient({ faqs }) {
  const [term, setTerm] = useState('');
  const [cat, setCat] = useState('All');
  const cats = useMemo(() => ['All', ...Array.from(new Set(faqs.map((f) => f.category)))], [faqs]);
  const filtered = useMemo(
    () =>
      faqs.filter(
        (f) =>
          (cat === 'All' || f.category === cat) &&
          (!term || (f.question + ' ' + f.answer).toLowerCase().includes(term.toLowerCase()))
      ),
    [faqs, cat, term]
  );
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search questions…" value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Search frequently asked questions" />
        <div className="filters" style={{ margin: 0 }}>
          {cats.map((c) => (
            <button key={c} className={`journey-tab ${c === cat ? 'is-active' : ''}`} onClick={() => setCat(c)} aria-pressed={c === cat}>{c}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="search" title="No matching questions" text="Try a different word, or send your question through the contact page — the office responds to every message." />
      ) : (
        filtered.map((f, i) => (
          <Accordion key={f.id} question={f.question} defaultOpen={i === 0 && !term}>
            {f.answer}
          </Accordion>
        ))
      )}
    </div>
  );
}
