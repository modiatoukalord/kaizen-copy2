import type { Transaction, Transfer } from './types';

// Using a global variable to simulate a database in this example.
// In a real application, you would use a proper database.
if (!global.transactions) {
  global.transactions = [
    { id: '1', date: new Date(new Date().setDate(1)).toISOString(), description: 'Salaire mensuel', amount: 3000000, category: 'Salaire', type: 'income', account: 'Banque', scope: 'Personnel' },
    { id: '2', date: new Date(new Date().setDate(1)).toISOString(), description: 'Loyer de l\'appartement', amount: 900000, category: 'Autre', parentCategory: 'Personnel', type: 'expense', account: 'Banque', scope: 'Personnel' },
    { id: '3', date: new Date(new Date().setDate(3)).toISOString(), description: 'Achats d\'épicerie', amount: 150000, category: 'Nourriture', parentCategory: 'Personnel', type: 'expense', account: 'Mobile money', scope: 'Personnel' },
    { id: '4', date: new Date(new Date().setDate(5)).toISOString(), description: 'Facture d\'électricité', amount: 50000, category: 'Factures', parentCategory: 'Maison', type: 'expense', account: 'Banque', scope: 'Personnel' },
    { id: '5', date: new Date(new Date().setDate(10)).toISOString(), description: 'Dîner entre amis', amount: 75000, category: 'Divertissement', parentCategory: 'Personnel', type: 'expense', account: 'Espèces', scope: 'Personnel' },
    { id: '6', date: new Date(new Date().setDate(12)).toISOString(), description: 'Essence pour la voiture', amount: 35000, category: 'Transport', parentCategory: 'Transport', type: 'expense', account: 'Mobile money', scope: 'Personnel' },
    { id: '7', date: new Date(new Date().setDate(15)).toISOString(), description: 'Nouveaux écouteurs', amount: 120000, category: 'Autre', parentCategory: 'Personnel', type: 'expense', account: 'Banque', scope: 'Personnel' },
    { id: '8', date: new Date(new Date().setDate(20)).toISOString(), description: 'Billets de cinéma', amount: 20000, category: 'Divertissement', parentCategory: 'Personnel', type: 'expense', account: 'Espèces', scope: 'Personnel' },
    { id: '9', date: new Date(new Date().setDate(1)).toISOString(), description: 'Projet Freelance', amount: 600000, category: 'Salaire', type: 'income', account: 'Banque', scope: 'Entreprise' },
    { id: '10', date: new Date(new Date().setDate(15)).toISOString(), description: 'Cadeau d\'anniversaire', amount: 60000, category: 'Don', type: 'income', account: 'Espèces', scope: 'Personnel' },
    { id: '11', date: new Date(new Date().setDate(18)).toISOString(), description: 'Aide sociale du gouvernement', amount: 100000, category: 'Aide sociale', parentCategory: 'Personnel', type: 'expense', account: 'Banque', scope: 'Personnel' },
  ] as Transaction[];
}

if (!global.transfers) {
    global.transfers = [
        { id: 't1', date: new Date(new Date().setDate(2)).toISOString(), description: 'Transfert pour les courses', amount: 50000, fromAccount: 'Banque', toAccount: 'Espèces' },
        { id: 't2', date: new Date(new Date().setDate(16)).toISOString(), description: 'Paiement mobile', amount: 25000, fromAccount: 'Banque', toAccount: 'Mobile money' },
    ] as Transfer[];
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

export const deleteTransaction = async (id: string) => {
    const index = global.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        global.transactions.splice(index, 1);
        return Promise.resolve();
    }
    throw new Error('Transaction not found');
}

export const getTransfers = async (): Promise<Transfer[]> => {
    return Promise.resolve(global.transfers);
};

export const addTransfer = async (transfer: Omit<Transfer, 'id'>) => {
    const newTransfer: Transfer = { id: crypto.randomUUID(), ...transfer };
    global.transfers.unshift(newTransfer);
    return Promise.resolve(newTransfer);
};

export const updateTransfer = async (transfer: Transfer) => {
    const index = global.transfers.findIndex(t => t.id === transfer.id);
    if (index !== -1) {
        global.transfers[index] = transfer;
        return Promise.resolve(transfer);
    }
    throw new Error('Transfer not found');
};

export const deleteTransfer = async (id: string) => {
    const index = global.transfers.findIndex(t => t.id === id);
    if (index !== -1) {
        global.transfers.splice(index, 1);
        return Promise.resolve();
    }
    throw new Error('Transfer not found');
}
