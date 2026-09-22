import { ok, rateLimit, clientIp } from '../../../lib/api.js';
import { q } from '../../../lib/db.js';
import { LEVELS, SCHOOL } from '../../../lib/content.js';

const PAGES = [
  { type: 'Page', title: 'Home', description: 'BM Grammar School — Montessori to Matric, Karachi.', url: '/' },
  { type: 'Page', title: 'About', description: 'Who we are, our philosophy and our principal.', url: '/about' },
  { type: 'Page', title: 'Academics', description: 'Montessori, Primary, Middle, Secondary and Matric.', url: '/academics' },
  { type: 'Page', title: 'Admissions', description: 'Free admission — apply online in six steps.', url: '/admissions' },
  { type: 'Page', title: 'Apply Online', description: 'Start an admission application.', url: '/admissions/apply' },
  { type: 'Page', title: 'Campus Life', description: 'Daily tasks, activities and Open Houses.', url: '/campus-life' },
  { type: 'Page', title: 'Faculty', description: 'Leadership and teaching standards.', url: '/faculty' },
  { type: 'Page', title: 'Facilities', description: 'Classrooms and learning spaces.', url: '/facilities' },
  { type: 'Page', title: 'Events', description: 'Open House and school gatherings.', url: '/events' },
  { type: 'Page', title: 'Gallery', description: 'Representational imagery of school environments.', url: '/gallery' },
  { type: 'Page', title: 'Notices', description: 'Official announcements from the school office.', url: '/notices' },
  { type: 'Page', title: 'FAQ', description: 'Admissions, academics and campus questions.', url: '/faq' },
  { type: 'Page', title: 'Contact', description: `Phone ${SCHOOL.phoneDisplay}, email ${SCHOOL.email}.`, url: '/contact' },
];

export async function GET(req) {
  if (!rateLimit(`search:${clientIp(req)}`, 30, 60_000)) return ok([]);
  const term = String(new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();
  if (term.length < 2) return ok([]);
  const index = [
    ...PAGES,
    ...q.branches().map((b) => ({ type: 'Campus', title: b.name, description: b.address || 'Orangi Town, Karachi', url: `/campuses/${b.slug}` })),
    ...q.events().map((e) => ({ type: 'Event', title: e.title, description: `${e.date_label || ''} · ${e.location || ''}`, url: `/events/${e.slug}` })),
    ...q.notices().map((n) => ({ type: 'Notice', title: n.title, description: (n.content || '').slice(0, 90), url: `/notices/${n.slug}` })),
    ...q.faqs().map((f) => ({ type: 'FAQ', title: f.question, description: f.answer.slice(0, 90), url: '/faq' })),
    ...LEVELS.map((l) => ({ type: 'Academics', title: `${l.title} (${l.ages})`, description: l.blurb.slice(0, 90), url: '/academics' })),
  ];
  const hits = index
    .map((item) => {
      const hay = `${item.title} ${item.description}`.toLowerCase();
      let score = 0;
      if (item.title.toLowerCase().startsWith(term)) score += 3;
      else if (item.title.toLowerCase().includes(term)) score += 2;
      if (hay.includes(term)) score += 1;
      return { ...item, score };
    })
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ score, ...rest }) => rest);
  return ok(hits);
}
