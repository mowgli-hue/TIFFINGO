export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') ?? 'login';

  const body = await req.json();

  // ── Sign up ──
  if (action === 'signup') {
    const { name, email, password, phone } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
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
      res.cookies.set('tiffingo_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax' });
      return res;
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
  }

  // ── Login ──
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
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
    res.cookies.set('tiffingo_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax' });
    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
