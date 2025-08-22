
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
    
    const totalCredit = transactions
        .filter(t => t.category === 'Crédit' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRemboursement = transactions
        .filter(t => t.category === 'Remboursement' && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const creditRestant = totalCredit - totalRemboursement;

    const totalCreance = transactions
        .filter(t => t.category === 'Créance' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPret = transactions
        .filter(t => t.category === 'Prêt' && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const pretNet = totalCreance - totalPret;


    if (filterType === 'income') {
        const gainPropre = income - totalCredit;
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Revenu total" value={income} icon={ArrowUpRight} tooltipText="Total de tous les revenus enregistrés pour la période." />
                <StatCard title="Total crédit" value={totalCredit} icon={ArrowLeftRight} tooltipText="Total des montants reçus en tant que crédit." />
                <StatCard title="Gain propre" value={gainPropre} icon={DollarSign} tooltipText="Revenu total moins les crédits reçus (Revenu - Crédit)." />
            </div>
        );
    }

    if (filterType === 'expense') {
        const totalInvestissement = transactions
            .filter(t => t.category === 'Investissement' && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total des dépenses" value={expenses} icon={ArrowDownLeft} tooltipText="Total de toutes les dépenses enregistrées pour la période."/>
                <StatCard title="Total investissement" value={totalInvestissement} icon={TrendingUp} tooltipText="Total des montants dépensés en investissements." />
                <StatCard title="Total remboursement" value={totalRemboursement} icon={CircleArrowLeft} tooltipText="Total des montants que vous avez remboursés." />
            </div>
        );
    }
    
    const accountBalances = TransactionAccount.reduce((acc, account) => {
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
            
        acc[account] = incomeForAccount - expenseForAccount + transfersIn - transfersOut;
        return acc;
    }, {} as Record<string, number>);
    
    const accountIcons = {
        'Banque': Landmark,
        'Mobile money': Smartphone,
        'Espèces': Wallet
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Solde net" value={balance} icon={DollarSign} tooltipText="Différence entre vos revenus et vos dépenses (Revenus - Dépenses)." />
             {Object.entries(accountBalances).map(([account, balance]) => (
                <StatCard key={account} title={`Solde ${account}`} value={balance} icon={accountIcons[account as keyof typeof accountIcons]} tooltipText={`Solde actuel pour le compte ${account}.`}/>
            ))}
            <StatCard title="Crédits restants" value={creditRestant} icon={ArrowLeftRight} tooltipText="Montant total des crédits que vous devez encore rembourser (Crédit - Remboursement)." />
            <StatCard title="Prêts nets" value={pretNet} icon={TrendingUp} tooltipText="Montant net que d'autres vous doivent (Créances - Prêts)." />
        </div>
    );
}
