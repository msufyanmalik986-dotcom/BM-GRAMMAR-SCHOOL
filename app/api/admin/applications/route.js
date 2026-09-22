import { cookies } from 'next/headers';
import { fail, ok } from '../../../../lib/api.js';
import { SESSION_COOKIE, userFromToken } from '../../../../lib/auth.js';
import { db } from '../../../../lib/db.js';

export async function GET(req) {
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  if (user.role !== 'ADMIN') return fail('Administration access is restricted.', 403, 'FORBIDDEN');
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const campus = url.searchParams.get('campus') || '';
  const term = (url.searchParams.get('q') || '').toLowerCase();
  let rows = db.prepare(`SELECT a.*, b.name AS campus_name FROM admission_applications a JOIN branches b ON b.id = a.campus_id ORDER BY a.created_at DESC`).all();
  if (status) rows = rows.filter((r) => r.status === status);
  if (campus) rows = rows.filter((r) => String(r.campus_id) === campus);
  if (term) rows = rows.filter((r) => `${r.reference_number} ${r.student_name} ${r.parent_name}`.toLowerCase().includes(term));
  return ok(rows);
}
