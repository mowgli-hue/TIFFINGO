export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { askJson, AiError } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';

type Item = { name: string; price: string; category?: string };
type Meal = {
  day: string; emoji: string; name: string; description: string;
  protein: string; calories: number; tags: string[]; items?: string[];
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/* A tiffin is a meal, not a drinks order. We need to know which items can
   actually anchor a day before we ask for a week. */
const DRINK = /\b(chai|tea|coffee|latte|lassi|juice|soda|pop|shake|smoothie|water|milk|cola|kahwa|sharbat|thandai)\b/i;

/* Plenty of food carries a drink word in its name — chai masala toast, milk
   cake, tea biscuits. Food wins whenever both match, because wrongly filing a
   main as a drink is the damaging mistake: it starves the week of anchors. */
const FOOD = /\b(toasts?|cakes?|rolls?|breads?|buns?|sandwich(es)?|burgers?|wraps?|parath(a|as|e)|paranthas?|naans?|rotis?|kulchas?|biscuits?|cookies?|rusks?|samosas?|pakoras?|pakodas?|chaat|thalis?|rice|biryani|pulao|curry|dosas?|idlis?|vadas?|noodles|fries|platters?|bowls?|salads?|sabzi|dal|paneer|chicken|mutton|fish|eggs?|omelettes?|barfi|halwa|ladoos?|jalebi|gulab)\b/i;

function isDrink(i: Item): boolean {
  if (FOOD.test(i.name)) return false;
  if (i.category && /drink|beverage|chai|tea|coffee|shake|juice/i.test(i.category)) return true;
  return DRINK.test(i.name);
}

const SYSTEM = `You are TiffinGo's meal designer. A restaurant has given you their menu. Build exactly 5 daily tiffin combos, Monday to Friday.

What a combo is:
- One substantial food item as the anchor of the day — a curry, rice, bread, wrap, roll, thali, snack platter or similar.
- Optionally one drink alongside it, and optionally one small side.

Hard rules, in order of importance:
1. EVERY combo must contain at least one FOOD item. Never build a combo out of two drinks — "Adrak Chai + Elaichi Chai" is not a meal and is a failure.
2. At most ONE drink per combo.
3. Use each food item as the anchor at most once across the week. Five days means five different anchors.
4. Use item names EXACTLY as they appear on the menu. Never invent an item that is not on the list.
5. Name the combo after what is in it, and write a specific one-sentence description — mention what the food actually is, not "a delicious pairing".
6. Estimate calories and protein per combo from the actual contents. They must differ across the week; identical numbers on all five days is a failure.
7. Pick an emoji that matches the food, not the drink.
8. items[] must list the exact menu names used in that combo.

Respond ONLY with valid JSON, no markdown, no backticks:
{"meals":[{"day":"Mon","emoji":"🍛","name":"...","description":"...","items":["exact name","exact name"],"protein":"22g","calories":610,"tags":["Vegetarian"]}]}`;

function problems(meals: Meal[], foods: Set<string>): string[] {
  const out: string[] = [];
  if (!Array.isArray(meals) || meals.length !== 5) {
    out.push(`expected 5 meals, got ${Array.isArray(meals) ? meals.length : 'none'}`);
    return out;
  }
  DAYS.forEach((d, i) => { if (meals[i]?.day !== d) out.push(`day ${i} should be ${d}`); });

  const anchors = new Set<string>();
  meals.forEach((m) => {
    const used = (m.items || []).filter((n) => foods.has(n.toLowerCase()));
    if (!used.length) out.push(`${m.day}: no food item, only drinks`);
    used.forEach((n) => {
      if (anchors.has(n.toLowerCase())) out.push(`${m.day}: "${n}" already anchors another day`);
      anchors.add(n.toLowerCase());
    });
  });

  const cals = new Set(meals.map((m) => m.calories));
  if (cals.size === 1) out.push('every day has identical calories');
  return out;
}

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) return NextResponse.json({ error: 'Sign in to use this.' }, { status: 401 });

  const { menuItems, kitchenName, isHalal, isVeg } = await req.json();
  const items: Item[] = Array.isArray(menuItems) ? menuItems : [];

  if (items.length < 3) {
    return NextResponse.json({ error: 'Add at least 3 menu items' }, { status: 400 });
  }

  const foodItems = items.filter((i) => !isDrink(i));
  if (foodItems.length < 2) {
    /* This is the honest answer to a chai-only menu. Pairing two chais and
       calling it Monday's tiffin would be worse than saying nothing. */
    return NextResponse.json({
      error:
        'We could only find drinks on this menu. A tiffin week needs food to build around — add a few mains (parathas, wraps, rice bowls, thalis) and we will plan the week around those.',
    }, { status: 422 });
  }

  const foodNames = new Set(foodItems.map((i) => i.name.toLowerCase()));
  const menuText = items
    .map((m) => `- ${m.name} ($${m.price})${m.category ? ` [${m.category}]` : ''}${isDrink(m) ? ' (DRINK)' : ' (FOOD)'}`)
    .join('\n');
  const dietary = [isHalal && 'Halal', isVeg && 'Vegetarian only'].filter(Boolean).join(', ');

  const ask = (extra = '') =>
    askJson<{ meals: Meal[] }>({
      system: SYSTEM,
      maxTokens: 4000,
      user:
        `Restaurant: ${kitchenName}${dietary ? ` (${dietary})` : ''}\n\n` +
        `Menu (${foodItems.length} food items, ${items.length - foodItems.length} drinks):\n${menuText}\n\n` +
        `Build the 5-day tiffin calendar.${extra}`,
    });

  try {
    let parsed = await ask();
    let bad = problems(parsed?.meals, foodNames);

    if (bad.length) {
      // One correction pass — tell it exactly what it got wrong.
      console.warn('[generate-meals] retrying, first attempt:', bad.join('; '));
      parsed = await ask(`\n\nYour previous attempt was rejected for: ${bad.join('; ')}. Fix these and return the corrected JSON.`);
      bad = problems(parsed?.meals, foodNames);
    }

    if (bad.length) {
      console.error('[generate-meals] gave up:', bad.join('; '));
      return NextResponse.json({
        error: 'We could not build a sensible week from this menu. Try adding a few more food items, then generate again.',
      }, { status: 422 });
    }

    const tags = isVeg ? ['Vegetarian'] : isHalal ? ['Halal'] : [];
    const meals = parsed.meals.map((m) => ({ ...m, tags: m.tags?.length ? m.tags : tags }));
    return NextResponse.json({ meals });
  } catch (err: any) {
    const reason = err instanceof AiError ? err.reason : 'api';
    console.error('[generate-meals]', reason, err?.message ?? err);

    if (reason === 'no-key') {
      return NextResponse.json({ error: 'Meal generation is unavailable right now — you can add your combos by hand.' }, { status: 503 });
    }
    if (err?.status === 429) {
      return NextResponse.json({ error: 'Busy right now — wait a minute and generate again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Generating the week failed. Hit Regenerate to try again.' }, { status: 502 });
  }
}
