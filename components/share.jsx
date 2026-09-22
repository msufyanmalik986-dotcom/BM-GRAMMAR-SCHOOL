'use client';
import { useToast } from './ui.jsx';
import Icon from './icons.jsx';

export function ShareButton({ title }) {
  const toast = useToast();
  return (
    <button
      className="btn btn--secondary"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          try { await navigator.share({ title, url }); return; } catch { /* cancelled */ }
        }
        try {
          await navigator.clipboard.writeText(url);
          toast('Link copied to clipboard', 'info');
        } catch {
          toast('Copy this page\u2019s address to share it.', 'info');
        }
      }}
    >
      <Icon name="share" size={17} /> Share
    </button>
  );
}
