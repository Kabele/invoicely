'use client';

import { Button } from '@/components/ui/button';
import { FileText, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface HeaderProps {
  onCreate: () => void;
}

export default function Header({ onCreate }: HeaderProps) {
  const { logout, user } = useAuth();
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">InvoiceFast</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground hidden sm:block">
          {user?.email}
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2" />
          Create Invoice
        </Button>
        <Button variant="outline" size="icon" onClick={logout}>
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
