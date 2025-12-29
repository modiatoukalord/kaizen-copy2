

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
    'Don',
    'Divertissement',
    'Investissement',
    'Nourriture',
    'Prêt',
    'Remboursement',
    'Transport',
    'Vacances et voyage',
    'Vêtements et accessoires',
    'Autre',
  ],
  Maison: [
    'Equipements maison',
    'Factures',
    'Travaux',
    'Autre'
  ],
  Banque: [
    'Frais bancaires',
    'Agios',
    'Autre'
    ]
} as const;

const allSubCategories = [
    ...ExpenseSubCategory.Personnel,
    ...ExpenseSubCategory.Maison,
    ...ExpenseSubCategory.Banque,
];

export const AllExpenseSubCategories = [...new Set(allSubCategories)].sort((a,b) => a.localeCompare(b)) as (
  'Agios' |
  'Autre' |
  'Divertissement' |
  'Don' |
  'Equipements maison' |
  'Factures' |
  'Frais bancaires' |
  'Investissement' |
  'Nourriture' |
  'Prêt' |
  'Remboursement' |
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

export type Account = (typeof TransactionAccount)[number];
export type Category = (typeof TransactionCategory)[number];
export type IncomeCategoryType = (typeof IncomeCategory)[number];
export type ExpenseSubCategoryType = (typeof AllExpenseSubCategories)[number];
export type ExpenseParentCategoryType = (typeof ExpenseParentCategory)[number];

export type FirestoreUser = {
  username: string;
  pinHash: string;
  profilePictureUrl?: string;
};

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

export type Period = 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

export type CategorizeResult = Awaited<ReturnType<typeof categorizeTransaction>>;

export type BudgetItem = {
  id: string;
  category: ExpenseSubCategoryType;
  planned: number;
};

export const CalendarEventStatus = ['Prévu', 'Terminé', 'Annulé'] as const;
export type CalendarEventStatusType = (typeof CalendarEventStatus)[number];

export type CalendarEvent = {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  status: CalendarEventStatusType;
};

export type ProjectionItem = {
  id: string;
  description: string;
  amount: number;
  type: 'once' | 'recurring';
};

export type Projection = {
  id: string;
  name: string;
  initialBalance: number;
  projectionMonths: number;
  incomes: ProjectionItem[];
  expenses: ProjectionItem[];
  createdAt: string; // ISO 8601 format
};

