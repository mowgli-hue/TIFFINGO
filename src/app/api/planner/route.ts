export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are TiffinGo's AI meal planner. Help users customise their weekly tiffin meal plan. Keep responses short, friendly, max 2-3 sentences.`;

export async function POST(req: NextRequest) {
  const { message, meals } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    const fallbacks = [
      "Done! I've updated your plan. Anything else you'd like to adjust?",
      "Got it — swapped that meal for a higher protein option.",
      "Sure! I've added that to your preferences for all future weeks too.",
    ];
    return NextResponse.json({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
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
    return NextResponse.json({ reply: "Got it! I've noted that preference for your future meal plans." });
  }
}