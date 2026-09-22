import { cookies } from 'next/headers';
import { fail, ok, sameOrigin, readBody } from '../../../../../lib/api.js';
import { SESSION_COOKIE, userFromToken, sendMail } from '../../../../../lib/auth.js';
import { db } from '../../../../../lib/db.js';

const STATUSES = ['submitted', 'under_review', 'accepted', 'rejected'];

export async function PATCH(req, { params }) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  if (user.role !== 'ADMIN') return fail('Administration access is restricted.', 403, 'FORBIDDEN');
  const body = await readBody(req);
  const status = String(body.status || '');
  if (!STATUSES.includes(status)) return fail('Invalid status.');
  const id = Number(params.id);
  const app = db.prepare('SELECT * FROM admission_applications WHERE id = ?').get(id);
  if (!app) return fail('Not found.', 404, 'NOT_FOUND');
  db.prepare('UPDATE admission_applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, id);
  sendMail({
    to: app.email,
    subject: `Application update — ${app.reference_number}`,
    text: `The status of ${app.student_name}'s application (${app.reference_number}) is now: ${status.replace('_', ' ')}. Sign in to your dashboard for details.`,
  });
  return ok({ id, status });
}
