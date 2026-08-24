import { requireRole } from '@/lib/roles';
import DriverClient from './DriverClient';

/* Staff area. The role check runs on the server before anything renders. */
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireRole(['DRIVER', 'ADMIN'], '/driver');
  return <DriverClient />;
}
