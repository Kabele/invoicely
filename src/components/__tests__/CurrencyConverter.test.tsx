import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrencyConverter from '../CurrencyConverter';
import { convertCurrency } from '@/lib/actions';

// Mock the server action
jest.mock('@/lib/actions');

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));


describe('CurrencyConverter', () => {
  const mockConvertCurrency = convertCurrency as jest.Mock;

  beforeEach(() => {
    // Reset the mock before each test
    mockConvertCurrency.mockClear();
    // Provide a default mock implementation
    mockConvertCurrency.mockResolvedValue({ success: true, convertedAmount: 67 });
  });

  it('renders correctly and performs initial conversion', async () => {
    render(<CurrencyConverter />);

    // Check for initial elements
    expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toHaveValue(1000);

    // Initial conversion is called on load
    await waitFor(() => {
        expect(mockConvertCurrency).toHaveBeenCalledWith(1000, 'NGN', 'USD');
    });

    // Check if the result is displayed
    await waitFor(() => {
      // The result of 1000 NGN -> USD with our mock is 67
      expect(screen.getByPlaceholderText('Result')).toHaveValue('$67.00');
    });
  });

  it('calls convertCurrency action when Convert button is clicked', async () => {
    render(<CurrencyConverter />);

    // Change amount
    const amountInput = screen.getByPlaceholderText('Amount');
    fireEvent.change(amountInput, { target: { value: '150' } });

    // Click convert button
    const convertButton = screen.getByRole('button', { name: 'Convert' });
    fireEvent.click(convertButton);

    // Check if the action was called with the new amount
    await waitFor(() => {
      expect(mockConvertCurrency).toHaveBeenCalledWith(150, 'NGN', 'USD');
    });
  });
  
  it('swaps currencies when swap button is clicked', async () => {
    render(<CurrencyConverter />);

    // Initial state: NGN -> USD
    expect(screen.getAllByText('NGN').length).toBeGreaterThan(0);
    expect(screen.getAllByText('USD').length).toBeGreaterThan(0);

    // Click swap button
    const swapButton = screen.getByRole('button', { name: '' }); // The button has no text, just an icon
    fireEvent.click(swapButton);

    // Wait for state to update
    await waitFor(() => {
        // Now should be USD -> NGN
        expect(screen.getAllByText('USD').length).toBeGreaterThan(0);
        expect(screen.getAllByText('NGN').length).toBeGreaterThan(0);
    });
  });
});
