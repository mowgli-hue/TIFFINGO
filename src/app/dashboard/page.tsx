import { requireRole } from '@/lib/roles';
import DashboardClient from './DashboardClient';

/* Staff area. The role check runs on the server before anything renders. */
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireRole(['MERCHANT', 'ADMIN'], '/dashboard');
  return <DashboardClient />;
}
