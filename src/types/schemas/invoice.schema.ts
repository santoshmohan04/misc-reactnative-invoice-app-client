import { z } from 'zod';

export const invoiceItemSchema = z.object({
  _id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity must be >= 0'),
  price: z.number().min(0, 'Price must be >= 0'),
  discount: z.number().min(0).max(100).optional(),
  subtotal: z.number().min(0).optional(),
});

export const invoiceSchema = z.object({
  _id: z.string().optional(),
  customer: z.object({
    _id: z.string(),
    name: z.string().optional(),
  }),
  invoice_number: z.string().min(1, 'Invoice number required'),
  issued_date: z.string().refine((v) => Boolean(Date.parse(v)), { message: 'Invalid date' }),
  due_date: z.string().refine((v) => Boolean(Date.parse(v)), { message: 'Invalid date' }),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0).optional(),
  discount_total: z.number().min(0).optional(),
  tax_total: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

export default invoiceSchema;
