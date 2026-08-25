import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

/* The DoorDash shape, sized for us:

   1. Card is tokenized by Stripe in the browser — it never touches our
      servers. We only ever hold Stripe ids.
   2. Checkout places an AUTHORIZATION HOLD (manual capture), not a charge.
   3. The kitchen confirming the week (or the cutoff job) CAPTURES it.
      A cancelled week releases the hold — no refund, nothing to unwind.
   4. Each charge splits inside Stripe: our commission stays on the platform
      account, the kitchen's share settles to their Connect account. */

export function payingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('No such user');
  if (user.stripeId) return user.stripeId;
  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId },
  });
  await prisma.user.update({ where: { id: userId }, data: { stripeId: customer.id } });
  return customer.id;
}

const PLAN_DISCOUNT = 0.15;

/* Price is ALWAYS recomputed here from the database. The client sends item
   names, never amounts — a lesson already learned once on /api/orders. */
export async function priceCustomWeek(kitchenId: string, days: string[][]) {
  const items = await prisma.menuItem.findMany({ where: { kitchenId } });
  const priceMap = new Map(items.map((i) => [i.name.toLowerCase(), Number(i.price)]));
  let subtotal = 0;
  const summary: string[] = [];
  for (const day of days) {
    for (const name of day) {
      const p = priceMap.get(String(name).toLowerCase());
      if (p === undefined) throw new Error(`"${name}" is not on this kitchen's menu`);
      subtotal += p;
    }
    summary.push(day.join(' + '));
  }
  if (subtotal <= 0) throw new Error('That plan has no priced items');
  const total = +(subtotal * (1 - PLAN_DISCOUNT)).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), total, summary };
}

/* Amount in cents, commission from the kitchen's own rate. */
export function splitAmounts(totalDollars: number, commissionPct: number) {
  const amount = Math.round(totalDollars * 100);
  const applicationFee = Math.round(amount * (commissionPct / 100));
  return { amount, applicationFee };
}
