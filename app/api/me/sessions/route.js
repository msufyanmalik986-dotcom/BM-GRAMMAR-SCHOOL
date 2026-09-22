import { cookies } from 'next/headers';
import { fail, ok, sameOrigin } from '../../../../lib/api.js';
import { SESSION_COOKIE, userFromToken, destroyAllSessions } from '../../../../lib/auth.js';

export async function DELETE(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  const user = await userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  await destroyAllSessions(user.id);
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return ok({ signedOutAll: true });
}
