import { cookies } from 'next/headers';
import { fail, ok, sameOrigin, readBody, rateLimit, clientIp } from '../../../../lib/api.js';
import { SESSION_COOKIE, userFromToken, verifyPassword, hashPassword } from '../../../../lib/auth.js';
import { db } from '../../../../lib/db.js';

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  if (!rateLimit(`pw:${clientIp(req)}`, 5, 60_000)) return fail('Too many attempts.', 429, 'RATE_LIMITED');
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  const body = await readBody(req);
  const full = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  if (!verifyPassword(String(body.current || ''), full.password_hash)) return fail('Current password is incorrect.', 400, 'BAD_CURRENT');
  const next = String(body.next || '');
  if (next.length < 8) return fail('New password must be at least 8 characters.');
  db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hashPassword(next), user.id);
  /* Invalidate other sessions, keep the current one. */
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(user.id, cookies().get(SESSION_COOKIE)?.value);
  return ok({ changed: true });
}
