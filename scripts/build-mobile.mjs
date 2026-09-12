#!/usr/bin/env node
/* Builds the static bundle that ships inside the iOS and Android apps.

   Apple rejects apps that are only a window onto a website (Guideline 4.2),
   so the app carries its own UI. Only data crosses the network, to
   NEXT_PUBLIC_API_BASE.

   Server-only routes cannot be statically exported, so they are moved aside
   for the duration of the build and put straight back — including if the
   build fails. Nothing is ever deleted. */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'mobile-out');
const STASH = path.join(ROOT, '.mobile-stash');

/* Not in the customer app: the API itself, and the staff screens behind
   server-side role guards. */
const SERVER_ONLY = [
  'src/app/api',
  'src/app/admin',
  'src/app/dashboard',
  'src/app/driver',
  'src/app/no-access',
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://tiffingo.app';

function stash() {
  fs.mkdirSync(STASH, { recursive: true });
  for (const rel of SERVER_ONLY) {
    const from = path.join(ROOT, rel);
    if (!fs.existsSync(from)) continue;
    const to = path.join(STASH, rel.replace(/\//g, '__'));
    fs.renameSync(from, to);
  }
}

function unstash() {
  if (!fs.existsSync(STASH)) return;
  for (const rel of SERVER_ONLY) {
    const from = path.join(STASH, rel.replace(/\//g, '__'));
    if (!fs.existsSync(from)) continue;
    const to = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
  }
  fs.rmSync(STASH, { recursive: true, force: true });
}

/* The marketing landing is the website's front door. The app's front door is
   the customer home, so the bundle's entry point redirects there. */
function writeEntry() {
  fs.writeFileSync(
    path.join(OUT, 'index.html'),
    `<!doctype html><html><head><meta charset="utf-8">
<title>TiffinGo</title>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>html,body{margin:0;height:100%;background:#043F28}</style>
<script>
/* Point at the file, not the directory: directory-index resolution differs
   between the iOS and Android local servers, and a miss here shows as an
   app stuck on the splash with no error anywhere. */
location.replace('./home/index.html');
</script>
</head><body></body></html>`
  );
}

process.on('exit', unstash);
process.on('SIGINT', () => { unstash(); process.exit(1); });

try {
  console.log('→ moving server-only routes aside');
  stash();

  fs.rmSync(OUT, { recursive: true, force: true });

  console.log(`→ next build (static export, API at ${API_BASE})`);
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, MOBILE_BUILD: '1', NEXT_PUBLIC_API_BASE: API_BASE },
  });

} finally {
  unstash();
}

/* With a custom distDir the export lands there; without one it lands in out/. */
const candidates = [path.join(ROOT, '.next-mobile'), path.join(ROOT, 'out')];
const exported = candidates.find((d) => fs.existsSync(path.join(d, 'index.html')));
if (!exported) {
  console.error('✗ no exported HTML found — the static export did not run');
  process.exit(1);
}
fs.cpSync(exported, OUT, { recursive: true });
fs.rmSync(exported, { recursive: true, force: true });
writeEntry();

const pages = fs.readdirSync(OUT).filter((f) => !f.startsWith('_') && !f.includes('.'));
console.log(`✓ mobile-out ready — ${pages.length} screens: ${pages.join(', ')}`);
console.log('  next:  npx cap sync');
