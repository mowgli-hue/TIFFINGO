import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_KITCHENS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type     = searchParams.get('type');
  const city     = searchParams.get('city');
  const halal    = searchParams.get('halal');
  const veg      = searchParams.get('veg');

  try {
    // Try DB first, fall back to mock data
    let kitchens;
    try {
      kitchens = await prisma.kitchen.findMany({
        where: {
          ...(type && { type }),
          ...(city && { city }),
          ...(halal === 'true' && { isHalal: true }),
          ...(veg === 'true' && { isVeg: true }),
        },
        include: { menuItems: { where: { isAvailable: true } } },
        orderBy: { rating: 'desc' },
      });
    } catch {
      // DB not set up yet — return mock data
      let list = MOCK_KITCHENS;
      if (type) list = list.filter(k => k.type === type);
      if (halal === 'true') list = list.filter(k => k.isHalal);
      if (veg === 'true') list = list.filter(k => k.isVeg);
      return NextResponse.json({ kitchens: list });
    }

    return NextResponse.json({ kitchens });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch kitchens' }, { status: 500 });
  }
}
