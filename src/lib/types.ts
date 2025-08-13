import type { z } from 'zod';
import type { categorizeTransaction } from '@/ai/flows/categorize-transaction';

export const IncomeCategory = [
    'Salaire',
    'Don',
    'Dette',
    'Créance'
] as const;

export const ExpenseSubCategory = {
  Personnel: [
    'Aide sociale',
    'Assurances',
    'Autre',
    'Divertissement',
    'Investissement',
    'Nourriture',
    'Prêt',
    'Remboursement',
    'Vacances et voyage',
    'Vêtements et accessoires',
  ],
  Maison: [
    'Equipements maison',
    'Factures',
    'Travaux'
  ],
  Transport: [
    'Transport'
  ]
} as const;

export const AllExpenseSubCategories = [
    ...ExpenseSubCategory.Personnel,
    ...ExpenseSubCategory.Maison,
    ...ExpenseSubCategory.Transport
] as const;


export const TransactionCategory = [
  ...IncomeCategory,
  ...AllExpenseSubCategories
] as const;

export const ExpenseParentCategory = Object.keys(ExpenseSubCategory) as (keyof typeof ExpenseSubCategory)[];

export const TransactionAccount = [
    'Banque', 
    'Mobile money', 
    'Espèces'
] as const;

export type Account = (typeof TransactionAccount)[number];
export type Category = (typeof TransactionCategory)[number];
export type IncomeCategoryType = (typeof IncomeCategory)[number];
export type ExpenseSubCategoryType = (typeof AllExpenseSubCategories)[number];
export type ExpenseParentCategoryType = (typeof ExpenseParentCategory)[number];


export type Transaction = {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  parentCategory?: ExpenseParentCategoryType;
  category: Category;
  account: Account;
  type: 'income' | 'expense';
};

export type Transfer = {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  fromAccount: Account;
  toAccount: Account;
};

export type Period = 'weekly' | 'monthly' | 'quarterly' | 'annually';

export type CategorizeResult = Awaited<ReturnType<typeof categorizeTransaction>>;
