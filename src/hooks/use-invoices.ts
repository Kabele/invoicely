
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDb } from '@/lib/firebase';
import type { Invoice, InvoiceStatus, Receipt } from '@/lib/types';
import { isPast, parseISO } from 'date-fns';
import { useAuth } from './use-auth';
import type { DocumentReference, Firestore } from 'firebase/firestore';

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
  const [db, setDb] = useState<Firestore | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getDb().then(setDb);
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setInvoices([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const loadFirestore = async () => {
        const { collection, query, onSnapshot } = await import('firebase/firestore');
        const q = query(collection(db, 'users', user.uid, 'invoices'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const invoicesData: Invoice[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const invoice = {
              id: doc.id,
              ...data,
              // The 'total' is already calculated and stored in the invoice document.
              // We only need to calculate the 'status' on the client-side as it can be time-dependent (e.g., 'Overdue').
              status: getInvoiceStatus(data as Invoice),
            } as Invoice;
            invoicesData.push(invoice);
          });
          setInvoices(invoicesData.sort((a, b) => parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime()));
          setIsLoaded(true);
        }, (error) => {
          console.error("Error fetching invoices:", error);
          setIsLoaded(true);
        });

        return unsubscribe;
    };
    
    const unsubPromise = loadFirestore();

    return () => {
        unsubPromise.then(unsub => unsub && unsub());
    };
  }, [user, db]);
  
  const addInvoice = useCallback(async (newInvoiceData: Omit<Invoice, 'id' | 'status' | 'total'>) => {
      if (!user || !db) throw new Error("User not authenticated or DB not loaded");
      const total = calculateTotal(newInvoiceData);
      const status = getInvoiceStatus(newInvoiceData);
      const finalInvoice = { ...newInvoiceData, total, status };

      try {
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'users', user.uid, 'invoices'), finalInvoice);
      } catch (error) {
        console.error("Error adding invoice: ", error);
        throw error;
      }
  }, [user, db]);

  const updateInvoice = useCallback(async (updatedInvoice: Invoice) => {
    if (!user || !db) throw new Error("User not authenticated or DB not loaded");
    const { id, ...dataToUpdate } = updatedInvoice;
    const total = calculateTotal(dataToUpdate);
    const status = getInvoiceStatus(dataToUpdate);
    const finalInvoice = { ...dataToUpdate, total, status };
    
    try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const invoiceRef = doc(db, 'users', user.uid, 'invoices', id);
        await updateDoc(invoiceRef, finalInvoice);
    } catch (error) {
        console.error("Error updating invoice: ", error);
        throw error;
    }
  }, [user, db]);

  const deleteInvoice = useCallback(async (invoiceId: string) => {
    if (!user || !db) throw new Error("User not authenticated or DB not loaded");
    try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', user.uid, 'invoices', invoiceId));
    } catch (error) {
        console.error("Error deleting invoice: ", error);
        throw error;
    }
  }, [user, db]);

  const getInvoiceById = useCallback((invoiceId: string | null) => {
    return invoices.find(inv => inv.id === invoiceId) || null;
  }, [invoices]);
  
  const addReceipt = useCallback(async (receiptData: Receipt): Promise<DocumentReference> => {
    if (!user || !db) throw new Error("User not authenticated or DB not loaded");
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const receiptRef = await addDoc(collection(db, 'users', user.uid, 'receipts'), receiptData);
      return receiptRef;
    } catch (error) {
      console.error("Error adding receipt: ", error);
      throw error;
    }
  }, [user, db]);


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
