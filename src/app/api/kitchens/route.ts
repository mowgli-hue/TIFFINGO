export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') ?? 'Surrey';

  try {
    const kitchens = await prisma.kitchen.findMany({
      where: { city },
      include: {
        weeklyMeals: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { rating: 'desc' },
    });
    return NextResponse.json({ kitchens });
  } catch (error) {
    console.error('DB error:', error);
    return NextResponse.json({ kitchens: [] });
  }
}
