import { z } from 'zod';

export const invoiceItemSchema = z.object({
  _id: z.string().optional(),
  item: z.string().optional(), // item ID or full item object
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be >= 0'),
  price: z.number().min(0, 'Price must be >= 0'),
  discount: z.number().min(0).max(100).optional(),
  subtotal: z.number().min(0).optional(),
});

export const invoiceSchema = z.object({
  _id: z.string().optional(),
  customer: z.any().optional(), // accepts string ID or full customer object
  number: z.string().min(1, 'Invoice number required'),
  issued: z.date().or(z.string()).optional(),
  due: z.date().or(z.string()).optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

export default invoiceSchema;
