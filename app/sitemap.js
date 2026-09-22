import { q } from '../lib/db.js';

export default function sitemap() {
  const base = process.env.SITE_URL || 'https://bmgrammar.example';
  const statics = ['/', '/about', '/academics', '/admissions', '/campuses', '/campus-life', '/faculty', '/facilities', '/events', '/gallery', '/notices', '/faq', '/contact', '/privacy', '/terms'];
  const urls = statics.map((p) => ({ url: base + p, changeFrequency: 'weekly', priority: p === '/' ? 1 : 0.8 }));
  q.branches().forEach((b) => urls.push({ url: `${base}/campuses/${b.slug}`, changeFrequency: 'monthly', priority: 0.8 }));
  q.events().forEach((e) => urls.push({ url: `${base}/events/${e.slug}`, changeFrequency: 'monthly', priority: 0.6 }));
  q.notices().forEach((n) => urls.push({ url: `${base}/notices/${n.slug}`, changeFrequency: 'weekly', priority: 0.5 }));
  return urls;
}
