'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { BusinessInfoProvider } from '@/hooks/use-business-info';
import Header from '@/components/Header';
import InvoiceForm from '@/components/InvoiceForm';
import { useInvoices } from '@/hooks/use-invoices';
import { Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { addInvoice, updateInvoice } = useInvoices();
  const { toast } = useToast();
  
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleCreate = () => {
    setActiveInvoice(null);
    setIsFormSheetOpen(true);
  };
  
  const handleFormSubmit = (invoiceData: Invoice) => {
    if (invoiceData.id && invoices.find(i => i.id === invoiceData.id)) {
      updateInvoice(invoiceData);
      toast({ title: 'Invoice Updated', description: 'Your invoice has been successfully updated.' });
    } else {
      addInvoice(invoiceData);
      toast({ title: 'Invoice Created', description: 'Your new invoice has been successfully created.' });
    }
    setIsFormSheetOpen(false);
    setActiveInvoice(null);
  };

  const { invoices } = useInvoices();


  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BusinessInfoProvider>
       <Header onCreate={handleCreate} />
        <main className="container mx-auto p-4 md:p-8">
            {children}
        </main>
      <InvoiceForm
        isOpen={isFormSheetOpen}
        onOpenChange={setIsFormSheetOpen}
        onSubmit={handleFormSubmit}
        invoice={activeInvoice}
      />
    </BusinessInfoProvider>
  );
}
