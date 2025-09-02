'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Receipt } from '@/lib/types';

const receiptSchema = z.object({
  id: z.string(),
  clientName: z.string().min(1, 'Client name is required'),
  description: z.string().min(1, 'A description of the payment is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  paymentDate: z.date({ required_error: 'Payment date is required' }),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

interface ReceiptFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (receipt: Receipt) => void;
}

export default function ReceiptForm({ isOpen, onOpenChange, onSubmit }: ReceiptFormProps) {
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: useMemo(() => ({
      id: crypto.randomUUID(),
      clientName: '',
      description: '',
      amount: 0,
      paymentDate: new Date(),
    }), []),
  });

  const handleFormSubmit = (values: ReceiptFormValues) => {
    const finalReceipt: Receipt = {
      ...values,
      paymentDate: values.paymentDate.toISOString(),
    };
    onSubmit(finalReceipt);
    form.reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Create Receipt</SheetTitle>
          <SheetDescription>
            Fill out the form to generate a new payment receipt.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form id="receipt-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-grow overflow-y-auto pr-6 pl-1 space-y-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid By (Client Name)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment For</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Down payment for website development" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (NGN)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </form>
        </Form>
        <SheetFooter className="pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit" form="receipt-form">Generate Receipt</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
