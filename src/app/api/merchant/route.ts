export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

/* Kitchen ids used to be derived from name + city and written with upsert,
   which meant anyone could POST {name:"The Chai Bar", city:"Surrey"} and
   overwrite that restaurant's prices, address and whole week of meals.
   Ids are now random, and this endpoint only ever creates. */
function makeKitchenId(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `${slug || 'kitchen'}-${randomBytes(4).toString('hex')}`;
}

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Sign in before submitting a kitchen.' },
      { status: 401 }
    );
  }

  let body: { kitchen?: any; meals?: any[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { kitchen, meals } = body;
  const name = String(kitchen?.name ?? '').trim();
  const city = String(kitchen?.city ?? 'Surrey').trim();

  if (!name) {
    return NextResponse.json({ error: 'Kitchen name is required.' }, { status: 400 });
  }

  const pricePerMeal = Number(kitchen?.pricePerMeal);
  const weeklyPrice = Number(kitchen?.weeklyPrice);
  if (!Number.isFinite(pricePerMeal) || pricePerMeal <= 0 || pricePerMeal > 500) {
    return NextResponse.json({ error: 'Price per meal must be between $1 and $500.' }, { status: 400 });
  }
  if (!Number.isFinite(weeklyPrice) || weeklyPrice <= 0 || weeklyPrice > 2000) {
    return NextResponse.json({ error: 'Weekly price must be between $1 and $2000.' }, { status: 400 });
  }

  try {
    /* One live listing per name per city. A second application under the same
       name is a support conversation, not a silent overwrite. */
    const clash = await prisma.kitchen.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, city: { equals: city, mode: 'insensitive' } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { error: `A kitchen called "${name}" is already registered in ${city}. Email tiffingo.app@gmail.com and we'll sort it out.` },
        { status: 409 }
      );
    }

    const savings = Math.round((1 - weeklyPrice / (pricePerMeal * 5)) * 100);

    const created = await prisma.kitchen.create({
      data: {
        id: makeKitchenId(name),
        name,
        tagline: String(kitchen?.tagline ?? '').slice(0, 160),
        description: String(kitchen?.description ?? '').slice(0, 2000),
        cuisine: String(kitchen?.cuisine || 'Indian'),
        type: kitchen?.type === 'tiffin' ? 'tiffin' : 'restaurant',
        address: String(kitchen?.address ?? '').slice(0, 300),
        city,
        isHalal: !!kitchen?.isHalal,
        isVeg: !!kitchen?.isVeg,
        pricePerMeal,
        weeklyPrice,
        weeklySavingsPct: Number.isFinite(savings) && savings > 0 ? savings : 15,
        cutoffTime: String(kitchen?.cutoffTime || '8:00pm'),
        deliverySlots: Array.isArray(kitchen?.deliverySlots) && kitchen.deliverySlots.length
          ? kitchen.deliverySlots.map(String).slice(0, 6)
          : ['12:00pm – 1:00pm'],
        isOpen: false, // stays hidden until an admin approves it
      },
    });

    const week = Array.isArray(meals) ? meals.slice(0, 14) : [];
    if (week.length) {
      await prisma.weeklyMeal.createMany({
        data: week.map((meal: any) => ({
          kitchenId: created.id,
          day: String(meal?.day ?? 'Mon'),
          emoji: String(meal?.emoji || '🍛'),
          name: String(meal?.name ?? 'Meal').slice(0, 160),
          description: String(meal?.description ?? '').slice(0, 500),
          protein: String(meal?.protein || '20g'),
          calories: Number(meal?.calories) || 550,
          tags: Array.isArray(meal?.tags) ? meal.tags.map(String).slice(0, 8) : [],
        })),
      });
    }

    return NextResponse.json({ kitchen: created, status: 'pending_approval' }, { status: 201 });
  } catch (error) {
    console.error('[merchant] create failed:', error);
    return NextResponse.json({ error: 'Failed to submit your kitchen. Try again.' }, { status: 500 });
  }
}
