export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

/* Stripe is the source of truth for money. Whatever the app thinks happened,
   this is where the order's real payment state lands. */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event;
  try {
    const raw = await req.text();
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    console.error('[stripe-webhook] bad signature:', err?.message);
    return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      /* Hold placed successfully — the order is real, tell the kitchen. */
      case 'payment_intent.amount_capturable_updated': {
        const pi = event.data.object as any;
        if (pi.metadata?.orderId) {
          await prisma.order.updateMany({
            where: { id: pi.metadata.orderId, status: 'PENDING' },
            data: { status: 'CONFIRMED' },
          });
        }
        break;
      }
      /* Hold captured — money is actually moving. */
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        if (pi.metadata?.orderId) {
          await prisma.order.updateMany({
            where: { id: pi.metadata.orderId, status: { in: ['PENDING', 'CONFIRMED'] } },
            data: { status: 'PREPARING' },
          });
        }
        break;
      }
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        const pi = event.data.object as any;
        if (pi.metadata?.orderId) {
          await prisma.order.updateMany({
            where: { id: pi.metadata.orderId, status: { in: ['PENDING', 'CONFIRMED'] } },
            data: { status: 'CANCELLED' },
          });
        }
        break;
      }
      /* Kitchen finished Stripe onboarding — their split switches on. */
      case 'account.updated': {
        const acct = event.data.object as any;
        await prisma.kitchen.updateMany({
          where: { stripeAccountId: acct.id } as any,
          data: { payoutsEnabled: Boolean(acct.payouts_enabled) } as any,
        });
        break;
      }
    }
  } catch (err) {
    console.error('[stripe-webhook]', event.type, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
