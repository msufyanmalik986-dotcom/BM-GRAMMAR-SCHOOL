/** Shared API utilities: responses, rate limiting, origin checks, validation. */
const { NextResponse } = require('next/server');

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}
function ok(data) {
  return json({ success: true, data });
}
function fail(message, status = 400, code) {
  return json({ success: false, error: { message, code: code || 'BAD_REQUEST' } }, status);
}

/* In-memory sliding-window rate limiter (per process). */
const buckets = new Map();
function rateLimit(key, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  buckets.set(key, arr);
  return true;
}

/* Same-origin enforcement for mutating requests (CSRF mitigation with SameSite cookies). */
function sameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin form posts / server calls
  const host = req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function readBody(req, limit = 20_000) {
  const text = await req.text();
  if (text.length > limit) throw new Error('PAYLOAD_TOO_LARGE');
  try { return JSON.parse(text || '{}'); } catch { return {}; }
}

/* Validation */
const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const isPakPhone = (v) => typeof v === 'string' && /^(\+92|0)?3\d{2}[-\s]?\d{7}$|^(0\d{2})[-\s]?\d{7}$|^0\d{10}$/.test(v.trim());
const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function makeReference() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `BM-${new Date().getFullYear()}-${s}`;
}

function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

module.exports = { json, ok, fail, rateLimit, sameOrigin, readBody, isEmail, isPakPhone, clean, makeReference, clientIp };
