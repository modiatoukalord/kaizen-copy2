import type { z } from 'zod';
import type { categorizeTransaction } from '@/ai/flows/categorize-transaction';

export const IncomeCategory = [
    'Salaire',
    'Don',
    'Emprunt'
] as const;

export const ExpenseCategory = [
  'Nourriture',
  'Transport',
  'Divertissement',
  'Services publics',
  'Loyer',
  'Aide sociale',
  'Autre',
] as const;

export const TransactionCategory = [
  ...IncomeCategory,
  ...ExpenseCategory
] as const;

export const TransactionAccount = [
    'Banque', 
    'Mobile money', 
    'Espèces'
] as const;

export type Account = (typeof TransactionAccount)[number];
export type Category = (typeof TransactionCategory)[number];
export type IncomeCategoryType = (typeof IncomeCategory)[number];
export type ExpenseCategoryType = (typeof ExpenseCategory)[number];


export type Transaction = {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  category: Category;
  account: Account;
  type: 'income' | 'expense';
};

export type Period = 'weekly' | 'monthly' | 'quarterly' | 'annually';

export type CategorizeResult = Awaited<ReturnType<typeof categorizeTransaction>>;
