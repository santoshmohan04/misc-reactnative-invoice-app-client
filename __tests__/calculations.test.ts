import { calculateSubtotal, calculateDiscount, calculateGrandTotal } from '../src/features/invoices/utils/calculations';

describe('invoice calculations', () => {
  const items = [
    { description: 'A', quantity: 2, price: 10, discount: 0 },
    { description: 'B', quantity: 1, price: 5, discount: 10 },
  ];

  test('subtotal', () => {
    expect(calculateSubtotal(items as any)).toBe(25);
  });

  test('discount', () => {
    expect(calculateDiscount(items as any)).toBeCloseTo(0.5);
  });

  test('grand total no tax', () => {
    const res = calculateGrandTotal(items as any, 0);
    expect(res.subtotal).toBe(25);
    expect(res.discount).toBeCloseTo(0.5);
    expect(res.tax).toBe(0);
    expect(res.total).toBeCloseTo(24.5);
  });
});
