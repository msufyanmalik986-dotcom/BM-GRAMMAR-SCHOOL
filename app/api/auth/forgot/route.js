import { fail, ok, rateLimit, sameOrigin, readBody, clientIp } from '../../../../lib/api.js';
import { findUserByEmail, createResetToken, sendMail } from '../../../../lib/auth.js';

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  if (!rateLimit(`forgot:${clientIp(req)}`, 3, 60_000)) return fail('Too many attempts. Please try again later.', 429, 'RATE_LIMITED');
  const body = await readBody(req);
  const email = String(body.email || '').trim().toLowerCase();
  /* Never expose account existence. */
  const user = findUserByEmail(email);
  if (user) {
    const { token } = createResetToken(user.id);
    const origin = req.headers.get('origin') || '';
    sendMail({
      to: email,
      subject: 'Reset your BM Grammar School password',
      text: `Use this link within 1 hour to reset your password: ${origin}/reset-password?token=${token}. If you did not request this, you can ignore this email.`,
    });
  }
  return ok({ sent: true });
}
