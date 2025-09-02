'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Invoice, LineItem, InvoiceCategory } from '@/lib/types';
import { Separator } from './ui/separator';

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
  unitPrice: z.coerce.number().min(0.01, 'Price must be positive'),
});

const invoiceSchema = z.object({
  id: z.string(),
  clientName: z.string().min(1, 'Client name is required'),
  projectDescription: z.string().min(1, 'Project description is required'),
  dueDate: z.date({ required_error: 'Due date is required' }),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  isPaid: z.boolean(),
  category: z.enum(['procurement', 'service', 'repairs', 'diagnosis'], { required_error: 'Category is required' }),
  taxRate: z.coerce.number().min(0, "Tax/Service charge can't be negative").max(100),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (invoice: Invoice) => void;
  invoice: Invoice | null;
}

const defaultLineItem: Omit<LineItem, 'id'> = {
  description: '',
  quantity: 1,
  unitPrice: 0,
};

const categoryConditions: Record<InvoiceCategory, { notes: string, taxRate: number }> = {
    procurement: { notes: '10% service charge for procurement.', taxRate: 10 },
    service: { notes: '50% down payment expected before booking is made.', taxRate: 0 },
    repairs: { notes: 'Initial deposit of 70% required.', taxRate: 5 },
    diagnosis: { notes: 'Full payment required upfront.', taxRate: 0 },
};

export default function InvoiceForm({ isOpen, onOpenChange, onSubmit, invoice }: InvoiceFormProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: useMemo(() => ({
      id: invoice?.id || crypto.randomUUID(),
      clientName: invoice?.clientName || '',
      projectDescription: invoice?.projectDescription || '',
      dueDate: invoice ? parseISO(invoice.dueDate) : new Date(),
      lineItems: invoice?.lineItems.length ? invoice.lineItems : [{ ...defaultLineItem, id: crypto.randomUUID() }],
      isPaid: invoice?.isPaid || false,
      category: invoice?.category || 'service',
      taxRate: invoice?.taxRate || 0,
      notes: invoice?.notes || '',
    }), [invoice]),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const watchLineItems = form.watch('lineItems');
  const watchTaxRate = form.watch('taxRate');
  const watchCategory = form.watch('category');

  const subtotal = useMemo(() => {
    return watchLineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);
  }, [watchLineItems]);

  const taxAmount = useMemo(() => {
    return subtotal * (watchTaxRate / 100);
  }, [subtotal, watchTaxRate]);

  const total = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  useEffect(() => {
    if (watchCategory) {
        const condition = categoryConditions[watchCategory];
        form.setValue('notes', condition.notes);
        form.setValue('taxRate', condition.taxRate);
    }
  }, [watchCategory, form]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: invoice?.id || crypto.randomUUID(),
        clientName: invoice?.clientName || '',
        projectDescription: invoice?.projectDescription || '',
        dueDate: invoice ? parseISO(invoice.dueDate) : new Date(),
        lineItems: invoice?.lineItems && invoice.lineItems.length > 0 ? invoice.lineItems : [{ ...defaultLineItem, id: crypto.randomUUID() }],
        isPaid: invoice?.isPaid || false,
        category: invoice?.category || 'service',
        taxRate: invoice?.taxRate || categoryConditions[invoice?.category || 'service'].taxRate,
        notes: invoice?.notes || categoryConditions[invoice?.category || 'service'].notes,
      });
    }
  }, [isOpen, invoice, form]);

  const handleFormSubmit = (values: InvoiceFormValues) => {
    const finalInvoice: Invoice = {
      ...values,
      dueDate: values.dueDate.toISOString(),
      status: 'Pending', // Status is recalculated in useInvoices hook
      total: total,
    };
    onSubmit(finalInvoice);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>{invoice ? 'Edit Invoice' : 'Create Invoice'}</SheetTitle>
          <SheetDescription>
            {invoice ? "Update the invoice details below." : "Fill out the form to create a new invoice."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form id="invoice-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-grow overflow-y-auto pr-6 pl-1 space-y-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Website development" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
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
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="procurement">Procurement</SelectItem>
                                    <SelectItem value="repairs">Repairs</SelectItem>
                                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Line Items</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end p-2 border rounded-md relative">
                     <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Item description" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`lineItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel>Unit Price (NGN)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ ...defaultLineItem, id: crypto.randomUUID() })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Notes / Conditions</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g. 50% down payment required..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tax / Service Charge (%)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>A percentage to be added to the subtotal.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end">
                <div className="text-right w-64 space-y-1">
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Subtotal</p>
                        <p>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(subtotal)}</p>
                    </div>
                     <div className="flex justify-between">
                        <p className="text-muted-foreground">Tax/Service ({watchTaxRate}%)</p>
                        <p>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(taxAmount)}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                        <p>Total</p>
                        <p>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(total)}</p>
                    </div>
                </div>
            </div>

          </form>
        </Form>
        <SheetFooter className="pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit" form="invoice-form">Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
