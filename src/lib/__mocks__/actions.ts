'use server';

export const convertCurrency = jest.fn(async (amount: number, from: string, to: string) => {
  if (from === 'USD' && to === 'NGN') {
    return { success: true, convertedAmount: amount * 1500 };
  }
  return { success: true, convertedAmount: amount * 0.00067 };
});
