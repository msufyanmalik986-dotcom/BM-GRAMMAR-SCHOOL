import { cookies } from 'next/headers';
import { fail, ok, sameOrigin, readBody, isPakPhone, clean } from '../../../lib/api.js';
import { SESSION_COOKIE, userFromToken } from '../../../lib/auth.js';
import { db } from '../../../lib/db.js';

export async function PATCH(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  const body = await readBody(req);
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20);
  if (name.length < 3) return fail('Please enter your full name.');
  if (phone && !isPakPhone(phone)) return fail('Please enter a valid phone number.');
  db.prepare('UPDATE users SET name = ?, phone = ?, updated_at = datetime(\'now\') WHERE id = ?').run(name, phone || null, user.id);
  return ok({ name, phone });
}
