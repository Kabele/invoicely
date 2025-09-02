'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Invoice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InvoiceCardProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
}

export default function InvoiceCard({ invoice, onEdit, onView, onDelete }: InvoiceCardProps) {
  const { id, clientName, total, dueDate, status } = invoice;

  const statusColors = {
    Paid: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Overdue: 'bg-red-100 text-red-800 border-red-200',
  };
  
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{clientName}</CardTitle>
                <CardDescription>Due on {format(parseISO(dueDate), 'MMM d, yyyy')}</CardDescription>
            </div>
            <Badge className={cn("capitalize", statusColors[status])}>{status.toLowerCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-3xl font-bold">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onView(invoice)}>
            <Eye className="mr-2 h-4 w-4" /> View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(invoice)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
