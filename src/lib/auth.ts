import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

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

export function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('tiffingo_token')?.value;
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
