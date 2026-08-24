import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export type Role = 'CUSTOMER' | 'MERCHANT' | 'DRIVER' | 'ADMIN';

/* Server-side gate for the staff areas. Called from a server component so the
   check happens before any markup is sent — a client-side check would ship the
   page to anyone who asked for it. */
export async function requireRole(allowed: Role[], from: string) {
  const session = getAuthUser();
  if (!session) redirect(`/auth/login?next=${encodeURIComponent(from)}`);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || !allowed.includes(user.role as Role)) redirect('/');
  return user;
}

/* Same check for API routes: returns the user, or null for the caller to 401. */
export async function apiRole(allowed: Role[]) {
  const session = getAuthUser();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user || !allowed.includes(user.role as Role)) return null;
  return user;
}
