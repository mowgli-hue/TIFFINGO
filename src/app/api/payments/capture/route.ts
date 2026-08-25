export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRole } from '@/lib/roles';
import { getStripe } from '@/lib/stripe';

/* The cutoff moment: kitchen (or admin) confirms the week, the hold becomes
   a real charge. cancel releases the hold instead — customer never sees a
   charge, nothing to refund. */
export async function POST(req: NextRequest) {
  const staff = await apiRole(['MERCHANT', 'ADMIN']);
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { orderId?: string; action?: 'capture' | 'release' };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }
  const { orderId, action } = body;
  if (!orderId || !action) return NextResponse.json({ error: 'orderId and action required' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { kitchen: true } });
  if (!order || !order.stripePaymentId) {
    return NextResponse.json({ error: 'No payment on that order' }, { status: 404 });
  }
  /* A merchant may only settle their own kitchen's orders. */
  if (staff.role === 'MERCHANT' && order.kitchen.ownerId !== staff.id) {
    return NextResponse.json({ error: 'Not your order' }, { status: 403 });
  }

  try {
    const stripe = getStripe();
    if (action === 'capture') {
      await stripe.paymentIntents.capture(order.stripePaymentId);
      const updated = await prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } });
      return NextResponse.json({ order: updated });
    }
    await stripe.paymentIntents.cancel(order.stripePaymentId);
    const updated = await prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
    return NextResponse.json({ order: updated });
  } catch (err: any) {
    console.error('[payments/capture]', err?.message ?? err);
    return NextResponse.json({ error: 'Stripe refused that — check the payment in the dashboard.' }, { status: 502 });
  }
}
