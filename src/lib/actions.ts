
'use server';

import { generateClientFriendlyInvoice } from '@/ai/flows/generate-client-friendly-invoice';
import { convertCurrencyFlow } from '@/ai/flows/convert-currency-flow';
import type { Invoice, BusinessInfo } from '@/lib/types';
import { auth } from './firebase-admin'; // Use admin auth
import { db } from '@/lib/firebase-admin'; // Use admin db
import { doc, setDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getUserIdFromToken(): Promise<string | null> {
    const authHeader = headers().get('Authorization');
    if (!authHeader) {
        console.error('No Authorization header found');
        return null;
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        console.error('No token found in Authorization header');
        return null;
    }
    try {
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return null;
    }
}


export async function saveBusinessInfo(businessInfo: BusinessInfo) {
    const userId = await getUserIdFromToken();
    if (!userId) {
        throw new Error('User not authenticated');
    }
    try {
        const docRef = doc(db, 'users', userId);
        await setDoc(docRef, businessInfo, { merge: true });
        revalidatePath('/dashboard/settings'); // Revalidate the settings page
        return { success: true, message: 'Business information saved successfully.' };
    } catch (error) {
        console.error('Error saving business info:', error);
        return { success: false, error: 'Failed to save business info.' };
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
