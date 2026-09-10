import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* The iOS and Android apps load their own bundled pages, so every /api call
   they make is cross-origin. These are the only origins a Capacitor webview
   ever presents; anything else gets no CORS headers and is blocked by the
   browser as usual. */
const APP_ORIGINS = new Set([
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'https://localhost',
]);

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');
  const fromApp = origin !== null && APP_ORIGINS.has(origin);

  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    if (fromApp) applyCors(res, origin!);
    return res;
  }

  const res = NextResponse.next();
  if (fromApp) applyCors(res, origin!);
  return res;
}

function applyCors(res: NextResponse, origin: string) {
  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Vary', 'Origin');
}

export const config = { matcher: '/api/:path*' };
