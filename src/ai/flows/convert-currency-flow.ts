'use server';
/**
 * @fileOverview A currency conversion AI agent.
 *
 * - convertCurrencyFlow - A function that handles the currency conversion.
 * - ConvertCurrencyInput - The input type for the convertCurrencyFlow function.
 * - ConvertCurrencyOutput - The return type for the convertCurrencyFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertCurrencyInputSchema = z.object({
  amount: z.number().describe('The amount to convert.'),
  fromCurrency: z.string().describe('The currency to convert from (e.g., USD, NGN).'),
  toCurrency: z.string().describe('The currency to convert to (e.g., USD, NGN).'),
});
export type ConvertCurrencyInput = z.infer<typeof ConvertCurrencyInputSchema>;

const ConvertCurrencyOutputSchema = z.object({
  convertedAmount: z.number().describe('The converted amount.'),
});
export type ConvertCurrencyOutput = z.infer<typeof ConvertCurrencyOutputSchema>;

const getConversionRate = ai.defineTool(
  {
    name: 'getConversionRate',
    description: 'Returns the conversion rate between two currencies.',
    inputSchema: z.object({
      from: z.string().describe('The currency to convert from.'),
      to: z.string().describe('The currency to convert to.'),
    }),
    outputSchema: z.number(),
  },
  async ({ from, to }) => {
    // This is a mock. In a real application, you would fetch this from a reliable API.
    const rates: Record<string, Record<string, number>> = {
        NGN: { USD: 0.00067, EUR: 0.00062, GBP: 0.00053 },
        USD: { NGN: 1485.57, EUR: 0.93, GBP: 0.79 },
        EUR: { NGN: 1600.5, USD: 1.08, GBP: 0.85 },
        GBP: { NGN: 1888.5, USD: 1.27, EUR: 1.18 },
    };
    if (from === to) return 1;
    return rates[from]?.[to] || 1 / (rates[to]?.[from] || 1);
  }
);


export async function convertCurrencyFlow(input: ConvertCurrencyInput): Promise<ConvertCurrencyOutput> {
  const prompt = ai.definePrompt({
    name: 'convertCurrencyPrompt',
    input: {schema: ConvertCurrencyInputSchema},
    output: {schema: ConvertCurrencyOutputSchema},
    tools: [getConversionRate],
    prompt: `Convert {{amount}} from {{fromCurrency}} to {{toCurrency}}. Use the provided tools to get the conversion rate.`,
  });

  const { output } = await prompt(input);
  return output!;
}
