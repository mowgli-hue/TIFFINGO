export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropic, AI_MODEL, textOf, aiConfigured } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';


const SYSTEM_PROMPT = `You are TiffinGo's AI meal planner. Help users customise their weekly tiffin meal plan. Keep responses short, friendly, max 2-3 sentences.`;

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to use this.' }, { status: 401 });
  }

  const { message, meals } = await req.json();

  if (!aiConfigured()) {
    /* Never answer "Done! I've updated your plan" when nothing was updated.
       Saying so cost the user their trust the first time they checked. */
    return NextResponse.json(
      { error: 'The planner is offline right now. Your plan has not been changed.' },
      { status: 503 }
    );
  }

  try {
    const mealSummary = meals
      ? meals.map((m: { day: string; name: string; kitchen: string; protein: string }) =>
          `${m.day}: ${m.name} (${m.kitchen}, ${m.protein} protein)`
        ).join('\n')
      : '';

    const userMessage = meals
      ? `Current week plan:\n${mealSummary}\n\nUser request: ${message}`
      : message;

    const response = await getAnthropic().messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const reply = textOf(response);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('[planner]', error?.status ?? '', error?.message ?? error);
    return NextResponse.json(
      { error: "That didn't go through — your plan is unchanged. Try again in a moment." },
      { status: 502 }
    );
  }
}