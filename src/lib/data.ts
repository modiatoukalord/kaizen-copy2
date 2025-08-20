
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Transaction, Transfer } from './types';

// In a real application, you would use a proper database.

export const getTransactions = async (): Promise<Transaction[]> => {
  const transactionsCol = collection(db, 'transactions');
  const q = query(transactionsCol, orderBy('date', 'desc'));
  const transactionSnapshot = await getDocs(q);
  const transactionList = transactionSnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
        id: doc.id, 
        ...data,
        // Convert Firestore Timestamp to ISO string
        date: (data.date as Timestamp).toDate().toISOString(),
    } as Transaction;
  });
  return transactionList;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const transactionsCol = collection(db, 'transactions');
  // Convert date string back to Firestore Timestamp
  const docRef = await addDoc(transactionsCol, {
    ...transaction,
    date: new Date(transaction.date)
  });
  const newTransaction = { id: docRef.id, ...transaction };
  return newTransaction;
};

export const updateTransaction = async (transaction: Transaction) => {
    const transactionDoc = doc(db, 'transactions', transaction.id);
    const { id, ...transactionData } = transaction;
    await updateDoc(transactionDoc, {
        ...transactionData,
        date: new Date(transactionData.date)
    });
    return transaction;
};

export const deleteTransaction = async (id: string) => {
    const transactionDoc = doc(db, 'transactions', id);
    await deleteDoc(transactionDoc);
}

export const getTransfers = async (): Promise<Transfer[]> => {
    const transfersCol = collection(db, 'transfers');
    const q = query(transfersCol, orderBy('date', 'desc'));
    const transferSnapshot = await getDocs(q);
    const transferList = transferSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate().toISOString(),
        } as Transfer;
    });
    return transferList;
};

export const addTransfer = async (transfer: Omit<Transfer, 'id'>) => {
    const transfersCol = collection(db, 'transfers');
    const docRef = await addDoc(transfersCol, {
        ...transfer,
        date: new Date(transfer.date)
    });
    return { id: docRef.id, ...transfer };
};

export const updateTransfer = async (transfer: Transfer) => {
    const transferDoc = doc(db, 'transfers', transfer.id);
    const { id, ...transferData } = transfer;
    await updateDoc(transferDoc, {
        ...transferData,
        date: new Date(transferData.date)
    });
    return transfer;
};

export const deleteTransfer = async (id: string) => {
    const transferDoc = doc(db, 'transfers', id);
    await deleteDoc(transferDoc);
}
