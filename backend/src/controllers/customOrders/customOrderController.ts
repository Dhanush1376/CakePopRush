import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { CustomOrderService } from '../../services/customOrderService';
import {
  createCustomOrderSchema,
  updateCustomOrderSchema,
} from '../../validators/customOrderSchema';

export const createCustomOrder = asyncHandler(async (req: Request, res: Response) => {
  const parseResult = createCustomOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, `Validation error: ${errorDetails}`, 'VALIDATION_ERROR');
  }

  const order = await CustomOrderService.createCustomOrder(parseResult.data, req.user);
  res.status(201).json(new ApiResponse(true, 'Custom order submitted successfully', order));
});

export const getMyCustomOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Authentication required to view custom orders', 'UNAUTHORIZED');
  }

  const orders = await CustomOrderService.getMyCustomOrders(req.user.id);
  res.status(200).json(new ApiResponse(true, 'My custom orders retrieved', orders));
});

export const getCustomOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id?.trim();
  if (!id) {
    throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
  }

  const order = await CustomOrderService.getSingleCustomOrder(id, req.user);
  res.status(200).json(new ApiResponse(true, 'Custom order retrieved', order));
});

export const updateCustomOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Authentication required to edit custom order', 'UNAUTHORIZED');
  }

  const id = req.params.id?.trim();
  if (!id) {
    throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
  }

  const parseResult = updateCustomOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, `Validation error: ${errorDetails}`, 'VALIDATION_ERROR');
  }

  const updatedOrder = await CustomOrderService.updateCustomOrder(
    id,
    parseResult.data,
    req.user
  );

  res.status(200).json(new ApiResponse(true, 'Custom order updated successfully', updatedOrder));
});

export const getCustomOrderConfig = asyncHandler(async (_req: Request, res: Response) => {
  const config = await CustomOrderService.getConfig();
  res.status(200).json(new ApiResponse(true, 'Custom order form configuration retrieved', config));
});

