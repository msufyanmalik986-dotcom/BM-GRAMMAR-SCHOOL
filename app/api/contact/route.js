import { fail, ok, rateLimit, sameOrigin, readBody, isEmail, isPakPhone, clean, clientIp } from '../../../lib/api.js';
import { db } from '../../../lib/db.js';
import { sendMail } from '../../../lib/auth.js';
import { SCHOOL } from '../../../lib/content.js';

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  if (!rateLimit(`contact:${clientIp(req)}`, 3, 60_000)) return fail('Too many messages. Please try again in a minute.', 429, 'RATE_LIMITED');
  const body = await readBody(req);
  /* Honeypot: bots fill this in. */
  if (clean(body.website, 10)) return ok({ received: true });
  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const phone = clean(body.phone, 20);
  const subject = clean(body.subject, 120);
  const message = clean(body.message, 2000);
  if (name.length < 3) return fail('Please enter your full name.');
  if (!isEmail(email)) return fail('Please enter a valid email address.');
  if (phone && !isPakPhone(phone)) return fail('Please enter a valid phone number.');
  if (message.length < 10) return fail('Please write a message of at least 10 characters.');
  db.prepare('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)').run(name, email, phone || null, subject || null, message);
  sendMail({ to: SCHOOL.email, subject: `Website message from ${name}`, text: `${name} (${email}${phone ? ', ' + phone : ''}): ${message}` });
  return ok({ received: true });
}
