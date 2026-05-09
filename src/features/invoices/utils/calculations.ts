import type { InvoiceItem } from '../../types/schemas/invoice.schema';

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price) || 0;
    const line = qty * price;
    return sum + line;
  }, 0);
}

export function calculateDiscount(items: InvoiceItem[]): number {
  return items.reduce((sum, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price) || 0;
    const discountPct = Number(it.discount) || 0;
    const line = qty * price;
    const discount = (discountPct > 0 ? (line * discountPct) / 100 : 0);
    return sum + discount;
  }, 0);
}

export function calculateTax(amount: number, taxRatePct = 0): number {
  const rate = Number(taxRatePct) || 0;
  return (amount * rate) / 100;
}

export function calculateGrandTotal(items: InvoiceItem[], taxRatePct = 0): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(items);
  const taxable = Math.max(0, subtotal - discount);
  const tax = calculateTax(taxable, taxRatePct);
  const total = Math.max(0, taxable + tax);
  return { subtotal, discount, tax, total };
}

export default { calculateSubtotal, calculateDiscount, calculateTax, calculateGrandTotal };
