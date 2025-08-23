
import Dashboard from '@/components/dashboard';
import { getTransactions } from '@/lib/data';
import SubNavigation from '@/components/dashboard/sub-navigation';

export default async function ExpensesPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <SubNavigation />
      <div className="flex flex-col gap-4">
          <Dashboard 
              initialTransactions={transactions} 
              title="Dépenses"
              filterType='expense'
              hideCharts={false}
          />
      </div>
    </div>
  )
}
