export const runtime = 'nodejs';
export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropic, AI_MODEL, aiConfigured } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';
import { lookup } from 'dns/promises';
import net from 'net';


const MAX_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_TEXT_CHARS = 24_000;

/* Sites that reliably refuse server-side fetches. Worth naming them so the
   restaurant gets a useful instruction instead of a generic failure. */
const UNFETCHABLE: Record<string, string> = {
  'instagram.com': 'Instagram',
  'www.instagram.com': 'Instagram',
  'facebook.com': 'Facebook',
  'www.facebook.com': 'Facebook',
  'm.facebook.com': 'Facebook',
};

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const p = ip.split('.').map(Number);
    return (
      p[0] === 0 || p[0] === 10 || p[0] === 127 ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127)
    );
  }
  const v = ip.toLowerCase();
  return (
    v === '::1' || v === '::' ||
    v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') ||
    v.startsWith('::ffff:')
  );
}

/* Never let a pasted link reach something inside our own network. */
async function resolvePublicUrl(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    throw new Error("That doesn't look like a valid link.");
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Only http and https links work.');
  }
  const blocked = UNFETCHABLE[u.hostname.toLowerCase()];
  if (blocked) {
    throw new Error(
      `${blocked} blocks automated reading. Copy your menu text and paste it instead — that works every time.`
    );
  }
  const { address } = await lookup(u.hostname);
  if (isPrivateAddress(address)) throw new Error('That link points to a private address.');
  return u;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/li|\/tr|\/h[1-6]|\/div)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

const SYSTEM = `You read a restaurant's menu and pull out the individual items TiffinGo can build meal combos from.

Rules:
1. Return only real, orderable food and drink items. Skip headings, descriptions, allergen notes, opening hours, addresses, delivery blurb and navigation text.
2. Use the item name exactly as written on the menu. Do not invent or translate items.
3. price: the number only, no currency symbol (e.g. "12.99"). If an item has several sizes, use the smallest. If no price is shown, use "".
4. category: the menu section it sits under (e.g. "Mains", "Drinks", "Sides") or "" if there isn't one.
5. Return at most 40 items, in menu order.
6. If the content is not a menu at all, return {"items":[],"reason":"not a menu"}.

Respond ONLY with valid JSON, no markdown fences:
{"items":[{"name":"Masala Chai","price":"3.50","category":"Drinks"}]}`;

type Extracted = { name: string; price: string; category?: string };

function parseItems(raw: string): { items: Extracted[]; reason?: string } {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return { items: [] };
    try { parsed = JSON.parse(m[0]); } catch { return { items: [] }; }
  }
  const items: Extracted[] = Array.isArray(parsed?.items) ? parsed.items : [];
  return {
    reason: typeof parsed?.reason === 'string' ? parsed.reason : undefined,
    items: items
      .filter((i) => i && typeof i.name === 'string' && i.name.trim())
      .slice(0, 40)
      .map((i) => ({
        name: String(i.name).trim().slice(0, 120),
        price: String(i.price ?? '').replace(/[^0-9.]/g, '').slice(0, 10),
        category: i.category ? String(i.category).trim().slice(0, 40) : '',
      })),
  };
}

export async function POST(req: NextRequest) {
  const user = getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to use this.' }, { status: 401 });
  }

  if (!aiConfigured()) {
    return NextResponse.json(
      { error: 'Menu import is temporarily unavailable. Paste your items in by hand for now.' },
      { status: 503 }
    );
  }

  let body: { url?: string; text?: string; file?: { data: string; mediaType: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { url, text, file } = body;
  let content: any[];
  let source = '';

  try {
    if (text && text.trim().length > 20) {
      source = 'pasted text';
      content = [{ type: 'text', text: `Menu:\n\n${text.trim().slice(0, MAX_TEXT_CHARS)}` }];

    } else if (file?.data && file.mediaType) {
      const bytes = Math.ceil((file.data.length * 3) / 4);
      if (bytes > MAX_BYTES) {
        return NextResponse.json({ error: 'That file is over 5MB — try a smaller one.' }, { status: 413 });
      }
      if (file.mediaType === 'application/pdf') {
        source = 'PDF';
        content = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file.data } },
          { type: 'text', text: 'Pull the menu items out of this PDF.' },
        ];
      } else if (/^image\/(png|jpeg|jpg|webp|gif)$/.test(file.mediaType)) {
        source = 'photo';
        content = [
          { type: 'image', source: { type: 'base64', media_type: file.mediaType.replace('image/jpg', 'image/jpeg'), data: file.data } },
          { type: 'text', text: 'Pull the menu items out of this photo of a menu.' },
        ];
      } else {
        return NextResponse.json({ error: 'Upload a PDF, JPG or PNG.' }, { status: 415 });
      }

    } else if (url && url.trim()) {
      const target = await resolvePublicUrl(url);
      source = target.hostname;

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(target.toString(), {
          signal: ctrl.signal,
          redirect: 'follow',
          headers: { 'User-Agent': 'TiffinGoBot/1.0 (+https://tiffingo.app)', Accept: 'text/html,application/pdf,*/*' },
        });
      } catch {
        throw new Error("Couldn't reach that link. Check it opens in a browser, or paste the menu text instead.");
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        throw new Error(`That page returned an error (${res.status}). Try pasting the menu text instead.`);
      }

      const ctype = (res.headers.get('content-type') || '').toLowerCase();
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > MAX_BYTES) throw new Error('That page is too large to read.');

      if (ctype.includes('application/pdf')) {
        content = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buf.toString('base64') } },
          { type: 'text', text: 'Pull the menu items out of this PDF.' },
        ];
      } else {
        const plain = htmlToText(buf.toString('utf8'));
        if (plain.length < 40) {
          throw new Error(
            "That page had no readable text — menus built in JavaScript or saved as images can't be read from a link. Paste the text or upload the menu instead."
          );
        }
        content = [{ type: 'text', text: `Menu page from ${target.hostname}:\n\n${plain}` }];
      }

    } else {
      return NextResponse.json({ error: 'Add a link, paste your menu, or upload a file.' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Could not read that.' }, { status: 400 });
  }

  try {
    const response = await getAnthropic().messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: content as any }],
    });
    const raw = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
    const { items, reason } = parseItems(raw);

    if (!items.length) {
      return NextResponse.json({
        items: [],
        error:
          reason === 'not a menu'
            ? "That didn't look like a menu. Try linking straight to the menu page."
            : "Couldn't find any menu items there. Paste the menu text and I'll read that instead.",
      }, { status: 200 });
    }

    return NextResponse.json({ items, source, count: items.length });
  } catch (err: any) {
    const status = err?.status;
    console.error('[import-menu] model=' + AI_MODEL, status ?? '', err?.message ?? err);
    if (status === 404) {
      // the model id has been retired — set ANTHROPIC_MODEL in the environment
      return NextResponse.json({ error: 'Menu reading is misconfigured on our side. We have been alerted.' }, { status: 500 });
    }
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: 'Menu reading is unavailable right now. Paste your items in by hand for now.' }, { status: 503 });
    }
    if (status === 429) {
      return NextResponse.json({ error: 'Too many menu imports at once — wait a minute and try again.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Reading the menu failed — try again in a moment.' }, { status: 500 });
  }
}
