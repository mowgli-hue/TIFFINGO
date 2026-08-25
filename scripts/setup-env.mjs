/* Writes DATABASE_URL / DIRECT_URL / JWT_SECRET into .env.
   Never prints secrets — only a masked summary.

   Two ways to call it:
     node scripts/setup-env.mjs 'your-database-password'
     node scripts/setup-env.mjs 'postgresql://postgres.REF:PASS@HOST:5432/postgres'

   Single quotes matter — Supabase passwords often contain $ ! & and zsh
   would otherwise eat them. */

import fs from 'fs';
import crypto from 'crypto';

/* From the project's Connect dialog. Not secret — the password is. */
const PROJECT_REF = 'pxtkdzplydetuyffldxm';
const POOLER_HOST = 'aws-1-us-east-2.pooler.supabase.com';

const arg = process.argv[2];
if (!arg) {
  console.error("Pass your Supabase database password in single quotes:\n  node scripts/setup-env.mjs 'your-database-password'");
  process.exit(1);
}

let user, pass, host;

if (/^postgres(ql)?:\/\//.test(arg.trim())) {
  let u;
  try { u = new URL(arg.trim()); } catch { console.error('That URL will not parse.'); process.exit(1); }
  user = u.username; pass = decodeURIComponent(u.password); host = u.hostname;
} else {
  user = `postgres.${PROJECT_REF}`; pass = arg; host = POOLER_HOST;
}

if (!pass || /^\[|\]$|YOUR-PASSWORD/i.test(pass)) {
  console.error('That is still the [YOUR-PASSWORD] placeholder.\nSupabase never shows the real one — reset it under Project Settings → Database → Reset database password, then run this again with the new value.');
  process.exit(1);
}

const enc = encodeURIComponent(pass);
// Serverless (Vercel): app traffic goes through the transaction pooler on 6543;
// prisma db push / migrate must use the session pooler on 5432.
const DATABASE_URL = `postgresql://${user}:${enc}@${host}:6543/postgres?pgbouncer=true&connection_limit=1`;
const DIRECT_URL = `postgresql://${user}:${enc}@${host}:5432/postgres`;

const path = '.env';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const set = (key, value) => {
  const i = lines.findIndex((l) => l.trim().startsWith(key + '='));
  const line = `${key}="${value}"`;
  if (i >= 0) lines[i] = line; else lines.push(line);
};

set('DATABASE_URL', DATABASE_URL);
set('DIRECT_URL', DIRECT_URL);

const jwtLine = lines.find((l) => l.trim().startsWith('JWT_SECRET='));
const jwtVal = jwtLine ? jwtLine.slice(jwtLine.indexOf('=') + 1).replace(/^"|"$/g, '') : '';
let jwtNote = 'left as it was';
if (!jwtVal || jwtVal === '[REDACTED]' || jwtVal.length < 32) {
  set('JWT_SECRET', crypto.randomBytes(32).toString('hex'));
  jwtNote = 'generated a fresh 64-char local secret (local dev only — production uses the one in Vercel)';
}

fs.writeFileSync(path, lines.join('\n'));

const mask = (s) => { const c = new URL(s); return `${c.protocol}//${c.username}:****@${c.hostname}:${c.port}${c.pathname}${c.search}`; };
console.log('.env updated:');
console.log('  DATABASE_URL =', mask(DATABASE_URL));
console.log('  DIRECT_URL   =', mask(DIRECT_URL));
console.log('  JWT_SECRET   =', jwtNote);
console.log('\nNext:  npx prisma db push');
