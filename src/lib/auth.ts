import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';

/* No silent fallback secret. A missing JWT_SECRET in production means every
   session token is signable by anyone who has read the source, so refuse to
   run rather than appear to work. */
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'JWT_SECRET is missing or too short. Set a random 32+ character value in the environment before deploying.'
      );
    }
    return 'dev-only-secret-not-for-production';
  }
  return secret;
}

/* True when a usable secret is configured. Routes call this before doing any
   work, so a misconfigured deploy fails cleanly instead of half-way through. */
export function authConfigured(): boolean {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return true;
  return process.env.NODE_ENV !== 'production';
}

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, getSecret(), { expiresIn: '30d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getSecret()) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/* The website authenticates with an http-only cookie. The iOS and Android
   apps cannot: their pages are served from capacitor:// and file://, so the
   cookie is cross-site and the webview will not attach it. They send the same
   signed token as a bearer header instead — same secret, same verification,
   no SameSite=None loosening of the web session. */
export function getAuthUser() {
  const bearer = headers().get('authorization');
  if (bearer?.startsWith('Bearer ')) {
    const fromHeader = verifyToken(bearer.slice(7).trim());
    if (fromHeader) return fromHeader;
  }
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/* Shared cookie options so every route that sets the session agrees. */
export const SESSION_COOKIE = 'tiffingo_token';
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};
