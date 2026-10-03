import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').max(100, 'Name is too long').optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .or(z.literal(''))
    .optional(),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number is too long')
    .or(z.literal(''))
    .optional(),
  avatar: z.string().max(2000000, 'Avatar image is too large').optional(),
});

export const createAddressSchema = z.object({
  label: z.string().trim().max(50).optional().default('Home'),
  type: z.enum(['home', 'work', 'other']).optional().default('home'),
  street: z.string().trim().max(255).optional().default(''),
  line1: z.string().trim().min(1, 'Flat, house no., building is required').max(255),
  line2: z.string().trim().max(255).optional().default(''),
  landmark: z.string().trim().max(255).optional().default(''),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State / Province is required').max(100),
  pincode: z.string().trim().min(2, 'Postal / ZIP code is required').max(20),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
