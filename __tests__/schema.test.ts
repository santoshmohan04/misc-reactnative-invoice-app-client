import invoiceSchema from '../src/types/schemas/invoice.schema';

describe('invoice schema', () => {
  test('valid invoice passes', () => {
    const data = {
      customer: { _id: 'cust1' },
      invoice_number: 'INV-1',
      issued_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      items: [{ description: 'Item', quantity: 1, price: 10 }],
    };
    const parsed = invoiceSchema.parse(data);
    expect(parsed).toBeTruthy();
  });

  test('missing items fails', () => {
    const data = { customer: { _id: 'c' }, invoice_number: '1', issued_date: new Date().toISOString(), due_date: new Date().toISOString(), items: [] };
    expect(() => invoiceSchema.parse(data)).toThrow();
  });
});
