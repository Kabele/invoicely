'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Invoice, InvoiceStatus, Receipt } from '@/lib/types';
import { isPast, parseISO } from 'date-fns';
import { useAuth } from './use-auth';
import type { User } from '@supabase/supabase-js';

const getInvoiceStatus = (invoice: Pick<Invoice, 'isPaid' | 'dueDate'>): InvoiceStatus => {
  if (invoice.isPaid) {
    return 'Paid';
  }
  if (isPast(parseISO(invoice.dueDate))) {
    return 'Overdue';
  }
  return 'Pending';
};

const calculateTotal = (invoice: Pick<Invoice, 'lineItems' | 'taxRate'>): number => {
    const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * (invoice.taxRate / 100);
    return subtotal + taxAmount;
};

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setInvoices([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        setIsLoaded(true);
        return;
      }

      const invoicesData: Invoice[] = data.map((invoice: any) => ({
        ...invoice,
        status: getInvoiceStatus(invoice),
      }));

      setInvoices(invoicesData);
      setIsLoaded(true);
    };

    fetchInvoices();

    const subscription = supabase
      .channel('public:invoices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `user_id=eq.${user.id}` }, fetchInvoices)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);
  
  const addInvoice = useCallback(async (newInvoiceData: Omit<Invoice, 'id' | 'status' | 'total'>) => {
      if (!user) throw new Error("User not authenticated");
      const total = calculateTotal(newInvoiceData);
      const status = getInvoiceStatus(newInvoiceData);
      const finalInvoice = { ...newInvoiceData, total, status, user_id: user.id };

      const { error } = await supabase.from('invoices').insert([finalInvoice]);
      if (error) {
        console.error("Error adding invoice: ", error);
        throw error;
      }
  }, [user]);

  const updateInvoice = useCallback(async (updatedInvoice: Invoice) => {
    if (!user) throw new Error("User not authenticated");
    const { id, ...dataToUpdate } = updatedInvoice;
    const total = calculateTotal(dataToUpdate);
    const status = getInvoiceStatus(dataToUpdate);
    const finalInvoice = { ...dataToUpdate, total, status };
    
    const { error } = await supabase.from('invoices').update(finalInvoice).eq('id', id);
    if (error) {
        console.error("Error updating invoice: ", error);
        throw error;
    }
  }, [user]);

  const deleteInvoice = useCallback(async (invoiceId: string) => {
    if (!user) throw new Error("User not authenticated");
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
    if (error) {
        console.error("Error deleting invoice: ", error);
        throw error;
    }
  }, [user]);

  const getInvoiceById = useCallback((invoiceId: string | null) => {
    return invoices.find(inv => inv.id === invoiceId) || null;
  }, [invoices]);
  
  const addReceipt = useCallback(async (receiptData: Receipt): Promise<any> => {
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase.from('receipts').insert([{ ...receiptData, user_id: user.id }]);
    if (error) {
      console.error("Error adding receipt: ", error);
      throw error;
    }
    return data;
  }, [user]);


  return {
    invoices,
    isLoaded,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    addReceipt,
  };
}
