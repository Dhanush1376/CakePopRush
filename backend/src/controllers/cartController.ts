import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { CartService } from '../services/cartService';

export const getCartController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const cart = await CartService.getCart(userId);
  res.status(200).json(new ApiResponse(true, 'Cart retrieved successfully', cart));
});

export const addToCartController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const { productId, quantity, variantId, variantName, customization } = req.body;
  const cart = await CartService.addItem(userId, {
    productId,
    quantity,
    variantId,
    variantName,
    customization,
  });

  res.status(200).json(new ApiResponse(true, 'Item added to cart', cart));
});

export const updateQuantityController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await CartService.updateQuantity(userId, itemId, quantity);
  res.status(200).json(new ApiResponse(true, 'Cart updated', cart));
});

export const removeItemController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const { itemId } = req.params;
  const cart = await CartService.removeItem(userId, itemId);
  res.status(200).json(new ApiResponse(true, 'Item removed from cart', cart));
});

export const clearCartController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const cart = await CartService.clearCart(userId);
  res.status(200).json(new ApiResponse(true, 'Cart cleared', cart));
});

export const mergeCartController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const { items } = req.body;
  const cart = await CartService.mergeCart(userId, items || []);
  res.status(200).json(new ApiResponse(true, 'Cart merged successfully', cart));
});
