import { requireRole } from '@/lib/roles';
import AdminClient from './AdminClient';

/* Staff area. The role check runs on the server before anything renders. */
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireRole(['ADMIN'], '/admin');
  return <AdminClient />;
}
