'use client';
import { useState } from 'react';
import Link from 'next/link';
import Icon from './icons.jsx';
import { LEVELS } from '../lib/content.js';

export default function Journey() {
  const [active, setActive] = useState(0);
  const level = LEVELS[active];
  return (
    <div>
      <div className="journey-tabs" role="tablist" aria-label="Academic levels">
        {LEVELS.map((l, i) => (
          <button
            key={l.key}
            role="tab"
            id={`tab-${l.key}`}
            aria-selected={i === active}
            aria-controls={`panel-${l.key}`}
            className={`journey-tab ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {l.title}
          </button>
        ))}
      </div>
      <div className="journey-track" aria-hidden="true">
        {LEVELS.map((l, i) => (
          <span key={l.key} className={`journey-step-dot ${i === active ? 'is-active' : ''}`}>{l.title}</span>
        ))}
      </div>
      <div className="journey-panel" key={level.key} id={`panel-${level.key}`} role="tabpanel" aria-labelledby={`tab-${level.key}`}>
        <div className="media media--43 media--frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={level.image} alt={level.alt} loading="lazy" />
          <span className="media__credit">Representational image</span>
        </div>
        <div>
          <span className="badge badge--blue">{level.ages}</span>
          <h3 style={{ fontSize: '1.7rem', margin: '12px 0 10px' }}>{level.title}</h3>
          <p className="muted">{level.blurb}</p>
          <ul className="focus-list">
            {level.focus.map((f) => (
              <li key={f}><Icon name="check-circle" size={17} /> {f}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <Link href="/academics" className="btn btn--outline btn--sm">Academic Overview</Link>
            <Link href="/admissions/apply" className="btn btn--primary btn--sm">Apply for {level.title} <Icon name="arrow-right" className="icon--arrow" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
