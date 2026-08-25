export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { askJson, AiError } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PLAN_DISCOUNT = 0.15;

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to use this.' }, { status: 401 });
  }

  const { kitchenId, diet, goal, days = 5 } = await req.json();

  const items = await prisma.menuItem.findMany({ where: { kitchenId } });
  if (items.length < 3) return NextResponse.json({ error: 'Menu too small' }, { status: 400 });

  const menuText = items.map(i => `- ${i.name} ($${i.price})`).join('\n');

  try {
    const plan: any = await askJson({
      maxTokens: 4000,
      system: `Create a personalized ${days}-day meal plan (Mon-Fri) from ONLY the menu items given. Each day = 2-3 items combined into one meal. Respect diet preference. Vary items across days. Respond ONLY with JSON: {"days":[{"day":"Mon","emoji":"🍛","items":["exact item name","..."],"name":"combo title","description":"1 sentence","calories":550,"protein":"20g"}]}`,
      user: `Menu:\n${menuText}\n\nDiet: ${diet}. Goal: ${goal}. Days: ${days}.`,
    });
    if (!Array.isArray(plan?.days) || !plan.days.length) {
      return NextResponse.json({ error: 'Could not build a plan from that menu.' }, { status: 422 });
    }

    // Price each day = sum of its items, plan total = sum - 15%
    const priceMap = Object.fromEntries(items.map(i => [i.name, Number(i.price)]));
    let subtotal = 0;
    plan.days = plan.days.map((d: any) => {
      const dayPrice = d.items.reduce((s: number, n: string) => s + (priceMap[n] ?? 0), 0);
      subtotal += dayPrice;
      return { ...d, price: dayPrice };
    });
    const total = +(subtotal * (1 - PLAN_DISCOUNT)).toFixed(2);
    return NextResponse.json({ ...plan, subtotal: +subtotal.toFixed(2), discountPct: PLAN_DISCOUNT * 100, total });
  } catch (e: any) {
    console.error('[generate-plan]', e instanceof AiError ? e.reason : '', e?.message ?? e);
    return NextResponse.json({ error: 'Building your plan failed — try again in a moment.' }, { status: 502 });
  }
}
