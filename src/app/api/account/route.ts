export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

/* App Store Guideline 5.1.1(v) and Play's Data deletion policy both require
   that an account created in the app can be deleted from inside the app,
   without emailing anyone. This actually deletes — it does not deactivate. */
export async function DELETE(req: NextRequest) {
  const session = getAuthUser();
  if (!session) return NextResponse.json({ error: 'Sign in first' }, { status: 401 });

  let body: { confirm?: string };
  try { body = await req.json(); } catch { body = {}; }
  if (body.confirm !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm.' }, { status: 400 });
  }

  const userId = session.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { orders: true, kitchens: true },
    });
    if (!user) return NextResponse.json({ error: 'No such account' }, { status: 404 });

    /* Money first: never leave an authorization hold on a card belonging to
       an account that no longer exists. */
    const uncaptured = user.orders.filter(
      (o) => o.stripePaymentId && (o.status === 'PENDING' || o.status === 'CONFIRMED')
    );
    for (const order of uncaptured) {
      try {
        await getStripe().paymentIntents.cancel(order.stripePaymentId!);
      } catch (err) {
        console.error('[account] could not release hold', order.id, err);
      }
    }

    await prisma.$transaction(async (tx) => {
      /* A kitchen outlives its owner's account — it has customers. Close it
         and detach it rather than deleting someone else's dinner. */
      if (user.kitchens.length) {
        await tx.kitchen.updateMany({
          where: { ownerId: userId },
          data: { ownerId: null, isOpen: false },
        });
      }

      const orderIds = user.orders.map((o) => o.id);
      if (orderIds.length) {
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      }
      await tx.review.deleteMany({ where: { userId } });
      await tx.order.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    /* Stripe customer object holds an email and card fingerprints. */
    if (user.stripeId) {
      try { await getStripe().customers.del(user.stripeId); }
      catch (err) { console.error('[account] stripe customer delete failed', err); }
    }

    const res = NextResponse.json({ deleted: true });
    res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0, expires: new Date(0) });
    return res;
  } catch (err) {
    console.error('[account] delete failed:', err);
    return NextResponse.json(
      { error: 'We could not delete the account. Email tiffingo.app@gmail.com and we will do it by hand.' },
      { status: 500 }
    );
  }
}
