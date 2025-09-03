export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export type InvoiceCategory = 'procurement' | 'service' | 'repairs' | 'diagnosis';

export type Invoice = {
  id: string;
  clientName: string;
  projectDescription: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  total: number;
  isPaid: boolean;
  category: InvoiceCategory;
  taxRate: number; // Percentage
  notes: string;
};

export type Receipt = {
  id: string;
  clientName: string;
  description: string;
  amount: number;
  paymentDate: string;
};

export type BusinessInfo = {
    businessName: string;
    address: string;
    accountNumber: string;
    socials: string;
    email: string;
    website: string;
    primaryColor?: string;
    accentColor?: string;
    signatureImage?: string;
    logoImage?: string;
};
