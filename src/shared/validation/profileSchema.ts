import { z } from 'zod';

export const profileSchema = z.object({
  company: z.string().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  address: z.string().min(1, 'Address is required'),
  base_currency: z.string().min(1, 'Currency is required'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export default profileSchema;
