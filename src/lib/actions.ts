'use server';

import { generateClientFriendlyInvoice } from '@/ai/flows/generate-client-friendly-invoice';
import { convertCurrencyFlow } from '@/ai/flows/convert-currency-flow';
import type { Invoice, BusinessInfo } from '@/lib/types';
import { supabaseAdmin } from './supabase-admin';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getUserId(): Promise<string | null> {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null;
}


export async function saveBusinessInfo(businessInfo: BusinessInfo) {
    const userId = await getUserId();
    if (!userId) {
        return { success: false, error: 'User not authenticated' };
    }
    try {
        const { error } = await supabaseAdmin.from('users').update(businessInfo).eq('id', userId);
        if (error) throw error;
        revalidatePath('/dashboard/settings'); // Revalidate the settings page
        return { success: true, message: 'Business information saved successfully.' };
    } catch (error: any) {
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

export async function getAnalytics() {
    try {
        const [
            { data: totalUsers, error: usersError },
            { data: totalInvoices, error: invoicesError },
            { data: totalReceipts, error: receiptsError }
        ] = await Promise.all([
            supabaseAdmin.rpc('get_total_users'),
            supabaseAdmin.rpc('get_total_invoices'),
            supabaseAdmin.rpc('get_total_receipts')
        ]);

        if (usersError || invoicesError || receiptsError) {
            throw new Error('Failed to fetch analytics');
        }

        return {
            success: true,
            analytics: {
                totalUsers,
                totalInvoices,
                totalReceipts,
            }
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return { success: false, error: 'Failed to fetch analytics.' };
    }
}
