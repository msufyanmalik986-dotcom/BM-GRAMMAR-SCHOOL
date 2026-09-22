import { cookies } from 'next/headers';
import { fail, ok, rateLimit, sameOrigin, readBody, clientIp } from '../../../../lib/api.js';
import { findUserByEmail, verifyPassword, createSession, sessionCookieOptions, SESSION_COOKIE } from '../../../../lib/auth.js';

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) return fail('Too many sign-in attempts. Please wait a minute.', 429, 'RATE_LIMITED');
  let body;
  try { body = await readBody(req); } catch { return fail('Request too large.', 413); }
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const remember = body.remember !== false;

  const user = findUserByEmail(email);
  /* Constant-shape failure: do not reveal whether the account exists. */
  if (!user || !verifyPassword(password, user.password_hash)) {
    return fail('Incorrect email or password.', 401, 'UNAUTHORIZED');
  }
  const session = createSession(user.id);
  const expires = remember ? session.expires : new Date(Date.now() + 12 * 3600e3).toISOString();
  cookies().set(SESSION_COOKIE, session.token, sessionCookieOptions(expires));
  return ok({ id: user.id, name: user.name, email: user.email, role: user.role });
}
