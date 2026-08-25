export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRole } from '@/lib/roles';

/* Everything the merchant dashboard shows, straight from the database.
   No sample rows: a kitchen with no orders gets zeros and says so. */
export async function GET() {
  const user = await apiRole(['MERCHANT', 'ADMIN']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const kitchen = await prisma.kitchen.findFirst({
      where: { ownerId: user.id },
      include: { weeklyMeals: { orderBy: { createdAt: 'asc' } } },
    });

    if (!kitchen) {
      return NextResponse.json({ kitchen: null, orders: [], stats: null });
    }

    const orders = await prisma.order.findMany({
      where: { kitchenId: kitchen.id },
      include: {
        user: { select: { name: true } },
        items: { include: { menuItem: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const paid = orders.filter((o) => o.status !== 'CANCELLED');
    const todays = paid.filter((o) => o.createdAt >= startOfToday);
    const activeSubs = await prisma.subscription.count({
      where: { kitchenId: kitchen.id, status: 'ACTIVE' },
    });

    return NextResponse.json({
      kitchen: {
        id: kitchen.id,
        name: kitchen.name,
        isOpen: kitchen.isOpen,
        rating: kitchen.rating,
        reviewCount: kitchen.reviewCount,
        commissionPct: kitchen.commissionPct,
        weeklyMeals: kitchen.weeklyMeals,
      },
      orders,
      stats: {
        ordersToday: todays.length,
        revenueToday: +todays.reduce((s, o) => s + o.totalAmount, 0).toFixed(2),
        ordersAllTime: paid.length,
        revenueAllTime: +paid.reduce((s, o) => s + o.totalAmount, 0).toFixed(2),
        activeSubs,
      },
    });
  } catch (err) {
    console.error('[merchant/orders]', err);
    return NextResponse.json({ error: 'Could not load your kitchen' }, { status: 500 });
  }
}
