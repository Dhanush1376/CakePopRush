import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99').optional().default(1),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  customization: z.any().optional(),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99, 'Quantity cannot exceed 99'),
});

export const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().optional(),
      product: z.any().optional(),
      id: z.string().optional(),
      quantity: z.number().optional().default(1),
      variantId: z.string().optional(),
      variantName: z.string().optional(),
      customization: z.any().optional(),
    })
  ).default([]),
});
