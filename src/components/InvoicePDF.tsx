'use client';

import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, parseISO } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Invoice } from '@/lib/types';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { generatePdfWithAI } from '@/lib/actions';

interface InvoicePDFProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice: Invoice;
  onStatusChange: (invoice: Invoice) => void;
}

export default function InvoicePDF({ isOpen, onOpenChange, invoice, onStatusChange }: InvoicePDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
        // This is a placeholder since the AI flow returns dummy data.
        // In a real app, you might open this in a new tab or trigger a download.
        toast({
            title: 'AI PDF Generated',
            description: 'The AI-enhanced PDF is ready (placeholder).',
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>Review the invoice details below. You can download it as a PDF.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-1" ref={pdfRef}>
            <div className="p-8 bg-white text-black">
                <header className="flex justify-between items-center pb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
                        <p className="text-gray-500">Invoice #: {invoice.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-semibold">InvoiceFast</h2>
                        <p className="text-gray-500">123 App Street, Dev City, 10101</p>
                    </div>
                </header>
                <Separator className="my-8"/>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-gray-600 mb-2">Bill To:</h3>
                        <p className="font-bold">{invoice.clientName}</p>
                        <p className="text-gray-700">{invoice.projectDescription}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-semibold text-gray-600">Invoice Date:</span> {format(new Date(), 'MMM d, yyyy')}</p>
                        <p><span className="font-semibold text-gray-600">Due Date:</span> {format(parseISO(invoice.dueDate), 'MMM d, yyyy')}</p>
                        <Badge className={cn("mt-2 capitalize text-lg", statusColors[invoice.status])}>{invoice.status}</Badge>
                    </div>
                </div>

                <div className="mt-8">
                <Table>
                    <TableHeader>
                    <TableRow className='bg-gray-50'>
                        <TableHead className="w-1/2">Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {invoice.lineItems.map(item => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
                
                <div className="flex justify-end mt-8">
                    <div className="w-1/3 text-right">
                        <div className="flex justify-between">
                            <p className="text-gray-600">Subtotal:</p>
                            <p>${invoice.total.toFixed(2)}</p>
                        </div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold text-xl">
                            <p>Total:</p>
                            <p>${invoice.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center text-gray-500 text-sm">
                    <p>Thank you for your business!</p>
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
                <Button variant="secondary" onClick={handleGenerateWithAI} disabled={isGeneratingAI}>
                    {isGeneratingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate with AI
                </Button>
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PDF
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
