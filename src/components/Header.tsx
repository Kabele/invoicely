'use client';

import { Button } from '@/components/ui/button';
import { Plus, Receipt, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onCreateInvoice: () => void;
  onCreateReceipt: () => void;
  onMenuClick: () => void;
}

export default function Header({ onCreateInvoice, onCreateReceipt, onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between md:justify-end p-4 border-b">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open Menu</span>
      </Button>
      <div className="flex items-center gap-4">
        {pathname === '/dashboard' && (
           <>
            <Button onClick={onCreateReceipt} variant="outline" size="sm">
                <Receipt className="mr-2" />
                <span className="hidden sm:inline">Create Receipt</span>
            </Button>
            <Button onClick={onCreateInvoice} size="sm">
                <Plus className="mr-2" />
                <span className="hidden sm:inline">Create Invoice</span>
            </Button>
           </>
        )}
      </div>
    </header>
  );
}
