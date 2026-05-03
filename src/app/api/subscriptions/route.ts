import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, PLANS } from '@/lib/stripe';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.userId },
      include: { kitchen: { select: { name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json({ subscriptions: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { kitchenId, plan, deliveryDays, deliveryTime, paymentMethodId } = await req.json();

    const planData = PLANS[plan as keyof typeof PLANS];
    if (!planData) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    // Get or create Stripe customer
    let dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let stripeCustomerId = dbUser.stripeId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
        metadata: { userId: user.userId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({ where: { id: user.userId }, data: { stripeId: customer.id } });
    }

    // Attach payment method
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    // Create subscription in DB
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.userId,
        kitchenId,
        plan,
        mealsPerWeek: planData.mealsPerWeek,
        pricePerWeek: planData.pricePerWeek,
        deliveryDays,
        deliveryTime: deliveryTime ?? '12:00-13:00',
        stripeSubId: `sim_${Date.now()}`, // Replace with real Stripe sub ID
        nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();

  try {
    const subscription = await prisma.subscription.update({
      where: { id, userId: user.userId },
      data: {
        status,
        ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
      },
    });
    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
