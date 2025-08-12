'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { categorizeTransaction as categorizeTransactionFlow } from '@/ai/flows/categorize-transaction';
import { TransactionCategory, TransactionAccount, type CategorizeTransactionInput } from '@/lib/types';
import { addTransaction as dbAddTransaction, getTransactions, updateTransaction as dbUpdateTransaction, addTransfer as dbAddTransfer, updateTransfer as dbUpdateTransfer } from '@/lib/data';

const formSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  amount: z.coerce.number().min(0.01, 'Le montant doit être positif'),
  type: z.enum(['income', 'expense']),
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


export async function handleAddOrUpdateTransaction(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Erreur: Veuillez vérifier les champs du formulaire.',
    };
  }
  
  const { id, ...transactionData } = validatedFields.data;

  try {
    if (id) {
        await dbUpdateTransaction({ id, ...transactionData });
        revalidatePath('/');
        revalidatePath('/income');
        revalidatePath('/expenses');
        return { message: 'Transaction mise à jour avec succès.', errors: {}, success: true };
    } else {
        await dbAddTransaction(transactionData);
        revalidatePath('/');
        revalidatePath('/income');
        revalidatePath('/expenses');
        return { message: 'Transaction ajoutée avec succès.', errors: {}, success: true };
    }
  } catch (error) {
    return { message: 'Erreur de base de données: Échec de l\'enregistrement de la transaction.', errors: {}, success: false };
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
        await dbUpdateTransfer({ id, ...transferData });
        revalidatePath('/transfers');
        return { message: 'Virement mis à jour avec succès.', errors: {}, success: true };
    } else {
        await dbAddTransfer(transferData);
        revalidatePath('/transfers');
        return { message: 'Virement ajouté avec succès.', errors: {}, success: true };
    }
  } catch (error) {
    return { message: 'Erreur de base de données: Échec de l\'enregistrement du virement.', errors: {}, success: false };
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
