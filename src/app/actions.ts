'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { categorizeTransaction as categorizeTransactionFlow } from '@/ai/flows/categorize-transaction';
import { TransactionCategory, type CategorizeTransactionInput } from '@/lib/types';
import { addTransaction as dbAddTransaction, getTransactions } from '@/lib/data';

const formSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.enum(TransactionCategory),
  date: z.string().min(1, 'Date is required'),
});

export async function handleAddTransaction(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
    };
  }

  try {
    await dbAddTransaction(validatedFields.data);
    revalidatePath('/');
    return { message: 'Transaction added successfully.', errors: {}, success: true };
  } catch (error) {
    return { message: 'Database error: Failed to add transaction.', errors: {}, success: false };
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
    console.error('AI categorization failed:', error);
    return null;
  }
}
