// =========================================================
// AKER OSGB - Yönetim paneli oturumu
// =========================================================
// Şifre koda gömülü değildir; Pages secret olarak tutulur.
// Giriş başarılı olduğunda HMAC-SHA256 ile imzalanmış, HttpOnly
// bir çerez verilir. Çerez içeriği yalnızca son kullanma zamanıdır;
// imza doğrulanmadan hiçbir yönetim ucu çalışmaz.
// =========================================================

import type { Env } from './env.ts';

const COOKIE_NAME = 'aker_admin';
/** Oturum süresi: 8 saat. */
const SESSION_MS = 8 * 60 * 60 * 1000;
/** Bir IP için izin verilen ardışık başarısız deneme sayısı. */
const MAX_ATTEMPTS = 8;
/** Sınır aşıldığında beklenecek süre. */
const LOCKOUT_MS = 15 * 60 * 1000;

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

/** Zamanlama saldırılarına karşı sabit süreli karşılaştırma. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export async function createSessionCookie(env: Env, secure: boolean): Promise<string> {
  const expires = Date.now() + SESSION_MS;
  const payload = String(expires);
  const signature = await sign(payload, env.SESSION_SECRET);
  const value = `${payload}.${signature}`;
  const flags = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(SESSION_MS / 1000)}`,
  ];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

export function clearSessionCookie(secure: boolean): string {
  const flags = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (secure) flags.push('Secure');
  return flags.join('; ');
}

/** Çerezdeki imza ve süre geçerliyse true döner. */
export async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  if (!env.SESSION_SECRET) return false;

  const cookie = readCookie(request, COOKIE_NAME);
  if (!cookie) return false;

  const separator = cookie.lastIndexOf('.');
  if (separator === -1) return false;

  const payload = cookie.slice(0, separator);
  const signature = cookie.slice(separator + 1);

  const expected = await sign(payload, env.SESSION_SECRET);
  if (!timingSafeEqual(signature, expected)) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

export interface AttemptState {
  izinli: boolean;
  kalan: number;
}

/** Kaba kuvvet denemelerini IP başına sınırlar. */
export async function checkAttempts(env: Env, ip: string): Promise<AttemptState> {
  const row = await env.DB.prepare('SELECT deneme, son_deneme FROM login_attempts WHERE ip = ?')
    .bind(ip)
    .first<{ deneme: number; son_deneme: number }>();

  if (!row) return { izinli: true, kalan: MAX_ATTEMPTS };

  const gecen = Date.now() - row.son_deneme;
  if (gecen > LOCKOUT_MS) return { izinli: true, kalan: MAX_ATTEMPTS };

  return { izinli: row.deneme < MAX_ATTEMPTS, kalan: Math.max(0, MAX_ATTEMPTS - row.deneme) };
}

export async function recordFailure(env: Env, ip: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO login_attempts (ip, deneme, son_deneme) VALUES (?, 1, ?)
     ON CONFLICT(ip) DO UPDATE SET
       deneme = CASE WHEN ? - login_attempts.son_deneme > ? THEN 1 ELSE login_attempts.deneme + 1 END,
       son_deneme = ?`,
  )
    .bind(ip, Date.now(), Date.now(), LOCKOUT_MS, Date.now())
    .run();
}

export async function clearFailures(env: Env, ip: string): Promise<void> {
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();
}

/** Şifreyi sabit sürede karşılaştırır. */
export function passwordMatches(given: unknown, expected: string): boolean {
  if (typeof given !== 'string' || !expected) return false;
  return timingSafeEqual(given, expected);
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? 'bilinmiyor';
}

export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
}
