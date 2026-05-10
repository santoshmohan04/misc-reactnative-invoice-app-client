import { z } from 'zod';

/**
 * Auth form schemas for validation
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Customer form schemas
 */

export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

/**
 * Item form schemas
 */

export const itemSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  description: z
    .string()
    .optional()
    .or(z.literal('')),
  unit_price: z
    .number()
    .positive('Price must be greater than 0'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be greater than 0')
    .optional(),
  unit: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type ItemFormData = z.infer<typeof itemSchema>;

/**
 * Invoice form schemas
 */

export const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  amount: z
    .number()
    .positive('Amount must be greater than 0'),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']),
  issued: z.string().min(1, 'Issue date is required'),
  items: z.array(z.object({
    item_id: z.string(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
  })).optional(),
  notes: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
