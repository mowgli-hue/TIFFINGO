export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { kitchen, meals } = await req.json();

    const kitchenId = kitchen.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + kitchen.city.toLowerCase();

    const created = await prisma.kitchen.upsert({
      where: { id: kitchenId },
      update: {
        name: kitchen.name,
        tagline: kitchen.tagline || '',
        description: kitchen.description || '',
        cuisine: kitchen.cuisine || 'Indian',
        type: kitchen.type || 'restaurant',
        address: kitchen.address || '',
        city: kitchen.city || 'Surrey',
        isHalal: !!kitchen.isHalal,
        isVeg: !!kitchen.isVeg,
        pricePerMeal: Number(kitchen.pricePerMeal) || 12,
        weeklyPrice: Number(kitchen.weeklyPrice) || 50,
        weeklySavingsPct: Math.round((1 - Number(kitchen.weeklyPrice) / (Number(kitchen.pricePerMeal) * 5)) * 100) || 15,
        cutoffTime: kitchen.cutoffTime || '8:00pm',
        deliverySlots: kitchen.deliverySlots || ['12:00pm – 1:00pm'],
        isOpen: false, // pending admin approval
      },
      create: {
        id: kitchenId,
        name: kitchen.name,
        tagline: kitchen.tagline || '',
        description: kitchen.description || '',
        cuisine: kitchen.cuisine || 'Indian',
        type: kitchen.type || 'restaurant',
        address: kitchen.address || '',
        city: kitchen.city || 'Surrey',
        isHalal: !!kitchen.isHalal,
        isVeg: !!kitchen.isVeg,
        pricePerMeal: Number(kitchen.pricePerMeal) || 12,
        weeklyPrice: Number(kitchen.weeklyPrice) || 50,
        weeklySavingsPct: Math.round((1 - Number(kitchen.weeklyPrice) / (Number(kitchen.pricePerMeal) * 5)) * 100) || 15,
        cutoffTime: kitchen.cutoffTime || '8:00pm',
        deliverySlots: kitchen.deliverySlots || ['12:00pm – 1:00pm'],
        isOpen: false,
      },
    });

    // Replace weekly meals
    await prisma.weeklyMeal.deleteMany({ where: { kitchenId } });
    for (const meal of meals) {
      await prisma.weeklyMeal.create({
        data: {
          kitchenId,
          day: meal.day,
          emoji: meal.emoji || '🍛',
          name: meal.name,
          description: meal.description || '',
          protein: meal.protein || '20g',
          calories: meal.calories || 550,
          tags: meal.tags || [],
        },
      });
    }

    return NextResponse.json({ kitchen: created, status: 'pending_approval' }, { status: 201 });
  } catch (error) {
    console.error('Merchant creation error:', error);
    return NextResponse.json({ error: 'Failed to create kitchen' }, { status: 500 });
  }
}
