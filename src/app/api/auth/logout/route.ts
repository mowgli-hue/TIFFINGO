export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  /* Overwrite with an expired cookie carrying the SAME attributes it was set
     with. A delete() that does not match path/secure/sameSite can leave the
     original in place, and the person stays signed in after "sign out". */
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0, expires: new Date(0) });
  return res;
}
