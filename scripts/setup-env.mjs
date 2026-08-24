/* Rewrites DATABASE_URL / DIRECT_URL / JWT_SECRET in .env from one Supabase
   pooler connection string. Never prints secrets — only a masked summary.

   Usage:
     node scripts/setup-env.mjs 'postgresql://postgres.REF:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres'
   (single quotes matter — passwords often contain $ ! & which zsh would eat) */

import fs from 'fs';
import crypto from 'crypto';

const input = process.argv[2];
if (!input) {
  console.error("Paste your Supabase connection string in single quotes:\n  node scripts/setup-env.mjs 'postgresql://postgres.REF:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres'");
  process.exit(1);
}

let u;
try { u = new URL(input.trim()); } catch { console.error('That is not a valid URL.'); process.exit(1); }
if (!/^postgres(ql)?:$/.test(u.protocol)) {
  console.error(`Scheme is "${u.protocol}" — it must be postgresql://. You probably pasted the wrong field.`);
  process.exit(1);
}
if (u.password === '' || /\[|\]|YOUR|PASSWORD/i.test(decodeURIComponent(u.password))) {
  console.error('The password is still a placeholder. Copy the real one from the Supabase Connect dialog.');
  process.exit(1);
}
if (!u.hostname.includes('pooler.supabase.com')) {
  console.warn(`Warning: host is ${u.hostname} — expected something.pooler.supabase.com. Continuing anyway.`);
}

const base = (port) => {
  const c = new URL(u.toString());
  c.port = String(port);
  c.search = '';
  return c.toString();
};

// Serverless (Vercel): app traffic goes through the transaction pooler on 6543;
// prisma db push / migrate must use the session pooler on 5432.
const DATABASE_URL = base(6543) + '?pgbouncer=true&connection_limit=1';
const DIRECT_URL = base(5432);

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
