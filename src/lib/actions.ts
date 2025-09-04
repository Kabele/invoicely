
'use server';

import { generateClientFriendlyInvoice } from '@/ai/flows/generate-client-friendly-invoice';
import { convertCurrencyFlow } from '@/ai/flows/convert-currency-flow';
import type { Invoice, BusinessInfo } from '@/lib/types';
import { auth, db } from './firebase-admin';
import { doc, setDoc } from 'firebase/firestore';
import { headers } from 'next/headers';

async function getUserId(): Promise<string | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error('Error verifying auth token:', error);
            return null;
        }
    }
    return null;
}

export async function saveBusinessInfo(businessInfo: BusinessInfo) {
    const userId = await getUserId();
    if (!userId) {
        throw new Error('User not authenticated');
    }
    try {
        const docRef = doc(db, 'users', userId);
        await setDoc(docRef, businessInfo, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error saving business info:', error);
        throw new Error('Failed to save business info.');
    }
}


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

