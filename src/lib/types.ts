export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export type Invoice = {
  id: string;
  clientName: string;
  projectDescription: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  total: number;
  isPaid: boolean;
};
