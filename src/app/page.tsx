import Dashboard from '@/components/dashboard';
import { getTransactions, getTransfers } from '@/lib/data';

export default async function Home() {
  const transactions = await getTransactions();
  const transfers = await getTransfers();
  return <Dashboard initialTransactions={transactions} initialTransfers={transfers} />;
}
