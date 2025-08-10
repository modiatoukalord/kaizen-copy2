import type { Transaction } from './types';

// Using a global variable to simulate a database in this example.
// In a real application, you would use a proper database.
if (!global.transactions) {
  global.transactions = [
    { id: '1', date: new Date(new Date().setDate(1)).toISOString(), description: 'Salaire mensuel', amount: 3000000, category: 'Salaire', type: 'income', account: 'Banque' },
    { id: '2', date: new Date(new Date().setDate(1)).toISOString(), description: 'Loyer de l\'appartement', amount: 900000, category: 'Loyer', type: 'expense', account: 'Banque' },
    { id: '3', date: new Date(new Date().setDate(3)).toISOString(), description: 'Achats d\'épicerie', amount: 150000, category: 'Nourriture', type: 'expense', account: 'Mobile money' },
    { id: '4', date: new Date(new Date().setDate(5)).toISOString(), description: 'Facture d\'électricité', amount: 50000, category: 'Services publics', type: 'expense', account: 'Banque' },
    { id: '5', date: new Date(new Date().setDate(10)).toISOString(), description: 'Dîner entre amis', amount: 75000, category: 'Divertissement', type: 'expense', account: 'Espèces' },
    { id: '6', date: new Date(new Date().setDate(12)).toISOString(), description: 'Essence pour la voiture', amount: 35000, category: 'Transport', type: 'expense', account: 'Mobile money' },
    { id: '7', date: new Date(new Date().setDate(15)).toISOString(), description: 'Nouveaux écouteurs', amount: 120000, category: 'Autre', type: 'expense', account: 'Banque' },
    { id: '8', date: new Date(new Date().setDate(20)).toISOString(), description: 'Billets de cinéma', amount: 20000, category: 'Divertissement', type: 'expense', account: 'Espèces' },
    { id: '9', date: new Date(new Date().setDate(1)).toISOString(), description: 'Projet Freelance', amount: 600000, category: 'Salaire', type: 'income', account: 'Banque' },
    { id: '10', date: new Date(new Date().setDate(15)).toISOString(), description: 'Cadeau d\'anniversaire', amount: 60000, category: 'Don', type: 'income', account: 'Espèces' },
    { id: '11', date: new Date(new Date().setDate(18)).toISOString(), description: 'Aide sociale du gouvernement', amount: 100000, category: 'Aide sociale', type: 'expense', account: 'Banque' },
  ] as Transaction[];
}

export const getTransactions = async (): Promise<Transaction[]> => {
  return Promise.resolve(global.transactions);
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const newTransaction: Transaction = { id: crypto.randomUUID(), ...transaction };
  global.transactions.unshift(newTransaction);
  return Promise.resolve(newTransaction);
};

export const updateTransaction = async (transaction: Transaction) => {
    const index = global.transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
        global.transactions[index] = transaction;
        return Promise.resolve(transaction);
    }
    throw new Error('Transaction not found');
};
