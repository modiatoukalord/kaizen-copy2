import Dashboard from '@/components/dashboard';
import { getTransactions } from '@/lib/data';

export default async function Home() {
  const transactions = await getTransactions();
  return <Dashboard initialTransactions={transactions} showTransactions={true} />;
}
