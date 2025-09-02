'use client';

import { useRef, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, parseISO } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Sparkles, Loader2, Link, Globe, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Invoice } from '@/lib/types';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { generatePdfWithAI } from '@/lib/actions';
import { useBusinessInfo } from '@/hooks/use-business-info';
import ReceiptPDF from './ReceiptPDF';

interface InvoicePDFProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice: Invoice;
  onStatusChange: (invoice: Invoice) => void;
}

export default function InvoicePDF({ isOpen, onOpenChange, invoice, onStatusChange }: InvoicePDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const { businessInfo } = useBusinessInfo();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
  const brandColors = useMemo(() => ({
    primary: businessInfo.primaryColor || '#000000',
    accent: businessInfo.accentColor || '#4f46e5',
  }), [businessInfo]);

  const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const total = invoice.total;

  const handleDownloadPdf = async () => {
    const input = pdfRef.current;
    if (!input) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`invoice-${invoice.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    const result = await generatePdfWithAI(invoice);
    setIsGeneratingAI(false);

    if (result.success && result.dataUri) {
        toast({
            title: 'AI PDF Generated',
            description: 'The AI-enhanced PDF is ready.',
        });
        const link = document.createElement('a');
        link.href = result.dataUri;
        link.download = `ai-invoice-${invoice.id.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        toast({
            title: 'AI Generation Failed',
            description: result.error,
            variant: 'destructive',
        });
    }
  };

  const statusColors = {
    Paid: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Overdue: 'bg-red-100 text-red-800 border-red-200',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>Review the invoice details below. You can download it as a PDF.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-1" >
            <div className="p-8 bg-white text-black" ref={pdfRef}>
                <header className="flex justify-between items-start pb-8">
                    <div>
                        <h1 className="text-4xl font-bold" style={{ color: brandColors.primary }}>{businessInfo.businessName || 'Your Company'}</h1>
                        <p className="text-gray-500">{businessInfo.address}</p>
                        <div className="flex items-center gap-4 mt-2 text-gray-600">
                          {businessInfo.website && <a href={businessInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><Globe className="h-4 w-4" /> {businessInfo.website}</a>}
                          {businessInfo.socials && <span className="flex items-center gap-1"><Link className="h-4 w-4" /> {businessInfo.socials}</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold" style={{ color: brandColors.primary }}>INVOICE</h2>
                        <p className="text-gray-500"># {invoice.id.slice(0, 8)}</p>
                    </div>
                </header>
                <Separator className="my-8"/>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2 uppercase tracking-wide" style={{ color: brandColors.accent }}>Bill To</h3>
                        <p className="font-bold text-lg">{invoice.clientName}</p>
                        <p className="text-gray-700">{invoice.projectDescription}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p><span className="font-semibold text-gray-600">Invoice Date:</span> {format(new Date(), 'MMM d, yyyy')}</p>
                        <p><span className="font-semibold text-gray-600">Due Date:</span> {format(parseISO(invoice.dueDate), 'MMM d, yyyy')}</p>
                        <Badge className={cn("mt-2 capitalize text-base", statusColors[invoice.status])}>{invoice.status}</Badge>
                    </div>
                </div>

                <div className="mt-10">
                <Table>
                    <TableHeader>
                    <TableRow style={{ backgroundColor: brandColors.accent, color: 'white' }}>
                        <TableHead className="w-1/2 font-bold text-white">Description</TableHead>
                        <TableHead className="text-right font-bold text-white">Quantity</TableHead>
                        <TableHead className="text-right font-bold text-white">Unit Price</TableHead>
                        <TableHead className="text-right font-bold text-white">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {invoice.lineItems.map(item => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
                
                <div className="flex justify-end mt-8">
                    <div className="w-1/3 text-right space-y-2">
                        <div className="flex justify-between">
                            <p className="text-gray-600">Subtotal:</p>
                            <p>{formatCurrency(subtotal)}</p>
                        </div>
                         <div className="flex justify-between">
                            <p className="text-gray-600">Tax/Service ({invoice.taxRate}%):</p>
                            <p>{formatCurrency(taxAmount)}</p>
                        </div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold text-2xl" style={{ color: brandColors.primary }}>
                            <p>Total:</p>
                            <p>{formatCurrency(total)}</p>
                        </div>
                    </div>
                </div>
                
                 {invoice.notes && (
                    <div className="mt-12">
                        <h4 className="font-semibold mb-1" style={{ color: brandColors.accent }}>Notes / Conditions</h4>
                        <p className="text-gray-500 text-sm">{invoice.notes}</p>
                    </div>
                )}
                
                 {businessInfo.accountNumber && (
                    <div className="mt-8">
                        <h4 className="font-semibold mb-1" style={{ color: brandColors.accent }}>Payment Details</h4>
                        <p className="text-gray-500 text-sm">Account Number: {businessInfo.accountNumber}</p>
                    </div>
                )}

                <div className="mt-16 text-center text-gray-500 text-sm">
                    <p>Thank you for your business!</p>
                     <p>Generated by InvoiceFast - {businessInfo.email}</p>
                </div>
            </div>
        </div>

        <DialogFooter className="sm:justify-between items-center pt-4">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="paid-status" 
                    checked={invoice.isPaid}
                    onCheckedChange={(checked) => onStatusChange({ ...invoice, isPaid: checked })}
                />
                <Label htmlFor="paid-status">Mark as Paid</Label>
            </div>
            <div className="flex gap-2">
                {invoice.isPaid && (
                   <Button variant="outline" onClick={() => setIsReceiptOpen(true)}>
                       <Receipt className="mr-2 h-4 w-4" /> Download Receipt
                   </Button>
                )}
                <Button variant="secondary" onClick={handleGenerateWithAI} disabled={isGeneratingAI}>
                    {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    AI
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {isReceiptOpen && (
        <ReceiptPDF
            isOpen={isReceiptOpen}
            onOpenChange={setIsReceiptOpen}
            receipt={{
                id: invoice.id,
                clientName: invoice.clientName,
                description: `Payment for Invoice #${invoice.id.slice(0, 8)}`,
                amount: invoice.total,
                paymentDate: new Date().toISOString(),
            }}
        />
    )}
    </>
  );
}
