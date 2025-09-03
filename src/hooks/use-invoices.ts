'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Invoice, InvoiceStatus, Receipt } from '@/lib/types';
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

  useEffect(() => {
    if (!user) {
      setInvoices([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const q = query(collection(db, 'users', user.uid, 'invoices'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData: Invoice[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const invoice = {
          id: doc.id,
          ...data,
          status: getInvoiceStatus(data as Invoice),
          total: calculateTotal(data as Invoice)
        } as Invoice;
        invoicesData.push(invoice);
      });
      setInvoices(invoicesData.sort((a, b) => parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime()));
      setIsLoaded(true);
    }, (error) => {
      console.error("Error fetching invoices:", error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);
  
  const addInvoice = useCallback(async (newInvoiceData: Omit<Invoice, 'id' | 'status' | 'total'>) => {
      if (!user) throw new Error("User not authenticated");
      const total = calculateTotal(newInvoiceData);
      const status = getInvoiceStatus(newInvoiceData);
      const finalInvoice = { ...newInvoiceData, total, status };

      try {
        await addDoc(collection(db, 'users', user.uid, 'invoices'), finalInvoice);
      } catch (error) {
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
    
    try {
        const invoiceRef = doc(db, 'users', user.uid, 'invoices', id);
        await updateDoc(invoiceRef, finalInvoice);
    } catch (error) {
        console.error("Error updating invoice: ", error);
        throw error;
    }
  }, [user]);

  const deleteInvoice = useCallback(async (invoiceId: string) => {
    if (!user) throw new Error("User not authenticated");
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'invoices', invoiceId));
    } catch (error) {
        console.error("Error deleting invoice: ", error);
        throw error;
    }
  }, [user]);

  const getInvoiceById = useCallback((invoiceId: string | null) => {
    return invoices.find(inv => inv.id === invoiceId) || null;
  }, [invoices]);
  
  const addReceipt = useCallback(async (receiptData: Receipt): Promise<DocumentReference> => {
    if (!user) throw new Error("User not authenticated");
    try {
      const receiptRef = await addDoc(collection(db, 'users', user.uid, 'receipts'), receiptData);
      return receiptRef;
    } catch (error) {
      console.error("Error adding receipt: ", error);
      throw error;
    }
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
