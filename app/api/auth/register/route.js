import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fail, ok, rateLimit, sameOrigin, readBody, isEmail, isPakPhone, clean, clientIp } from '../../../../lib/api.js';
import { createUser, findUserByEmail, createSession, sessionCookieOptions, sendMail } from '../../../../lib/auth.js';

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  if (!rateLimit(`register:${clientIp(req)}`, 6, 60_000)) return fail('Too many attempts. Please wait a minute and try again.', 429, 'RATE_LIMITED');
  let body;
  try { body = await readBody(req); } catch { return fail('Request too large.', 413); }
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 20);
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 3) return fail('Please enter your full name.');
  if (!isEmail(email)) return fail('Please enter a valid email address.');
  if (phone && !isPakPhone(phone)) return fail('Please enter a valid phone number.');
  if (password.length < 8) return fail('Password must be at least 8 characters.');

  if (findUserByEmail(email)) return fail('An account with this email already exists. Please sign in instead.', 409, 'EXISTS');
  const user = createUser({ name, email, phone, password });
  const session = createSession(user.id);
  cookies().set('bmgs_session', session.token, sessionCookieOptions(session.expires));
  sendMail({ to: email, subject: 'Welcome to BM Grammar School', text: `Assalam-o-Alaikum ${name}, your BM Grammar School account is ready. You can apply online and track applications from your dashboard.` });
  return ok({ id: user.id, name: user.name, email: user.email });
}
