import { z } from 'zod';

export const addWishlistItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  title: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  slug: z.string().optional(),
});

export const mergeWishlistSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      title: z.string().optional(),
      price: z.number().optional(),
      image: z.string().optional(),
      slug: z.string().optional(),
      addedAt: z.union([z.string(), z.date()]).optional(),
    })
  ).default([]),
});
