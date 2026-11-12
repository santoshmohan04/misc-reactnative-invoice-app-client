import { z } from 'zod';

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const dateField = (label: string) =>
  z
    .union([z.date(), z.string()])
    .refine((v) => v !== undefined && v !== '', { message: `${label} is required` })
    .refine(
      (v) => v instanceof Date || (ISO_DATE.test(v) && !Number.isNaN(Date.parse(v))),
      { message: `${label} must be a valid date (YYYY-MM-DD)` },
    );

export const invoiceItemSchema = z.object({
  _id: z.string().optional(),
  item: z
    .string({ error: 'Please select an item' })
    .regex(OBJECT_ID, 'Please select an item'),
  description: z.string().optional(),
  quantity: z
    .number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be >= 0'),
  discount: z.number().min(0).max(100).optional(),
  subtotal: z.number().min(0).optional(),
});

export const invoiceSchema = z
  .object({
    _id: z.string().optional(),
    customer: z
      .string({ error: 'Please select a customer' })
      .regex(OBJECT_ID, 'Please select a customer'),
    number: z.string().trim().min(8, 'Invoice number must be at least 8 characters'),
    issued: dateField('Issued date'),
    due: dateField('Due date'),
    notes: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    subtotal: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    total: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const issued = new Date(data.issued as string | Date).getTime();
    const due = new Date(data.due as string | Date).getTime();
    if (!Number.isNaN(issued) && !Number.isNaN(due) && due < issued) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['due'],
        message: 'Due date cannot be before the issued date',
      });
    }
  });

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

export default invoiceSchema;
