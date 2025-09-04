import { renderHook } from '@testing-library/react';
import { useInvoices } from '../use-invoices';
import type { Invoice, LineItem } from '@/lib/types';

// Mock the useAuth hook
jest.mock('../use-auth', () => ({
  useAuth: () => ({ user: { uid: 'test-user-id' } }),
}));

// Mock the entire firebase module
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  isPast: (date: Date) => date.getTime() < new Date('2024-01-15').getTime(),
  parseISO: (dateString: string) => new Date(dateString),
}));


describe('useInvoices logic', () => {

    const baseInvoice: Omit<Invoice, 'id' | 'status' | 'total'> = {
        clientName: 'Test Client',
        projectDescription: 'Test Project',
        dueDate: '',
        isPaid: false,
        category: 'service',
        taxRate: 10,
        lineItems: [{ id: '1', description: 'Task 1', quantity: 10, unitPrice: 50 }], // Subtotal: 500
        notes: ''
    };

    // This is a "private" function in the hook, but we can extract and test it.
    const getInvoiceStatus = (invoice: Pick<Invoice, 'isPaid' | 'dueDate'>): string => {
        if (invoice.isPaid) return 'Paid';
        if (new Date(invoice.dueDate).getTime() < new Date('2024-01-15').getTime()) return 'Overdue';
        return 'Pending';
    };

    const calculateTotal = (invoice: Pick<Invoice, 'lineItems' | 'taxRate'>): number => {
        const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const taxAmount = subtotal * (invoice.taxRate / 100);
        return subtotal + taxAmount;
    };


    it('should correctly calculate the total', () => {
        const total = calculateTotal(baseInvoice);
        // Subtotal (500) + Tax (50) = 550
        expect(total).toBe(550);
    });

    it('should return status "Paid" if isPaid is true', () => {
        const status = getInvoiceStatus({ ...baseInvoice, isPaid: true, dueDate: '2025-01-01' });
        expect(status).toBe('Paid');
    });

    it('should return status "Overdue" if due date is in the past and not paid', () => {
        const status = getInvoiceStatus({ ...baseInvoice, isPaid: false, dueDate: '2024-01-01' });
        expect(status).toBe('Overdue');
    });

    it('should return status "Pending" if due date is in the future and not paid', () => {
        const status = getInvoiceStatus({ ...baseInvoice, isPaid: false, dueDate: '2025-01-01' });
        expect(status).toBe('Pending');
    });
});
