import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { WishlistService } from '../services/wishlistService';

export const getWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const items = await WishlistService.getWishlist(userId);
  res.status(200).json(new ApiResponse(true, 'Wishlist retrieved successfully', items));
});

export const addToWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const { productId, title, price, image, slug } = req.body;
  const items = await WishlistService.addItem(userId, { productId, title, price, image, slug });
  res.status(200).json(new ApiResponse(true, 'Item added to wishlist', items));
});

export const removeFromWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const { productId } = req.params;
  const items = await WishlistService.removeItem(userId, productId);
  res.status(200).json(new ApiResponse(true, 'Item removed from wishlist', items));
});

export const clearWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const items = await WishlistService.clearWishlist(userId);
  res.status(200).json(new ApiResponse(true, 'Wishlist cleared successfully', items));
});

export const mergeWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const { items } = req.body;
  const updatedWishlist = await WishlistService.mergeWishlist(userId, items || []);
  res.status(200).json(new ApiResponse(true, 'Wishlist merged successfully', updatedWishlist));
});
