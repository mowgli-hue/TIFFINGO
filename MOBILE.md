# TiffinGo — iOS & Android

The apps are the same codebase as the website. `npm run mobile:build` exports
the customer screens as static files that ship **inside** the app binary;
only data crosses the network, to `https://tiffingo.app/api`.

That distinction matters: Apple rejects apps that are only a window onto a
website (App Store Guideline 4.2). This one carries its own UI.

## Build it

```bash
npm install                 # once
npm run mobile:build        # exports mobile-out/
npx cap add ios             # once
npx cap add android         # once
npm run mobile:assets       # icons + splash from resources/
npx cap sync
```

Then `npm run mobile:ios` (opens Xcode) or `npm run mobile:android`
(opens Android Studio). Both run `mobile:build` and `cap sync` first, so
that is the command to use after any code change.

## How the pieces fit

| Piece | Why |
|---|---|
| `scripts/build-mobile.mjs` | Moves `src/app/api`, `admin`, `dashboard`, `driver`, `no-access` aside (they need a server, and cannot be statically exported), builds, then puts them straight back — including if the build fails. |
| `src/lib/api-base.ts` | `apiFetch()` resolves every path against `NEXT_PUBLIC_API_BASE` and attaches the bearer token. Use it instead of `fetch` for anything under `/api`. |
| `src/middleware.ts` | CORS for the four origins a Capacitor webview can present. Nothing else gets the headers. |
| `src/components/NativeShell.tsx` | Status bar, splash hide, Android hardware back, haptics. Every plugin is lazily imported and guarded, so the same bundle still runs in a browser. |
| `resources/` | Source art. `icon.png` must stay 1024×1024 **without** alpha — the App Store rejects RGBA icons. |

## Authentication, and why it is not just a cookie

The website authenticates with an http-only cookie. The apps cannot: their
pages are served from `capacitor://localhost`, so the cookie is cross-site and
the webview will not attach it. Login would look like it worked and every
screen would come back empty.

`/api/auth` therefore also returns the signed token in the response body. The
app stores it and sends it as `Authorization: Bearer …`; `getAuthUser()`
accepts either. Same secret, same verification — and the web session keeps its
`SameSite=Lax` cookie untouched.

## A warning about `git status` mid-build

`mobile:build` moves `src/app/api`, `admin`, `dashboard`, `driver` and
`no-access` into `.mobile-stash` for the length of the build, then puts them
back. Run `git status` during those ~40 seconds and it reports all of them as
deleted. They are not — wait for the build to finish and check again.

If a build is ever killed part-way (Ctrl-C, a crash), the script's exit handler
still restores them. If that ever fails it says so loudly and names the
directory; `.mobile-stash` is where to look.

## Before submitting

- [ ] `NEXT_PUBLIC_API_BASE` points at production (defaults to `https://tiffingo.app`)
- [ ] Demo account for App Review — Guideline 2.1 requires working credentials
- [ ] Screenshots: 6.7" and 6.5" iPhone, plus 7" and 10" tablet for Play
- [ ] Play Data Safety form — see `/legal/privacy` for what is actually collected
- [ ] Account deletion is reachable: Profile → Delete my account (5.1.1(v))

**Payments:** food is a physical good consumed outside the app, so Apple's
in-app purchase requirement does not apply and Stripe is correct here. If a
reviewer questions it, cite Guideline 3.1.3(e).
