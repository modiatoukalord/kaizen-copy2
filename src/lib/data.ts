import type { Transaction } from './types';

// Using a global variable to simulate a database in this example.
// In a real application, you would use a proper database.
if (!global.transactions) {
  global.transactions = [
    { id: '1', date: new Date(new Date().setDate(1)).toISOString(), description: 'Monthly Salary', amount: 3000000, category: 'Salaire', type: 'income', account: 'Banque' },
    { id: '2', date: new Date(new Date().setDate(1)).toISOString(), description: 'Apartment Rent', amount: 900000, category: 'Rent', type: 'expense', account: 'Banque' },
    { id: '3', date: new Date(new Date().setDate(3)).toISOString(), description: 'Grocery Shopping', amount: 150000, category: 'Food', type: 'expense', account: 'Mobile money' },
    { id: '4', date: new Date(new Date().setDate(5)).toISOString(), description: 'Electricity Bill', amount: 50000, category: 'Utilities', type: 'expense', account: 'Banque' },
    { id: '5', date: new Date(new Date().setDate(10)).toISOString(), description: 'Dinner with friends', amount: 75000, category: 'Entertainment', type: 'expense', account: 'Espèces' },
    { id: '6', date: new Date(new Date().setDate(12)).toISOString(), description: 'Gasoline for car', amount: 35000, category: 'Transportation', type: 'expense', account: 'Mobile money' },
    { id: '7', date: new Date(new Date().setDate(15)).toISOString(), description: 'New headphones', amount: 120000, category: 'Other', type: 'expense', account: 'Banque' },
    { id: '8', date: new Date(new Date().setDate(20)).toISOString(), description: 'Movie tickets', amount: 20000, category: 'Entertainment', type: 'expense', account: 'Espèces' },
    { id: '9', date: new Date(new Date().setDate(1)).toISOString(), description: 'Freelance Project', amount: 600000, category: 'Salaire', type: 'income', account: 'Banque' },
    { id: '10', date: new Date(new Date().setDate(15)).toISOString(), description: 'Birthday Gift', amount: 60000, category: 'Don', type: 'income', account: 'Espèces' },
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