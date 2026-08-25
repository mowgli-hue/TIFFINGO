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

export class AiError extends Error {
  constructor(
    public reason: 'truncated' | 'unparseable' | 'no-key' | 'api',
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AiError';
  }
}

/* Never read content[0] directly — a response can carry more than one block,
   and the first is not guaranteed to be the text one. */
export function textOf(response: { content: Array<{ type: string; text?: string }> }): string {
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');
}

function stripFences(raw: string): string {
  return raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
}

/* Ask for JSON and get JSON back, or a typed error explaining which way it
   failed. `truncated` is the one that used to masquerade as bad AI output:
   max_tokens cuts the reply mid-object and JSON.parse dies on the stub. */
export async function askJson<T = any>(opts: {
  system: string;
  user: string | any[];
  maxTokens?: number;
}): Promise<T> {
  if (!aiConfigured()) throw new AiError('no-key', 'ANTHROPIC_API_KEY is not set');

  let response;
  try {
    response = await getAnthropic().messages.create({
      model: AI_MODEL,
      max_tokens: opts.maxTokens ?? 4000,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user as any }],
    });
  } catch (err: any) {
    throw new AiError('api', `${AI_MODEL}: ${err?.message ?? err}`, err?.status);
  }

  if (response.stop_reason === 'max_tokens') {
    throw new AiError('truncated', `reply hit the ${opts.maxTokens ?? 4000} token ceiling`);
  }

  const raw = stripFences(textOf(response));
  try {
    return JSON.parse(raw) as T;
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]) as T; } catch { /* fall through */ }
    }
    throw new AiError('unparseable', `model did not return JSON (${raw.slice(0, 120)})`);
  }
}
