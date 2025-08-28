
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { categorizeTransaction as categorizeTransactionFlow } from '@/ai/flows/categorize-transaction';
import { TransactionCategory, TransactionAccount, type CategorizeTransactionInput, ExpenseParentCategory, AllExpenseSubCategories } from '@/lib/types';
import { addTransaction as dbAddTransaction, getTransactions, updateTransaction as dbUpdateTransaction, deleteTransaction as dbDeleteTransaction, addTransfer as dbAddTransfer, updateTransfer as dbUpdateTransfer, deleteTransfer as dbDeleteTransfer, getBudgetItems, saveBudgetItems, getCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getAccountBalance, getTransfers } from '@/lib/data';

const formSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  amount: z.coerce.number().min(0.01, 'Le montant doit être positif'),
  type: z.enum(['income', 'expense']),
  parentCategory: z.enum(ExpenseParentCategory).optional(),
  category: z.enum(TransactionCategory),
  account: z.enum(TransactionAccount),
  date: z.string().min(1, 'La date est requise'),
});

const transferFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  amount: z.coerce.number().min(0.01, 'Le montant doit être positif'),
  fromAccount: z.enum(TransactionAccount),
  toAccount: z.enum(TransactionAccount),
  date: z.string().min(1, 'La date est requise'),
}).refine(data => data.fromAccount !== data.toAccount, {
    message: "Les comptes de départ et d'arrivée doivent être différents.",
    path: ["toAccount"],
});

const budgetItemSchema = z.object({
  category: z.enum(AllExpenseSubCategories),
  planned: z.coerce.number().min(0),
});

const budgetFormSchema = z.object({
  year: z.coerce.number(),
  month: z.string(),
  items: z.array(budgetItemSchema),
});

const calendarEventSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  amount: z.coerce.number().min(0.01, 'Le montant est requis'),
  date: z.string().min(1, 'La date est requise'),
})


export async function handleAddOrUpdateTransaction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.type === 'income' || !rawData.parentCategory) {
    delete rawData.parentCategory;
  }
  
  const validatedFields = formSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Erreur: Veuillez vérifier les champs du formulaire.',
    };
  }
  
  const { id, ...transactionData } = validatedFields.data;

  // Check for negative cash balance
  if (transactionData.type === 'expense' && transactionData.account === 'Espèces') {
    const cashBalance = await getAccountBalance('Espèces');
    let originalAmount = 0;
    
    // If updating, find the original transaction amount to exclude from balance calculation
    if(id) {
        const transactions = await getTransactions();
        const originalTransaction = transactions.find(t => t.id === id);
        if (originalTransaction && originalTransaction.account === 'Espèces' && originalTransaction.type === 'expense') {
            originalAmount = originalTransaction.amount;
        }
    }

    if (cashBalance + originalAmount < transactionData.amount) {
      return { message: 'Opération refusée: Solde en espèces insuffisant.', errors: {}, success: false };
    }
  }

  try {
    if (id) {
        await dbUpdateTransaction({ id, ...transactionData, date: new Date(transactionData.date).toISOString() });
        revalidatePath('/');
        revalidatePath('/income');
        revalidatePath('/expenses');
        return { message: 'Transaction mise à jour avec succès.', errors: {}, success: true };
    } else {
        await dbAddTransaction({...transactionData, date: new Date(transactionData.date).toISOString()});
        revalidatePath('/');
        revalidatePath('/income');
        revalidatePath('/expenses');
        return { message: 'Transaction ajoutée avec succès.', errors: {}, success: true };
    }
  } catch (error) {
    console.error(error);
    return { message: 'Erreur de base de données: Échec de l\'enregistrement de la transaction.', errors: {}, success: false };
  }
}

export async function handleDeleteTransaction(id: string) {
    try {
        await dbDeleteTransaction(id);
        revalidatePath('/');
        revalidatePath('/income');
        revalidatePath('/expenses');
        return { message: 'Transaction supprimée avec succès.', success: true };
    } catch (error) {
        return { message: 'Erreur de base de données: Échec de la suppression de la transaction.', success: false };
    }
}


