'use client';

import { useRef, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Loader2, Link as LinkIcon, Globe } from 'lucide-react';
import type { Receipt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useBusinessInfo } from '@/hooks/use-business-info';

interface ReceiptPDFProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  receipt: Receipt;
}

export default function ReceiptPDF({ isOpen, onOpenChange, receipt }: ReceiptPDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const { businessInfo } = useBusinessInfo();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const brandColors = useMemo(() => ({
    primary: businessInfo.primaryColor || '#000000',
    accent: businessInfo.accentColor || '#4f46e5',
  }), [businessInfo]);

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
      pdf.save(`receipt-${receipt.id.slice(0, 8)}.pdf`);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>Review the payment receipt below. You can download it as a PDF.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div className="p-8 bg-white text-black" ref={pdfRef}>
            <header className="flex justify-between items-start pb-8">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: brandColors.primary }}>{businessInfo.businessName || 'Your Company'}</h1>
                <p className="text-gray-500">{businessInfo.address}</p>
                 <div className="flex items-center gap-4 mt-2 text-gray-600">
                    {businessInfo.website && <a href={businessInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><Globe className="h-4 w-4" /> {businessInfo.website}</a>}
                    {businessInfo.socials && <span className="flex items-center gap-1"><LinkIcon className="h-4 w-4" /> {businessInfo.socials}</span>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold" style={{ color: brandColors.primary }}>PAYMENT RECEIPT</h2>
                <p className="text-gray-500"># {receipt.id.slice(0, 8)}</p>
              </div>
            </header>
            <Separator className="my-8" />
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2 uppercase tracking-wide" style={{ color: brandColors.accent }}>Received From</h3>
                <p className="font-bold text-lg">{receipt.clientName}</p>
              </div>
              <div className="text-right space-y-1">
                <p><span className="font-semibold text-gray-600">Payment Date:</span> {format(parseISO(receipt.paymentDate), 'MMM d, yyyy')}</p>
              </div>
            </div>

            <div className="mt-10 bg-gray-50 p-8 rounded-lg">
                <p className="text-gray-600 text-sm uppercase tracking-wider">Payment For</p>
                <p className="font-medium text-lg mb-4">{receipt.description}</p>
                <Separator/>
                <div className='flex justify-end'>
                    <div className="text-right mt-4">
                        <p className="text-gray-600 text-sm">Amount Paid</p>
                        <p className="font-bold text-4xl" style={{ color: brandColors.primary }}>{formatCurrency(receipt.amount)}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-end mt-8">
                 {businessInfo.accountNumber && (
                <div className="text-left">
                    <h4 className="font-semibold mb-1" style={{ color: brandColors.accent }}>Paid To</h4>
                    <p className="text-gray-500 text-sm">
                        {businessInfo.accountName ? `${businessInfo.accountName} - ` : ''} 
                        {businessInfo.businessName} - {businessInfo.accountNumber}
                    </p>
                </div>
                )}

                 <div>
                    <h4 className="font-semibold mb-2" style={{ color: brandColors.accent }}>Authorized Signature</h4>
                    <div className="w-48 h-12 border-b border-gray-400 mt-8"></div>
                    <p className="text-gray-500 text-sm mt-2 text-center">{businessInfo.businessName || 'Your Company'}</p>
                </div>
            </div>

            <div className="mt-16 text-center text-gray-500 text-sm">
              <p>Thank you for your business!</p>
              <p>Generated by InvoiceFast - {businessInfo.email}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleDownloadPdf} disabled={isDownloading} className="w-full">
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
