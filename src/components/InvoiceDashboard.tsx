'use client';

import { useState, useMemo } from 'react';
import { useInvoices } from '@/hooks/use-invoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Header from './Header';
import InvoiceCard from './InvoiceCard';
import InvoiceForm from './InvoiceForm';
import InvoicePDF from './InvoicePDF';
import { Skeleton } from './ui/skeleton';
import type { Invoice } from '@/lib/types';
import CurrencyConverter from './CurrencyConverter';

export default function InvoiceDashboard() {
  const { invoices, isLoaded, addInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { toast } = useToast();

  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const summaryStats = useMemo(() => {
    const totalInvoices = invoices.length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;
    const outstandingAmount = invoices
      .filter(inv => inv.status !== 'Paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    return { totalInvoices, overdueInvoices, outstandingAmount };
  }, [invoices]);

  const handleCreate = () => {
    setActiveInvoice(null);
    setIsFormSheetOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setActiveInvoice(invoice);
    setIsFormSheetOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setActiveInvoice(invoice);
    setIsPdfDialogOpen(true);
  };
  
  const handleDeleteRequest = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete);
      toast({
        title: 'Invoice Deleted',
        description: 'The invoice has been successfully deleted.',
      });
      setInvoiceToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = (invoiceData: Invoice) => {
    if (activeInvoice) {
      updateInvoice(invoiceData);
      toast({ title: 'Invoice Updated', description: 'Your invoice has been successfully updated.' });
    } else {
      addInvoice(invoiceData);
      toast({ title: 'Invoice Created', description: 'Your new invoice has been successfully created.' });
    }
    setIsFormSheetOpen(false);
    setActiveInvoice(null);
  };

  return (
    <>
      <Header onCreate={handleCreate} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoaded ? summaryStats.totalInvoices : <Skeleton className="h-8 w-16" />}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoaded ? summaryStats.overdueInvoices : <Skeleton className="h-8 w-16" />}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoaded ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(summaryStats.outstandingAmount) : <Skeleton className="h-8 w-32" />}
            </div>
          </CardContent>
        </Card>
        <CurrencyConverter />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Invoices</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!isLoaded && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          {isLoaded && invoices.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">No invoices yet. Click "Create Invoice" to get started!</p>
          ) : (
            invoices.map(invoice => (
              <InvoiceCard key={invoice.id} invoice={invoice} onEdit={handleEdit} onView={handleView} onDelete={handleDeleteRequest} />
            ))
          )}
        </div>
      </div>

      <InvoiceForm
        isOpen={isFormSheetOpen}
        onOpenChange={setIsFormSheetOpen}
        onSubmit={handleFormSubmit}
        invoice={activeInvoice}
      />

      {activeInvoice && (
        <InvoicePDF
          isOpen={isPdfDialogOpen}
          onOpenChange={setIsPdfDialogOpen}
          invoice={activeInvoice}
          onStatusChange={updateInvoice}
        />
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
