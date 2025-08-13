
import type { z } from 'zod';
import type { categorizeTransaction } from '@/ai/flows/categorize-transaction';

export const IncomeCategory = [
    'Salaire',
    'Don',
    'Crédit',
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
    'Assurances',
    'Equipements maison',
    'Factures',
    'Travaux'
  ],
  Transport: [
    'Transport'
  ],
  Entreprise: [
    'Salaire',
    'Factures',
    'Autre',
  ]
} as const;

export const AllExpenseSubCategories = [
    ...ExpenseSubCategory.Personnel,
    ...ExpenseSubCategory.Maison,
    ...ExpenseSubCategory.Transport,
    ...ExpenseSubCategory.Entreprise
].sort((a,b) => a.localeCompare(b)) as (
  'Aide sociale' |
  'Assurances' |
  'Autre' |
  'Divertissement' |
  'Equipements maison' |
  'Factures' |
  'Investissement' |
  'Nourriture' |
  'Prêt' |
  'Remboursement' |
  'Salaire' |
  'Transport' |
  'Travaux' |
  'Vacances et voyage' |
  'Vêtements et accessoires'
)[];


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

export const TransactionScope = [
  'Personnel',
  'Entreprise'
] as const;

export type Scope = (typeof TransactionScope)[number];
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
  scope: Scope;
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
