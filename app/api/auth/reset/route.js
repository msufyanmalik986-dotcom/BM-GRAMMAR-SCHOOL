import { fail, ok, rateLimit, sameOrigin, readBody, clientIp } from '../../../../lib/api.js';
import { consumeResetToken, hashPassword, destroyAllSessions, sendMail } from '../../../../lib/auth.js';
import { db } from '../../../../lib/db.js';

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  if (!rateLimit(`reset:${clientIp(req)}`, 5, 60_000)) return fail('Too many attempts. Please try again later.', 429, 'RATE_LIMITED');
  const body = await readBody(req);
  const password = String(body.password || '');
  if (password.length < 8) return fail('Password must be at least 8 characters.');
  const row = await consumeResetToken(String(body.token || ''));
  if (!row) return fail('This reset link is invalid or has expired.', 400, 'INVALID_TOKEN');
  db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hashPassword(password), row.user_id);
  await destroyAllSessions(row.user_id);
  const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(row.user_id);
  if (user) sendMail({ to: user.email, subject: 'Your password was changed', text: `${user.name}, your BM Grammar School password was just changed. If this wasn't you, contact the school office immediately.` });
  return ok({ reset: true });
}
