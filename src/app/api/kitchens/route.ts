export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/* Public catalogue. Only kitchens that have been approved and are taking
   orders are ever returned here — pending applications carry isOpen:false
   and must not be visible to customers. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const city = searchParams.get('city') ?? 'Surrey';

  try {
    if (id) {
      const kitchen = await prisma.kitchen.findFirst({
        where: { id, isOpen: true },
        include: { weeklyMeals: { orderBy: { createdAt: 'asc' } } },
      });
      if (!kitchen) {
        return NextResponse.json({ error: 'Kitchen not found' }, { status: 404 });
      }
      return NextResponse.json({ kitchen });
    }

    const kitchens = await prisma.kitchen.findMany({
      where: { city, isOpen: true },
      include: { weeklyMeals: { orderBy: { createdAt: 'asc' } } },
      orderBy: { rating: 'desc' },
    });
    return NextResponse.json({ kitchens });
  } catch (error) {
    console.error('[kitchens] DB error:', error);
    return NextResponse.json({ error: 'Could not load kitchens' }, { status: 500 });
  }
}
