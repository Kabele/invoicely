'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice, InvoiceStatus, LineItem } from '@/lib/types';
import { isPast, parseISO } from 'date-fns';

const INVOICES_STORAGE_KEY = 'invoices';

const getInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
  if (invoice.isPaid) {
    return 'Paid';
  }
  if (isPast(parseISO(invoice.dueDate))) {
    return 'Overdue';
  }
  return 'Pending';
};

const calculateTotal = (lineItems: LineItem[]): number => {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (storedInvoices) {
        const parsedInvoices: Invoice[] = JSON.parse(storedInvoices);
        const updatedInvoices = parsedInvoices.map(invoice => ({
            ...invoice,
            status: getInvoiceStatus(invoice),
            total: calculateTotal(invoice.lineItems)
        }));
        setInvoices(updatedInvoices);
      }
    } catch (error) {
      console.error('Failed to load invoices from local storage:', error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if(isLoaded){
        try {
            localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
        } catch (error) {
            console.error('Failed to save invoices to local storage:', error);
        }
    }
  }, [invoices, isLoaded]);

  const addInvoice = useCallback((newInvoiceData: Omit<Invoice, 'id' | 'status' | 'total'>) => {
    const total = calculateTotal(newInvoiceData.lineItems);
    const invoiceWithStatus = {
        ...newInvoiceData,
        id: crypto.randomUUID(),
        total,
        status: getInvoiceStatus({ ...newInvoiceData, id: '', total, status: 'Pending' }) // temp values
    }
    setInvoices(prev => [...prev, invoiceWithStatus]);
  }, []);

  const updateInvoice = useCallback((updatedInvoice: Invoice) => {
    const total = calculateTotal(updatedInvoice.lineItems);
    const invoiceWithStatus = {
        ...updatedInvoice,
        total,
        status: getInvoiceStatus({ ...updatedInvoice, total })
    }
    setInvoices(prev => prev.map(inv => (inv.id === updatedInvoice.id ? invoiceWithStatus : inv)));
  }, []);

  const deleteInvoice = useCallback((invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  }, []);

  const getInvoiceById = useCallback((invoiceId: string | null) => {
    return invoices.find(inv => inv.id === invoiceId) || null;
  }, [invoices]);

  return {
    invoices,
    isLoaded,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
  };
}
