'use client';

import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onCreateInvoice: () => void;
  onCreateReceipt: () => void;
}

export default function Header({ onCreateInvoice, onCreateReceipt }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-end p-4 border-b">
      <div className="flex items-center gap-4">
        {pathname === '/dashboard' && (
           <>
            <Button onClick={onCreateReceipt} variant="outline">
                <Receipt className="mr-2" />
                Create Receipt
            </Button>
            <Button onClick={onCreateInvoice}>
                <Plus className="mr-2" />
                Create Invoice
            </Button>
           </>
        )}
      </div>
    </header>
  );
}
