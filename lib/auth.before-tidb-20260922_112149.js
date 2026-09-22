/**
 * BM Grammar School — authentication.
 * scrypt password hashing, HTTP-only cookie sessions, server-side checks.
 */
const crypto = require('crypto');
const { db } = require('./db');

const SESSION_COOKIE = 'bmgs_session';
const SESSION_DAYS = 30;

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
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
  } catch {
    return false;
  }
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?,?,?)').run(token, userId, expires);
  return { token, expires };
}

function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
}

function destroyAllSessions(userId) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

function userFromToken(token) {
  if (!token) return null;
  const row = db.prepare(
    `SELECT s.expires_at, u.id, u.name, u.email, u.phone, u.role, u.created_at
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`
  ).get(token);
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
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

/* Users */
function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}
function findUserById(id) {
  return db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(id);
}
function createUser({ name, email, phone, password }) {
  const role = process.env.ADMIN_EMAIL && email.toLowerCase() === String(process.env.ADMIN_EMAIL).toLowerCase() ? 'ADMIN' : 'USER';
  const res = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?,?,?,?,?)')
    .run(name, email, phone || null, hashPassword(password), role);
  return findUserById(res.lastInsertRowid);
}

/* Password reset tokens */
function createResetToken(userId) {
  const token = crypto.randomBytes(24).toString('base64url');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)').run(userId, token, expires);
  return { token, expires };
}
function consumeResetToken(token) {
  const row = db.prepare('SELECT * FROM password_resets WHERE token = ? AND used = 0').get(token);
  if (!row || new Date(row.expires_at) < new Date()) return null;
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(row.id);
  return row;
}

/* Email outbox: writes to data/outbox.log when no EMAIL_SERVER is configured. */
function sendMail({ to, subject, text }) {
  const fs = require('fs');
  const path = require('path');
  if (process.env.EMAIL_SERVER) {
    // Production transport would be wired here via env credentials.
    // Deliberately not implemented without a configured provider.
  }
  try {
    fs.appendFileSync(
      path.join(process.cwd(), 'data', 'outbox.log'),
      JSON.stringify({ at: new Date().toISOString(), to, subject, text }) + '\n'
    );
  } catch { /* non-fatal */ }
}

module.exports = {
  SESSION_COOKIE, hashPassword, verifyPassword,
  createSession, destroySession, destroyAllSessions, userFromToken, sessionCookieOptions,
  findUserByEmail, findUserById, createUser, createResetToken, consumeResetToken, sendMail,
};
