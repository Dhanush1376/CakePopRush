import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { CustomOrderService } from '../../services/customOrderService';
import {
  adminUpdateCustomOrderStatusSchema,
  adminUpdateCustomOrderNotesSchema,
  adminCustomOrderConfigSchema,
} from '../../validators/customOrderSchema';

export const getAdminCustomOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await CustomOrderService.adminGetCustomOrders(req.query);
  // Return items array as data for seamless integration with AdminCustomOrders table
  res.status(200).json(new ApiResponse(true, 'Custom orders retrieved successfully', result.items));
});

export const getAdminCustomOrderStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await CustomOrderService.adminGetStats();
  res.status(200).json(new ApiResponse(true, 'Custom order statistics retrieved', stats));
});

export const getAdminCustomOrderById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id?.trim();
  if (!id) {
    throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
  }

  const order = await CustomOrderService.getSingleCustomOrder(id, req.user);
  res.status(200).json(new ApiResponse(true, 'Custom order retrieved', order));
});

export const updateAdminCustomOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id?.trim();
  if (!id) {
    throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
  }

  const parseResult = adminUpdateCustomOrderStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, `Validation error: ${errorDetails}`, 'VALIDATION_ERROR');
  }

  const updatedOrder = await CustomOrderService.adminUpdateStatus(
    id,
    parseResult.data.status,
    parseResult.data.note,
    req.user
  );

  res.status(200).json(new ApiResponse(true, 'Custom order status updated successfully', updatedOrder));
});

export const updateAdminCustomOrderNotes = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id?.trim();
  if (!id) {
    throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
  }

  const parseResult = adminUpdateCustomOrderNotesSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, `Validation error: ${errorDetails}`, 'VALIDATION_ERROR');
  }

  const updatedOrder = await CustomOrderService.adminUpdateNotes(
    id,
    parseResult.data,
    req.user
  );

  res.status(200).json(new ApiResponse(true, 'Custom order notes updated successfully', updatedOrder));
});

export const deleteAdminCustomOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id?.trim();
  if (!id) {
    throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
  }

  const result = await CustomOrderService.adminDeleteOrder(id, req.user);
  res.status(200).json(new ApiResponse(true, result.message, { id }));
});

export const getAdminCustomOrderConfig = asyncHandler(async (_req: Request, res: Response) => {
  const config = await CustomOrderService.getAdminConfig();
  res.status(200).json(new ApiResponse(true, 'Admin custom order form config retrieved', config));
});

export const saveAdminCustomOrderConfigDraft = asyncHandler(async (req: Request, res: Response) => {
  const content = req.body?.content || req.body;
  const parseResult = adminCustomOrderConfigSchema.safeParse(content);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, `Validation error: ${errorDetails}`, 'INVALID_CONFIG');
  }

  const draft = await CustomOrderService.saveConfigDraft(parseResult.data, req.user);
  res.status(200).json(new ApiResponse(true, 'Configuration draft saved successfully', draft));
});

export const publishAdminCustomOrderConfig = asyncHandler(async (req: Request, res: Response) => {
  const content = req.body?.content || req.body;
  const parseResult = adminCustomOrderConfigSchema.safeParse(content);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, `Validation error: ${errorDetails}`, 'INVALID_CONFIG');
  }

  const published = await CustomOrderService.publishConfig(parseResult.data, req.user);
  res.status(200).json(new ApiResponse(true, 'Configuration version published live successfully', published));
});

