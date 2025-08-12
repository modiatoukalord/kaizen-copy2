
import { ArrowDownLeft, ArrowUpRight, DollarSign, ArrowLeftRight, TrendingUp, CircleArrowLeft, Landmark, Smartphone, Wallet } from 'lucide-react';
import type { Transaction, Transfer } from '@/lib/types';
import StatCard from './stat-card';
import { TransactionAccount } from '@/lib/types';

interface StatCardsProps {
  transactions: Transaction[];
  transfers: Transfer[];
  filterType?: 'income' | 'expense';
}

export default function StatCards({ transactions, transfers, filterType }: StatCardsProps) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    
    const totalDette = transactions
        .filter(t => t.category === 'Dette' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRemboursement = transactions
        .filter(t => t.category === 'Remboursement' && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const detteRestante = totalDette - totalRemboursement;

    const totalCreance = transactions
        .filter(t => t.category === 'Créance' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPret = transactions
        .filter(t => t.category === 'Prêt' && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const pretNet = totalCreance - totalPret;


    if (filterType === 'income') {
        const gainPropre = income - totalDette;
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Revenu total" value={income} icon={ArrowUpRight} />
                <StatCard title="Total dette" value={totalDette} icon={ArrowLeftRight} />
                <StatCard title="Gain propre" value={gainPropre} icon={DollarSign} />
            </div>
        );
    }

    if (filterType === 'expense') {
        const totalInvestissement = transactions
            .filter(t => t.category === 'Investissement' && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total des dépenses" value={expenses} icon={ArrowDownLeft} />
                <StatCard title="Total investissement" value={totalInvestissement} icon={TrendingUp} />
                <StatCard title="Total remboursement" value={totalRemboursement} icon={CircleArrowLeft} />
            </div>
        );
    }
    
    const accountBalances = TransactionAccount.map(account => {
        const incomeForAccount = transactions
            .filter(t => t.type === 'income' && t.account === account)
            .reduce((sum, t) => sum + t.amount, 0);
        const expenseForAccount = transactions
            .filter(t => t.type === 'expense' && t.account === account)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const transfersIn = transfers
            .filter(t => t.toAccount === account)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const transfersOut = transfers
            .filter(t => t.fromAccount === account)
            .reduce((sum, t) => sum + t.amount, 0);
            
        return {
            account,
            balance: incomeForAccount - expenseForAccount + transfersIn - transfersOut,
        };
    });
    
    const accountIcons = {
        'Banque': Landmark,
        'Mobile money': Smartphone,
        'Espèces': Wallet
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard title="Solde net" value={balance} icon={DollarSign} />
            {accountBalances.map(item => (
                <StatCard key={item.account} title={`Solde ${item.account}`} value={item.balance} icon={accountIcons[item.account]} />
            ))}
            <StatCard title="Dettes restantes" value={detteRestante} icon={ArrowLeftRight} />
            <StatCard title="Prêts nets" value={pretNet} icon={TrendingUp} />
        </div>
    );
}
