export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRole } from '@/lib/roles';
import { getStripe } from '@/lib/stripe';
import { payingConfigured } from '@/lib/payments';

/* Sends the kitchen owner into Stripe's own onboarding (Express). Bank
   details, identity, tax — all collected by Stripe on Stripe's pages. We
   store only the account id. */
export async function POST(req: NextRequest) {
  const user = await apiRole(['MERCHANT', 'ADMIN']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!payingConfigured()) {
    return NextResponse.json({ error: 'Payments are not switched on yet.' }, { status: 503 });
  }

  const kitchen = await prisma.kitchen.findFirst({ where: { ownerId: user.id } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen on this account' }, { status: 404 });

  try {
    const stripe = getStripe();
    let accountId = (kitchen as any).stripeAccountId as string | null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'CA',
        email: user.email,
        business_type: 'individual',
        metadata: { kitchenId: kitchen.id },
        capabilities: { transfers: { requested: true } },
      });
      accountId = account.id;
      await prisma.kitchen.update({
        where: { id: kitchen.id },
        data: { stripeAccountId: accountId } as any,
      });
    }

    const origin = req.nextUrl.origin;
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${origin}/dashboard?stripe=refresh`,
      return_url: `${origin}/dashboard?stripe=done`,
    });

    return NextResponse.json({ url: link.url });
  } catch (err: any) {
    console.error('[stripe-onboard]', err?.message ?? err);
    return NextResponse.json({ error: 'Could not start Stripe onboarding.' }, { status: 502 });
  }
}
