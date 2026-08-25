/* Proves the schema actually landed in the database and shows what is in it.
   Run: node --env-file=.env scripts/dbcheck.mjs   */
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
try {
  const [users, kitchens, open, owned] = await Promise.all([
    p.user.count(),
    p.kitchen.count(),
    p.kitchen.count({ where: { isOpen: true } }),
    p.kitchen.count({ where: { NOT: { ownerId: null } } }),
  ]);
  const roles = await p.user.groupBy({ by: ['role'], _count: { role: true } });

  console.log('schema  : User.role and Kitchen.ownerId both queryable — db push landed');
  console.log('users   :', users, '(' + roles.map((r) => `${r.role}=${r._count.role}`).join(', ') + ')');
  console.log('kitchens:', kitchens, '| open/approved:', open, '| with an owner:', owned);
  if (kitchens > 0 && open === 0) {
    console.log('\nnote: every kitchen is isOpen:false, so /explore will show an empty list');
    console.log('      until one is approved.');
  }
} catch (e) {
  console.log('FAILED:', e.code || e.name, '-', String(e.message).split('\n').find((l) => l.trim()));
} finally {
  await p.$disconnect();
}
