'use client';

import { Button } from '@/components/ui/button';
import { FileText, Plus, LogOut, Settings, Receipt } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onCreateInvoice: () => void;
  onCreateReceipt: () => void;
}

export default function Header({ onCreateInvoice, onCreateReceipt }: HeaderProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <Link href="/dashboard">
          <h1 className="text-3xl font-bold text-gray-800">InvoiceFast</h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground hidden sm:block">
          {user?.email}
        </div>
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
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/settings">
            <Settings />
          </Link>
        </Button>
        <Button variant="outline" size="icon" onClick={logout}>
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
