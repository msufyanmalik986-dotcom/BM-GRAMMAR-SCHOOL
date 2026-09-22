import { cookies } from 'next/headers';
import { fail, ok } from '../../../../lib/api.js';
import { SESSION_COOKIE, userFromToken } from '../../../../lib/auth.js';
import { db } from '../../../../lib/db.js';

export async function GET(req, { params }) {
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  const id = Number(params.id);
  if (!Number.isInteger(id)) return fail('Not found.', 404, 'NOT_FOUND');
  const app = db.prepare(`SELECT a.*, b.name AS campus_name FROM admission_applications a JOIN branches b ON b.id = a.campus_id WHERE a.id = ?`).get(id);
  if (!app || app.user_id !== user.id) return fail('Not found.', 404, 'NOT_FOUND');
  return ok(app);
}
