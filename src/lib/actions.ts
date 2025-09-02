'use server';

import { generateClientFriendlyInvoice } from '@/ai/flows/generate-client-friendly-invoice';
import { convertCurrencyFlow } from '@/ai/flows/convert-currency-flow';
import type { Invoice } from '@/lib/types';

export async function generatePdfWithAI(invoice: Invoice) {
  try {
    const result = await generateClientFriendlyInvoice({
      invoiceData: JSON.stringify(invoice),
    });
    return { success: true, dataUri: result.pdfDataUri };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate PDF with AI.' };
  }
}

export async function convertCurrency(amount: number, from: string, to: string) {
    try {
        const result = await convertCurrencyFlow({ amount, fromCurrency: from, toCurrency: to });
        return { success: true, convertedAmount: result.convertedAmount };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to convert currency using AI.' };
    }
}
