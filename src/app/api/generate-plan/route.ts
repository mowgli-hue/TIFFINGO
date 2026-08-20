export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PLAN_DISCOUNT = 0.15;

export async function POST(req: NextRequest) {
  const { kitchenId, diet, goal, days = 5 } = await req.json();

  const items = await prisma.menuItem.findMany({ where: { kitchenId } });
  if (items.length < 3) return NextResponse.json({ error: 'Menu too small' }, { status: 400 });

  const menuText = items.map(i => `- ${i.name} ($${i.price})`).join('\n');

  try {
    const r = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1600,
      system: `Create a personalized ${days}-day meal plan (Mon-Fri) from ONLY the menu items given. Each day = 2-3 items combined into one meal. Respect diet preference. Vary items across days. Respond ONLY with JSON: {"days":[{"day":"Mon","emoji":"🍛","items":["exact item name","..."],"name":"combo title","description":"1 sentence","calories":550,"protein":"20g"}]}`,
      messages: [{ role: 'user', content: `Menu:\n${menuText}\n\nDiet: ${diet}. Goal: ${goal}. Days: ${days}.` }],
    });
    const text = r.content[0].type === 'text' ? r.content[0].text : '';
    const plan = JSON.parse(text.replace(/```json|```/g, '').trim());

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
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