export async function handleAddOrUpdateTransfer(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = transferFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Erreur: Veuillez vérifier les champs du formulaire.',
    };
  }
  
  const { id, ...transferData } = validatedFields.data;

  // Check for negative cash balance
  if (transferData.fromAccount === 'Espèces') {
    const cashBalance = await getAccountBalance('Espèces');
     let originalAmount = 0;

    // If updating, find original amount to exclude from balance
    if (id) {
        const transfers = await getTransfers(); // This needs to exist, let's assume it does
        const originalTransfer = transfers.find(t => t.id === id);
        if(originalTransfer && originalTransfer.fromAccount === 'Espèces') {
            originalAmount = originalTransfer.amount;
        }
    }

    if (cashBalance + originalAmount < transferData.amount) {
        return { message: 'Virement refusé: Solde en espèces insuffisant.', errors: {}, success: false };
    }
  }


  try {
    if (id) {
        await dbUpdateTransfer({ id, ...transferData, date: new Date(transferData.date).toISOString() });
        revalidatePath('/transfers');
        return { message: 'Virement mis à jour avec succès.', errors: {}, success: true };
    } else {
        await dbAddTransfer({...transferData, date: new Date(transferData.date).toISOString()});
        revalidatePath('/transfers');
        return { message: 'Virement ajouté avec succès.', errors: {}, success: true };
    }
  } catch (error) {
    console.error(error);
    return { message: 'Erreur de base de données: Échec de l\'enregistrement du virement.', errors: {}, success: false };
  }
}

export async function handleDeleteTransfer(id: string) {
    try {
        await dbDeleteTransfer(id);
        revalidatePath('/');
        revalidatePath('/transfers');
        return { message: 'Virement supprimé avec succès.', success: true };
    } catch (error) {
        return { message: 'Erreur de base de données: Échec de la suppression du virement.', success: false };
    }
}


export async function suggestCategory(description: string, amount: number) {
  if (!description || !amount) return null;

  try {
    const userTransactionHistory = (await getTransactions())
      .slice(0, 10) 
      .map(t => ({ description: t.description, category: t.category }));

    const input: CategorizeTransactionInput = {
      transactionDescription: description,
      transactionAmount: amount,
      userTransactionHistory,
    };
    const result = await categorizeTransactionFlow(input);
    return result;
  } catch (error) {
    console.error('La catégorisation par IA a échoué:', error);
    return null;
  }
}

export async function fetchBudgetItems(year: number, month: string) {
    return getBudgetItems(year, month);
}

export async function handleSaveBudget(prevState: any, formData: FormData) {
    const rawData = {
        year: formData.get('year'),
        month: formData.get('month'),
        items: JSON.parse(formData.get('items') as string)
    }
    const validatedFields = budgetFormSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
        console.error(validatedFields.error);
        return {
            message: 'Données invalides.',
            success: false,
        };
    }
    
    try {
        // Strip the client-side-only 'id' before saving
        const itemsToSave = validatedFields.data.items.map(({ category, planned }) => ({ category, planned }));
        await saveBudgetItems(validatedFields.data.year, validatedFields.data.month, itemsToSave);
        revalidatePath('/planning');
        return { message: 'Budget enregistré avec succès.', success: true };
    } catch (error) {
        console.error(error);
        return { message: 'Erreur lors de l\'enregistrement du budget.', success: false };
    }
}

export async function fetchCalendarEvents() {
    return getCalendarEvents();
}

export async function handleAddOrUpdateCalendarEvent(prevState: any, formData: FormData) {
  const validatedFields = calendarEventSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Erreur: Veuillez vérifier les champs du formulaire.',
      success: false,
    };
  }

  const { id, ...eventData } = validatedFields.data;
  
  try {
    if (id) {
      await updateCalendarEvent({ ...eventData, id, date: new Date(eventData.date).toISOString() });
      revalidatePath('/planning');
      return { message: 'Événement mis à jour avec succès.', success: true, errors: {} };
    } else {
      await addCalendarEvent({ ...eventData, date: new Date(eventData.date).toISOString() });
      revalidatePath('/planning');
      return { message: 'Événement ajouté avec succès.', success: true, errors: {} };
    }
  } catch (error) {
    return { message: 'Erreur lors de l\'enregistrement de l\'événement.', success: false, errors: {} };
  }
}

export async function handleDeleteCalendarEvent(id: string) {
  try {
    await deleteCalendarEvent(id);
    revalidatePath('/planning');
    return { message: 'Événement supprimé avec succès.', success: true };
  } catch (error) {
    return { message: 'Erreur lors de la suppression de l\'événement.', success: false };
  }
}

interface AskAssistantPayload {
  message?: string;
  audioData?: string;
  mimeType?: string;
}

export async function askAssistant(payload: AskAssistantPayload): Promise<{ reply?: string, error?: string }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return { error: "L'URL du webhook n8n n'est pas configurée." };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erreur de webhook n8n: ${response.status} ${response.statusText}`, errorBody);
      return { error: `La requête au webhook a échoué avec le statut ${response.status}.` };
    }

    const data = await response.json();
    
    // The n8n workflow returns a 'reponse' field, not 'reply'
    const reply = data.reponse || "Désolé, je n'ai pas pu obtenir de réponse.";

    return { reply };
  } catch (error) {
    console.error("Erreur lors de la communication avec l'assistant n8n:", error);
    return { error: "Une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer." };
  }
}
