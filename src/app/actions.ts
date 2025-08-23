
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { categorizeTransaction as categorizeTransactionFlow } from '@/ai/flows/categorize-transaction';
import { TransactionCategory, TransactionAccount, type CategorizeTransactionInput, ExpenseParentCategory, AllExpenseSubCategories } from '@/lib/types';
import { addTransaction as dbAddTransaction, getTransactions, updateTransaction as dbUpdateTransaction, deleteTransaction as dbDeleteTransaction, addTransfer as dbAddTransfer, updateTransfer as dbUpdateTransfer, deleteTransfer as dbDeleteTransfer, getBudgetItems, saveBudgetItems, getCalendarEvents, addCalendarEvent, deleteCalendarEvent } from '@/lib/data';

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
  id: z.string(),
  category: z.enum(AllExpenseSubCategories),
  planned: z.coerce.number().min(0),
});

const budgetFormSchema = z.object({
  year: z.coerce.number(),
  month: z.string(),
  items: z.array(budgetItemSchema),
});

const calendarEventSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  amount: z.coerce.number().min(0.01, 'Le montant est requis'),
  date: z.string().min(1, 'La date est requise'),
})


export async function handleAddOrUpdateTransaction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // Handle empty optional fields
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
  const validatedFields = transferFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Erreur: Veuillez vérifier les champs du formulaire.',
    };
  }
  
  const { id, ...transferData } = validatedFields.data;

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
      .slice(0, 10) // Use recent history
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
        await saveBudgetItems(validatedFields.data.year, validatedFields.data.month, validatedFields.data.items);
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

export async function handleAddCalendarEvent(prevState: any, formData: FormData) {
  const validatedFields = calendarEventSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Erreur: Veuillez vérifier les champs du formulaire.',
      success: false,
    };
  }

  try {
    await addCalendarEvent({ ...validatedFields.data, date: new Date(validatedFields.data.date).toISOString() });
    revalidatePath('/planning');
    return { message: 'Événement ajouté avec succès.', success: true, errors: {} };
  } catch (error) {
    return { message: 'Erreur lors de l\'ajout de l\'événement.', success: false, errors: {} };
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

export async function askAssistant(message: string): Promise<{ reply: string }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("L'URL du webhook n8n n'est pas configurée.");
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erreur de webhook n8n: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`La requête au webhook a échoué avec le statut ${response.status}.`);
    }

    const data = await response.json();
    
    // The n8n agent returns a JSON object, we need to extract the text response.
    const reply = data.text || "Désolé, je n'ai pas pu obtenir de réponse.";

    return { reply };
  } catch (error) {
    console.error("Erreur lors de la communication avec l'assistant n8n:", error);
    throw new Error("Une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer.");
  }
}
