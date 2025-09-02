'use client';

import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface HeaderProps {
  onCreate: () => void;
}

export default function Header({ onCreate }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">InvoiceFast</h1>
      </div>
      <Button onClick={onCreate}>
        <Plus className="mr-2" />
        Create Invoice
      </Button>
    </header>
  );
}
