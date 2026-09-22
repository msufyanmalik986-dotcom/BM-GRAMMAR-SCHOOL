# BM Grammar School — Digital Platform

Production-ready school platform for **BM Grammar School, Karachi**: public website, multi-campus directory,
online admission system, secure authentication, personalized dashboards, application tracking, events & Open House
platform, gallery, notices, FAQ, search, SEO and a CMS-ready administration area.

## Stack

- **Next.js 14** (App Router, server-side rendering, per-route metadata, sitemap/robots)
- **SQLite** via `better-sqlite3` (relational store with migrations + verified-content seeds in `lib/db.js`)
- **scrypt** password hashing, HTTP-only `SameSite=Lax` session cookies, server-side authorization on every private route
- Design tokens derived from the official emblem (`app/globals.css`); the official logo lives at
  `public/assets/brand/logo.jpg` and is referenced centrally (preloader, header, footer, auth, favicon, OG).

## Run

```bash
npm install
cp .env.example .env        # fill values; see notes below
npm run build && npm start  # production
# or: npm run dev
```

## Environment

| Variable      | Purpose |
|---------------|---------|
| `DATABASE_URL`| SQLite file path (`file:./data/bmgs.db`) |
| `AUTH_SECRET` | Session signing secret (long random string) |
| `EMAIL_SERVER` / `EMAIL_FROM` | Transactional email transport. When unset, emails are appended to `data/outbox.log` (password-reset links can be read there during development). |
| `ADMIN_EMAIL` | The email that receives the **ADMIN** role *when its owner registers*. No admin credentials are ever hardcoded or seeded. |
| `MAP_API_KEY` | Reserved for a future hosted map provider. Directions use encoded Google Maps queries — no coordinates are invented. |

## Verified content policy

Only verified facts ship in seeds (`lib/db.js`) and `lib/content.js`: school name, motto
(“We Give A New Vision To Your Thoughts”, from the school's official public pages), principal
**Shakeel Ahmed Bhatti**, phone **0312-2690757**, email **bmgsone1@yahoo.com**, the documented Orangi Town address
(Plot No. 518, Sector 4/F, Islam Nagar), three campuses (Al Sadaf Colony / Mominabad / Orangi Town — the two
unverified street addresses are stored as editable records, not invented), monthly Open Houses and the Ali Baba
Stadium venue. All photography is professional **representational imagery**, labelled as such in captions, alt text
and the footer; the school office can replace any asset or record without touching page code.

## Security notes

- Email + password only. No social login, no demo accounts, no hardcoded credentials.
- Rate limiting on login/register/reset/contact/applications/search; same-origin enforcement for mutations.
- Applications are private per user (ownership checked server-side; cross-user access returns 404).
- Idempotency keys prevent duplicate application submissions.
- Admin APIs verify `role === 'ADMIN'` server-side; status changes notify the applicant (email/outbox).

## Route inventory

Public: `/ /about /academics /admissions /admissions/apply /campuses /campuses/[slug] /campus-life /faculty
/facilities /events /events/[slug] /gallery /notices /notices/[slug] /faq /contact /privacy /terms`
Auth: `/login /register /forgot-password /reset-password`
Private: `/dashboard /dashboard/applications /dashboard/applications/[id] /dashboard/profile /dashboard/security`
Admin (role-gated): `/admin /admin/applications /admin/branches /admin/events /admin/gallery /admin/faculty
/admin/notices /admin/faqs /admin/messages`
