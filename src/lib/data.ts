import type { Transaction } from './types';

// Using a global variable to simulate a database in this example.
// In a real application, you would use a proper database.
if (!global.transactions) {
  global.transactions = [
    { id: '1', date: new Date(new Date().setDate(1)).toISOString(), description: 'Monthly Salary', amount: 5000, category: 'Salary', type: 'income' },
    { id: '2', date: new Date(new Date().setDate(1)).toISOString(), description: 'Apartment Rent', amount: 1500, category: 'Rent', type: 'expense' },
    { id: '3', date: new Date(new Date().setDate(3)).toISOString(), description: 'Grocery Shopping', amount: 250, category: 'Food', type: 'expense' },
    { id: '4', date: new Date(new Date().setDate(5)).toISOString(), description: 'Electricity Bill', amount: 80, category: 'Utilities', type: 'expense' },
    { id: '5', date: new Date(new Date().setDate(10)).toISOString(), description: 'Dinner with friends', amount: 120, category: 'Entertainment', type: 'expense' },
    { id: '6', date: new Date(new Date().setDate(12)).toISOString(), description: 'Gasoline for car', amount: 60, category: 'Transportation', type: 'expense' },
    { id: '7', date: new Date(new Date().setDate(15)).toISOString(), description: 'New headphones', amount: 200, category: 'Other', type: 'expense' },
    { id: '8', date: new Date(new Date().setDate(20)).toISOString(), description: 'Movie tickets', amount: 30, category: 'Entertainment', type: 'expense' },
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
