'use server';

import { generateClientFriendlyInvoice } from '@/ai/flows/generate-client-friendly-invoice';
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
