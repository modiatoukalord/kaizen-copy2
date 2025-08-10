import type { z } from 'zod';
import type { categorizeTransaction } from '@/ai/flows/categorize-transaction';

export const TransactionCategory = [
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Rent',
  'Salary',
  'Other',
] as const;

export type Category = (typeof TransactionCategory)[number];

export type Transaction = {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  category: Category;
  type: 'income' | 'expense';
};

export type Period = 'weekly' | 'monthly' | 'quarterly' | 'annually';

export type CategorizeResult = Awaited<ReturnType<typeof categorizeTransaction>>;
