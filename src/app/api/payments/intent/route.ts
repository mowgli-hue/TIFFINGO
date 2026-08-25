export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { payingConfigured, getOrCreateStripeCustomer, priceCustomWeek, splitAmounts } from '@/lib/payments';

/* Creates the order (PENDING) and the authorization hold for it, and hands
   the browser a client_secret to confirm the card against. Nothing is
   captured here — see /api/payments/capture. */
export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
  if (!payingConfigured()) {
    return NextResponse.json({ error: 'Payments are not switched on yet.' }, { status: 503 });
  }

  let body: { kitchenId?: string; type?: 'weekly' | 'custom'; days?: string[][]; address?: string; deliverySlot?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  const { kitchenId, type, days, address, deliverySlot } = body;
  if (!kitchenId || !address || String(address).trim().length < 10) {
    return NextResponse.json({ error: 'Kitchen and delivery address are required.' }, { status: 400 });
  }

  const kitchen = await prisma.kitchen.findFirst({ where: { id: kitchenId, isOpen: true } });
  if (!kitchen) return NextResponse.json({ error: 'That kitchen is not taking orders.' }, { status: 404 });

  try {
    /* Server-side pricing, always. */
    let totalDollars: number;
    let description: string;
    if (type === 'custom' && Array.isArray(days) && days.length) {
      const priced = await priceCustomWeek(kitchenId, days);
      totalDollars = priced.total;
      description = `Custom week at ${kitchen.name}`;
    } else {
      totalDollars = kitchen.weeklyPrice;
      description = `Weekly plan at ${kitchen.name}`;
    }

    const { amount, applicationFee } = splitAmounts(totalDollars, kitchen.commissionPct);
    const customerId = await getOrCreateStripeCustomer(user.userId);

    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        kitchenId,
        status: 'PENDING',
        totalAmount: totalDollars,
        address: String(address).trim().slice(0, 300),
        deliverySlot: deliverySlot ? String(deliverySlot).slice(0, 60) : null,
        isWeekly: true,
        mealName: description,
      },
    });

    const stripe = getStripe();
    const routable = Boolean((kitchen as any).stripeAccountId && (kitchen as any).payoutsEnabled);

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      customer: customerId,
      capture_method: 'manual',            // the DoorDash hold
      setup_future_usage: 'off_session',   // card saved for next week's billing
      description,
      metadata: { orderId: order.id, kitchenId, userId: user.userId },
      /* Split at charge time when the kitchen's bank is connected; until
         then the full amount settles to the platform and we pay out by hand. */
      ...(routable
        ? {
            application_fee_amount: applicationFee,
            transfer_data: { destination: (kitchen as any).stripeAccountId as string },
          }
        : {}),
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripePaymentId: intent.id } });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      orderId: order.id,
      amount: totalDollars,
      holdOnly: true,
    });
  } catch (err: any) {
    console.error('[payments/intent]', err?.message ?? err);
    return NextResponse.json({ error: err?.message?.includes('menu') ? err.message : 'Could not start the payment.' }, { status: 500 });
  }
}
