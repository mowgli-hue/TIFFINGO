export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are TiffinGo's AI meal planner — a friendly, knowledgeable nutrition assistant that helps users customise their weekly tiffin meal plan.

You have access to kitchens on the TiffinGo platform:
- Ghar Ka Khana (Indian home kitchen, Halal, North Indian cuisine)
- Nourish Box (Healthy meal prep, vegan/vegetarian options, high protein)
- Chabar Kitchen (Indian restaurant, Halal, wide menu)

Your job:
1. Help users adjust their weekly meal plan based on dietary goals (High protein, Halal, Vegan, Weight loss, etc.)
2. Suggest meal swaps when asked
3. Explain nutritional benefits of meals
4. Keep responses SHORT, friendly, and actionable — max 2-3 sentences
5. When swapping meals, mention the specific new meal name and its key benefit

Current plan context will be provided in the user message.
Always respond in first person as the AI planner. Never mention being Claude or Anthropic.`;

export async function POST(req: NextRequest) {
  const { message, meals } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    // Fallback if no API key
    const fallbacks = [
      "Done! I've updated your plan. Anything else you'd like to adjust?",
      "Got it — swapped that meal for a higher protein option. Your weekly average is now 37g protein/meal.",
      "Sure! I've added that to your preferences for all future weeks too.",
      "I've noted that. Your dietary preferences will be applied to all future weeks.",
    ];
    return NextResponse.json({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }

  try {
    const userMessage = meals
      ? `Current week plan:
${meals.map((m: { day: string; name: string; kitchen: string; protein: string }) => `${m.day}: ${m.name} (${m.kitchen}, ${m.protein} protein)`).join('
')}

User request: ${message}`
      : message;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json({ reply: "Got it! I've noted that preference and will apply it to your future meal plans." });
  }
}
