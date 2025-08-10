import Dashboard from '@/components/dashboard';
import { getTransactions } from '@/lib/data';

export default async function ExpensesPage() {
  const transactions = await getTransactions();
  return <Dashboard 
            initialTransactions={transactions}
            title="Dépenses"
            filterType='expense'
        />;
}
