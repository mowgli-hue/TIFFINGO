export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropic, AI_MODEL } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';


const SYSTEM = `You are TiffinGo's meal designer. Given a restaurant's menu items, create exactly 5 daily meal combos (Monday to Friday) for their weekly TiffinGo calendar.

Rules:
1. Each combo pairs 2-3 menu items into one satisfying meal (e.g. a drink + a main, or a main + a side)
2. Variety across the week — don't repeat the same main item twice
3. Balance the week: mix lighter and heavier days
4. Name each combo clearly using the actual menu item names
5. Write an appetizing 1-sentence description for each
6. Pick an appropriate emoji for each day
7. Estimate calories and protein per combo realistically

Respond ONLY with valid JSON, no markdown, no backticks, in this exact format:
{"meals":[{"day":"Mon","emoji":"🫖","name":"Combo name","description":"...","protein":"18g","calories":520,"tags":["Vegetarian"]},...]}`;

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to use this.' }, { status: 401 });
  }

  const { menuItems, kitchenName, isHalal, isVeg } = await req.json();

  if (!menuItems || menuItems.length < 3) {
    return NextResponse.json({ error: 'Add at least 3 menu items' }, { status: 400 });
  }

  const menuText = menuItems.map((m: { name: string; price: string; category?: string }) =>
    `- ${m.name} ($${m.price})${m.category ? ` [${m.category}]` : ''}`
  ).join('\n');

  const dietary = [isHalal && 'Halal', isVeg && 'Vegetarian only'].filter(Boolean).join(', ');

  try {
    const response = await getAnthropic().messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Restaurant: ${kitchenName}${dietary ? ` (${dietary})` : ''}\n\nMenu:\n${menuText}\n\nCreate the 5-day meal combo calendar.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Meal generation error:', error);
    // Fallback: build simple combos from the menu items directly
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const emojis = ['🫖', '🌯', '🍛', '🍔', '🥗'];
    const meals = days.map((day, i) => {
      const item1 = menuItems[i % menuItems.length];
      const item2 = menuItems[(i + 1) % menuItems.length];
      return {
        day, emoji: emojis[i],
        name: `${item1.name} + ${item2.name}`,
        description: `A delicious pairing of ${item1.name.toLowerCase()} with ${item2.name.toLowerCase()}, made fresh daily.`,
        protein: '20g', calories: 550,
        tags: isVeg ? ['Vegetarian'] : isHalal ? ['Halal'] : [],
      };
    });
    return NextResponse.json({ meals });
  }
}
