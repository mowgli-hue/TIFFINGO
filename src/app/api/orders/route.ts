import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        kitchen: { select: { name: true } },
        items: { include: { menuItem: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch {
    // Return mock orders if DB not set up
    return NextResponse.json({
      orders: [
        {
          id: 'order-1',
          status: 'ON_THE_WAY',
          totalAmount: 9,
          createdAt: new Date().toISOString(),
          kitchen: { name: 'Ghar Ka Khana' },
          items: [{ menuItem: { name: 'Dal makhani + rice' }, quantity: 1, price: 9 }],
        },
      ],
    });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { kitchenId, items, address, subscriptionId } = body;

    const totalAmount = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        kitchenId,
        address,
        totalAmount,
        status: 'CONFIRMED',
        subscriptionId: subscriptionId ?? undefined,
        items: {
          create: items.map((item: { menuItemId: string; price: number; quantity: number }) => ({
            menuItemId: item.menuItemId,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
