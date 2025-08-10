import { getTransactions } from '@/lib/data';
import IncomeExpenseChart from '@/components/dashboard/income-expense-chart';
import ParetoChart from '@/components/dashboard/pareto-chart';

export default async function ChartsPage() {
  const transactions = await getTransactions();
  
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-4">Graphiques</h1>
            <p className="text-muted-foreground">Visualisez vos données financières.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <IncomeExpenseChart transactions={transactions} />
            <ParetoChart transactions={transactions} />
        </div>
    </div>
  );
}
