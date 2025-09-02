'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { isPast, parseISO } from 'date-fns';
import { useAuth } from './use-auth';

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
  
  const getStorageKey = useCallback(() => {
    return user ? `invoices_${user.uid}` : null;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        setIsLoaded(true);
        setInvoices([]); // Clear invoices on logout
        return;
    };
    try {
      const storedInvoices = localStorage.getItem(storageKey);
      if (storedInvoices) {
        const parsedInvoices: Invoice[] = JSON.parse(storedInvoices);
        const updatedInvoices = parsedInvoices.map(invoice => ({
            ...invoice,
            status: getInvoiceStatus(invoice),
            total: calculateTotal(invoice)
        }));
        setInvoices(updatedInvoices);
      } else {
        setInvoices([]); // No invoices for this user yet
      }
    } catch (error) {
      console.error('Failed to load invoices from local storage:', error);
    } finally {
        setIsLoaded(true);
    }
  }, [getStorageKey]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if(isLoaded && storageKey){
        try {
            localStorage.setItem(storageKey, JSON.stringify(invoices));
        } catch (error) {
            console.error('Failed to save invoices to local storage:', error);
        }
    }
  }, [invoices, isLoaded, getStorageKey]);

  const addInvoice = useCallback((newInvoiceData: Invoice) => {
    const total = calculateTotal(newInvoiceData);
    const status = getInvoiceStatus(newInvoiceData);
    const finalInvoice = { ...newInvoiceData, total, status };
    setInvoices(prev => [...prev, finalInvoice]);
  }, []);

  const updateInvoice = useCallback((updatedInvoice: Invoice) => {
    const total = calculateTotal(updatedInvoice);
    const status = getInvoiceStatus(updatedInvoice);
    const finalInvoice = { ...updatedInvoice, total, status };
    setInvoices(prev => prev.map(inv => (inv.id === updatedInvoice.id ? finalInvoice : inv)));
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
