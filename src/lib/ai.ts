import Anthropic from '@anthropic-ai/sdk';

/* One place to change the model.

   Model IDs get retired. When every AI route suddenly starts returning
   "404 not_found_error: model: ..." this line is the cause, not the key.
   ANTHROPIC_MODEL lets it be swapped from Vercel without a code deploy. */
export const AI_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

let cached: Anthropic | null = null;

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  if (!cached) cached = new Anthropic({ apiKey });
  return cached;
}
