export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, signToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') ?? 'login';
  const body = await req.json();

  if (action === 'signup') {
    const { name, email, password, phone } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    // The 8-character rule lived only in the signup form, so posting straight
    // to this route let anyone create an account with a one-character password.
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (typeof email !== 'string' || !EMAIL.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name, email, phone, passwordHash },
        select: { id: true, name: true, email: true, phone: true },
      });
      const token = signToken({ userId: user.id, email: user.email });
      const res = NextResponse.json({ user }, { status: 201 });
      res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
      return res;
    } catch {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    const token = signToken({ userId: user.id, email: user.email });
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}