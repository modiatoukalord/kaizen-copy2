import Dashboard from '@/components/dashboard';
import { getTransactions } from '@/lib/data';

export default async function IncomePage() {
  const transactions = await getTransactions();
  return <Dashboard 
            initialTransactions={transactions} 
            title="Revenus"
            filterType='income'
            hideCharts={true}
        />;
}
