
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where, writeBatch, limit } from 'firebase/firestore';
import type { Transaction, Transfer, BudgetItem, CalendarEvent, FirestoreUser, Account } from './types';


// --- User Data ---

export const getUserByUsername = async (username: string | null): Promise<(FirestoreUser & { id: string }) | null> => {
    const usersCol = collection(db, 'users');
    let q;
    if (username) {
        q = query(usersCol, where('username', '==', username), limit(1));
    } else {
        // If username is null, just check if any user exists
        q = query(usersCol, limit(1));
    }
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
        return null;
    }
    const userDoc = userSnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as FirestoreUser & { id: string };
};

export const createUser = async (username: string, pinHash: string): Promise<string> => {
    const usersCol = collection(db, 'users');
    const docRef = await addDoc(usersCol, { username, pinHash });
    return docRef.id;
};

export const updateUserByUsername = async (username: string, data: Partial<FirestoreUser>): Promise<void> => {
    const user = await getUserByUsername(username);
    if (!user) {
        throw new Error("Utilisateur non trouvé pour la mise à jour.");
    }
    const userDoc = doc(db, 'users', user.id);
    await updateDoc(userDoc, data);
};


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


// --- Planning Page Data ---

export const getBudgetItems = async (year: number, month: string): Promise<BudgetItem[]> => {
    const budgetCol = collection(db, 'budgets');
    const q = query(budgetCol, where('year', '==', year), where('month', '==', month));
    const budgetSnapshot = await getDocs(q);
    if (budgetSnapshot.empty) {
        return [];
    }
    // Assuming one budget doc per month/year
    const budgetDoc = budgetSnapshot.docs[0];
    return (budgetDoc.data().items as BudgetItem[]).map(item => ({...item, id: item.id || crypto.randomUUID()}));
};

export const saveBudgetItems = async (year: number, month: string, items: BudgetItem[]) => {
    const budgetCol = collection(db, 'budgets');
    const q = query(budgetCol, where('year', '==', year), where('month', '==', month));
    const budgetSnapshot = await getDocs(q);

    const dataToSave = {
        year,
        month,
        items: items.map(({ id, ...rest }) => rest), // Don't save randomUUID to firestore
    };

    if (budgetSnapshot.empty) {
        await addDoc(budgetCol, dataToSave);
    } else {
        const docId = budgetSnapshot.docs[0].id;
        const budgetDoc = doc(db, 'budgets', docId);
        await updateDoc(budgetDoc, dataToSave);
    }
};

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    const eventsCol = collection(db, 'calendarEvents');
    const q = query(eventsCol, orderBy('date', 'desc'));
    const eventsSnapshot = await getDocs(q);
    return eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate().toISOString(),
        } as CalendarEvent;
    });
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    const eventsCol = collection(db, 'calendarEvents');
    await addDoc(eventsCol, {
        ...event,
        date: new Date(event.date),
    });
};

export const deleteCalendarEvent = async (id: string) => {
    const eventDoc = doc(db, 'calendarEvents', id);
    await deleteDoc(eventDoc);
};

// --- Balance Calculation ---

export const getAccountBalance = async (account: Account): Promise<number> => {
    const [transactions, transfers] = await Promise.all([getTransactions(), getTransfers()]);

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

    return incomeForAccount - expenseForAccount + transfersIn - transfersOut;
};
