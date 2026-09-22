import { cookies } from 'next/headers';
import { ok } from '../../../../lib/api.js';
import { destroySession, SESSION_COOKIE } from '../../../../lib/auth.js';

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  await destroySession(token);
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return ok({ signedOut: true });
}
