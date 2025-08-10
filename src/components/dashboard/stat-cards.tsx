import { ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import StatCard from './stat-card';

interface StatCardsProps {
  transactions: Transaction[];
}

export default function StatCards({ transactions }: StatCardsProps) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Income" value={income} icon={ArrowUpRight} />
            <StatCard title="Total Expenses" value={expenses} icon={ArrowDownLeft} />
            <StatCard title="Net Balance" value={balance} icon={DollarSign} />
        </div>
    );
}
