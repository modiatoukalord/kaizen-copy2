import TransfersDashboard from '@/components/dashboard/transfers-dashboard';
import { getTransfers } from '@/lib/data';

export default async function TransfersPage() {
  const transfers = await getTransfers();
  return <TransfersDashboard initialTransfers={transfers} />;
}
