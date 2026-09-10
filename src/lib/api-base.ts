/* On the website the app and the API share an origin, so "/api/..." works and
   the session rides in an http-only cookie.

   Inside the native shell the page is served from capacitor:// or file://.
   "/api/..." would resolve to the app bundle, and the cookie is cross-site so
   the webview will not attach it. Native builds therefore get an absolute API
   origin baked in and carry the same signed token as a bearer header. */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') ?? '';

export const isNative =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:');

const TOKEN_KEY = 'tiffingo_token';

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode, cleared storage — the web cookie still works */
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function apiUrl(path: string): string {
  return path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
}

export function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  return fetch(apiUrl(input), { credentials: 'include', ...init, headers });
}
