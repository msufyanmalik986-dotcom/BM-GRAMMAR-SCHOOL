import { cookies } from 'next/headers';
import { fail, ok, rateLimit, sameOrigin, readBody, isEmail, isPakPhone, clean, makeReference, clientIp } from '../../../lib/api.js';
import { SESSION_COOKIE, userFromToken, sendMail } from '../../../lib/auth.js';
import { db } from '../../../lib/db.js';
import { CLASS_OPTIONS } from '../../../lib/content.js';

export async function GET() {
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  const rows = db.prepare(`SELECT a.id, a.reference_number, a.student_name, a.applying_class, a.status, a.created_at, b.name AS campus_name
    FROM admission_applications a JOIN branches b ON b.id = a.campus_id WHERE a.user_id = ? ORDER BY a.created_at DESC`).all(user.id);
  return ok(rows);
}

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Invalid request origin.', 403, 'FORBIDDEN');
  if (!rateLimit(`apply:${clientIp(req)}`, 6, 60_000)) return fail('Too many submissions. Please wait a moment.', 429, 'RATE_LIMITED');
  const user = userFromToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return fail('Please sign in to submit your application.', 401, 'UNAUTHORIZED');

  let body;
  try { body = await readBody(req, 40_000); } catch { return fail('Request too large.', 413); }

  const data = {
    student_name: clean(body.studentName, 90),
    date_of_birth: clean(body.dateOfBirth, 12),
    gender: ['Male', 'Female'].includes(body.gender) ? body.gender : '',
    previous_school: clean(body.previousSchool, 120),
    previous_class: clean(body.previousClass, 40),
    applying_class: clean(body.applyingClass, 40),
    parent_name: clean(body.parentName, 90),
    relationship: clean(body.relationship, 30),
    phone: clean(body.phone, 20),
    email: clean(body.email, 120).toLowerCase(),
    address: clean(body.address, 400),
    notes: clean(body.notes, 600),
  };
  const campus = db.prepare('SELECT * FROM branches WHERE id = ? AND active = 1').get(Number(body.campusId));
  const idem = clean(body.idempotencyKey, 64);

  if (!campus) return fail('Please choose a valid campus.');
  if (!CLASS_OPTIONS.includes(data.applying_class)) return fail('Please choose a valid class.');
  if (data.student_name.length < 3) return fail('Please enter the student\u2019s full name.');
  if (!data.date_of_birth || Number.isNaN(new Date(data.date_of_birth).getTime())) return fail('Please enter a valid date of birth.');
  if (!data.gender) return fail('Please select the student\u2019s gender.');
  if (data.parent_name.length < 3) return fail('Please enter the parent / guardian name.');
  if (!isPakPhone(data.phone)) return fail('Please enter a valid phone number.');
  if (!isEmail(data.email)) return fail('Please enter a valid email address.');
  if (data.address.length < 10) return fail('Please enter your complete home address.');

  /* Idempotency: a double-submit with the same key returns the existing application. */
  if (idem) {
    const existing = db.prepare('SELECT * FROM admission_applications WHERE idempotency_key = ? AND user_id = ?').get(idem, user.id);
    if (existing) {
      const withCampus = { ...existing, campusName: campus.name };
      return ok(shape(withCampus));
    }
  }

  let reference = makeReference();
  while (db.prepare('SELECT 1 FROM admission_applications WHERE reference_number = ?').get(reference)) reference = makeReference();

  const res = db.prepare(`INSERT INTO admission_applications
    (user_id, idempotency_key, reference_number, student_name, date_of_birth, gender, previous_school, previous_class,
     applying_class, parent_name, relationship, phone, email, address, campus_id, notes)
    VALUES (@user_id,@idempotency_key,@reference_number,@student_name,@date_of_birth,@gender,@previous_school,@previous_class,
     @applying_class,@parent_name,@relationship,@phone,@email,@address,@campus_id,@notes)`)
    .run({ user_id: user.id, idempotency_key: idem || null, reference_number: reference, ...data, campus_id: campus.id });

  const created = db.prepare('SELECT * FROM admission_applications WHERE id = ?').get(res.lastInsertRowid);
  // Email notification must never make a successfully saved application fail.
  try {
    await Promise.resolve(sendMail({
      to: data.email,
      subject: `Application received — ${reference}`,
      text: `Your admission application for ${data.student_name} (${data.applying_class}, ${campus.name}) was received on ${new Date().toLocaleDateString('en-GB')}. Reference: ${reference}. Track it from your dashboard.`,
    }));
  } catch (mailError) {
    console.warn("Application email notification failed:", mailError?.message || mailError);
  }
  return ok(shape({ ...created, campusName: campus.name }));
}

function shape(a) {
  return {
    id: a.id,
    referenceNumber: a.reference_number,
    studentName: a.student_name,
    applyingClass: a.applying_class,
    campusName: a.campusName,
    status: a.status,
    createdAt: a.created_at,
  };
}

