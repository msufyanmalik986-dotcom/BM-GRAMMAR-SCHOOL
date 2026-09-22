const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { db, cloudDb } = require('./db');

const SESSION_COOKIE = 'bmgs_session';
const SESSION_DAYS = 30;

const useCloudDb = !!process.env.VERCEL;

function database() {
  return useCloudDb ? cloudDb : db;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hash] = stored.split(':');
    if (scheme !== 'scrypt') return false;

    const check = crypto.scryptSync(password, salt, 64).toString('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(check, 'hex')
    );
  } catch {
    return false;
  }
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(
    Date.now() + SESSION_DAYS * 864e5
  ).toISOString();

  if (useCloudDb) {
    await cloudDb.run(
      `INSERT INTO sessions
       (id, user_id, expires_at, created_at)
       VALUES (?,?,?,NOW())`,
      [token, userId, expires]
    );
  } else {
    db.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?,?,?)'
    ).run(token, userId, expires);
  }

  return { token, expires };
}

async function destroySession(token) {
  if (!token) return;

  if (useCloudDb) {
    await cloudDb.run(
      'DELETE FROM sessions WHERE id = ?',
      [token]
    );
  } else {
    db.prepare(
      'DELETE FROM sessions WHERE id = ?'
    ).run(token);
  }
}

async function destroyAllSessions(userId) {
  if (useCloudDb) {
    await cloudDb.run(
      'DELETE FROM sessions WHERE user_id = ?',
      [userId]
    );
  } else {
    db.prepare(
      'DELETE FROM sessions WHERE user_id = ?'
    ).run(userId);
  }
}

async function userFromToken(token) {
  if (!token) return null;

  let row;

  if (useCloudDb) {
    row = await cloudDb.get(
      `SELECT
         s.expires_at,
         u.id,
         u.name,
         u.email,
         u.phone,
         u.role,
         u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
      [token]
    );
  } else {
    row = db.prepare(
      `SELECT
         s.expires_at,
         u.id,
         u.name,
         u.email,
         u.phone,
         u.role,
         u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    ).get(token);
  }

  if (!row) return null;

  if (new Date(row.expires_at) < new Date()) {
    await destroySession(token);
    return null;
  }

  return row;
}

function sessionCookieOptions(expires) {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: new Date(expires),
  };
}

async function findUserByEmail(email) {
  if (useCloudDb) {
    return await cloudDb.get(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
  }

  return db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).get(email);
}

async function findUserById(id) {
  if (useCloudDb) {
    return await cloudDb.get(
      `SELECT id, name, email, phone, role, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
  }

  return db.prepare(
    `SELECT id, name, email, phone, role, created_at
     FROM users
     WHERE id = ?`
  ).get(id);
}

async function createUser({ name, email, phone, password }) {
  const role =
    process.env.ADMIN_EMAIL &&
    email.toLowerCase() ===
      String(process.env.ADMIN_EMAIL).toLowerCase()
      ? 'ADMIN'
      : 'USER';

  const passwordHash = hashPassword(password);

  if (useCloudDb) {
    const res = await cloudDb.run(
      `INSERT INTO users
       (name, email, phone, password_hash, role, created_at, updated_at)
       VALUES (?,?,?,?,?,NOW(),NOW())`,
      [name, email, phone || null, passwordHash, role]
    );

    return await findUserById(res.lastInsertRowid);
  }

  const res = db.prepare(
    `INSERT INTO users
     (name, email, phone, password_hash, role)
     VALUES (?,?,?,?,?)`
  ).run(
    name,
    email,
    phone || null,
    passwordHash,
    role
  );

  return await findUserById(res.lastInsertRowid);
}

async function createResetToken(userId) {
  const token = crypto.randomBytes(24).toString('base64url');
  const expires = new Date(
    Date.now() + 60 * 60 * 1000
  ).toISOString();

  if (useCloudDb) {
    await cloudDb.run(
      `INSERT INTO password_resets
       (user_id, token, expires_at)
       VALUES (?,?,?)`,
      [userId, token, expires]
    );
  } else {
    db.prepare(
      `INSERT INTO password_resets
       (user_id, token, expires_at)
       VALUES (?,?,?)`
    ).run(userId, token, expires);
  }

  return { token, expires };
}

async function consumeResetToken(token) {
  let row;

  if (useCloudDb) {
    row = await cloudDb.get(
      `SELECT *
       FROM password_resets
       WHERE token = ? AND used = 0
       LIMIT 1`,
      [token]
    );
  } else {
    row = db.prepare(
      `SELECT *
       FROM password_resets
       WHERE token = ? AND used = 0`
    ).get(token);
  }

  if (!row || new Date(row.expires_at) < new Date()) {
    return null;
  }

  if (useCloudDb) {
    await cloudDb.run(
      'UPDATE password_resets SET used = 1 WHERE id = ?',
      [row.id]
    );
  } else {
    db.prepare(
      'UPDATE password_resets SET used = 1 WHERE id = ?'
    ).run(row.id);
  }

  return row;
}

function sendMail({ to, subject, text }) {
  if (process.env.EMAIL_SERVER) {
    // Production email provider can be wired here.
  }

  try {
    fs.appendFileSync(
      path.join(process.cwd(), 'data', 'outbox.log'),
      JSON.stringify({
        at: new Date().toISOString(),
        to,
        subject,
        text
      }) + '\n'
    );
  } catch {
    // Non-fatal.
  }
}

module.exports = {
  SESSION_COOKIE,
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  destroyAllSessions,
  userFromToken,
  sessionCookieOptions,
  findUserByEmail,
  findUserById,
  createUser,
  createResetToken,
  consumeResetToken,
  sendMail
};
