// This is a server-side file!
'use server';

/**
 * @fileOverview A flow for categorizing transactions using AI.
 *
 * - categorizeTransaction - A function that categorizes a transaction.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionCategorySchema = z.enum([
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Rent',
  'Salary',
  'Other',
]);

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction.'),
  transactionAmount: z.number().describe('The amount of the transaction.'),
  userTransactionHistory: z
    .array(
      z.object({
        description: z.string(),
        category: TransactionCategorySchema,
      })
    )
    .optional()
    .describe(
      'A list of the user historical transactions to help determine category.'
    ),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  category: TransactionCategorySchema.describe(
    'The predicted category of the transaction.'
  ),
  confidence: z
    .number()
    .describe('The confidence level of the categorization (0-1).'),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a personal finance expert helping users categorize their transactions.

  Based on the transaction description, amount, and the user's past transaction history, determine the most appropriate category for the transaction.

  Here's the transaction description: {{{transactionDescription}}}
  Here's the transaction amount: {{{transactionAmount}}}
  {{#if userTransactionHistory}}
  Here's the user's past transaction history:
  {{#each userTransactionHistory}}
  - Description: {{{this.description}}}, Category: {{{this.category}}}
  {{/each}}
  {{else}}
  The user has no past transaction history.
  {{/if}}

  Please categorize the transaction into one of the following categories: Food, Transportation, Entertainment, Utilities, Rent, Salary, Other.
  Return a confidence score between 0 and 1.
  `,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
