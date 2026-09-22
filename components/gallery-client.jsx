'use client';
import { useMemo, useState } from 'react';
import { Lightbox, EmptyState } from './ui.jsx';

const CATS = ['All', 'Campus', 'Classrooms', 'Students', 'Activities', 'Learning'];

export default function GalleryClient({ items }) {
  const [cat, setCat] = useState('All');
  const [index, setIndex] = useState(null);
  const filtered = useMemo(() => (cat === 'All' ? items : items.filter((i) => i.category === cat)), [cat, items]);
  return (
    <>
      <div className="filters" role="group" aria-label="Filter gallery">
        {CATS.map((c) => (
          <button key={c} className={`journey-tab ${c === cat ? 'is-active' : ''}`} onClick={() => { setCat(c); setIndex(null); }} aria-pressed={c === cat}>
            {c}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="search" title="No photographs in this category yet" text="The school office adds event and campus photographs as they are verified. Try another category." />
      ) : (
        <div className="masonry">
          {filtered.map((g, i) => (
            <figure
              className="g-item"
              key={g.id}
              tabIndex={0}
              role="button"
              aria-label={`Open image: ${g.title}`}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setIndex(i))}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image_url} alt={g.alt_text} loading="lazy" />
              <figcaption>{g.title} · {g.category} · Representational</figcaption>
            </figure>
          ))}
        </div>
      )}
      <Lightbox
        items={filtered.map((g) => ({ src: g.image_url, alt: g.alt_text, caption: `${g.title} — ${g.caption}`, representative: g.representative }))}
        index={index}
        onIndex={setIndex}
        onClose={() => setIndex(null)}
      />
    </>
  );
}
