'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { BusinessInfoProvider } from '@/hooks/use-business-info';
import Header from '@/components/Header';
import InvoiceForm from '@/components/InvoiceForm';
import ReceiptForm from '@/components/ReceiptForm';
import { useInvoices } from '@/hooks/use-invoices';
import { Invoice, Receipt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { invoices, addInvoice, updateInvoice } = useInvoices();
  const { toast } = useToast();
  
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isReceiptFormOpen, setIsReceiptFormOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  // Custom event listener to open invoice form from other components
  useEffect(() => {
    const openForm = (event: Event) => {
      const customEvent = event as CustomEvent<Invoice>;
      setActiveInvoice(customEvent.detail);
      setIsInvoiceFormOpen(true);
    };
    window.addEventListener('openInvoiceForm', openForm);
    return () => window.removeEventListener('openInvoiceForm', openForm);
  }, []);


  const handleCreateInvoice = () => {
    setActiveInvoice(null);
    setIsInvoiceFormOpen(true);
  };

  const handleCreateReceipt = () => {
    setIsReceiptFormOpen(true);
  };
  
  const handleInvoiceFormSubmit = (invoiceData: Invoice) => {
    if (activeInvoice && invoices.find(i => i.id === invoiceData.id)) {
      updateInvoice(invoiceData);
      toast({ title: 'Invoice Updated', description: 'Your invoice has been successfully updated.' });
    } else {
      addInvoice(invoiceData);
      toast({ title: 'Invoice Created', description: 'Your new invoice has been successfully created.' });
    }
    setIsInvoiceFormOpen(false);
    setActiveInvoice(null);
  };

  const handleReceiptFormSubmit = (receiptData: Receipt) => {
    // For now, we just generate the receipt without saving it.
    // In a real app, you might save receipts or link them to invoices.
    toast({ title: 'Receipt Generated', description: 'Your receipt has been successfully generated.' });
    setIsReceiptFormOpen(false);
    
    // Trigger download or display for the generated receipt
    const event = new CustomEvent('generateReceipt', { detail: receiptData });
    window.dispatchEvent(event);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BusinessInfoProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header onCreateInvoice={handleCreateInvoice} onCreateReceipt={handleCreateReceipt} />
          <main className="flex-1 p-6 md:p-10">
              {children}
          </main>
        </div>
      </div>
      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onOpenChange={setIsInvoiceFormOpen}
        onSubmit={handleInvoiceFormSubmit}
        invoice={activeInvoice}
      />
      <ReceiptForm
        isOpen={isReceiptFormOpen}
        onOpenChange={setIsReceiptFormOpen}
        onSubmit={handleReceiptFormSubmit}
      />
    </BusinessInfoProvider>
  );
}
