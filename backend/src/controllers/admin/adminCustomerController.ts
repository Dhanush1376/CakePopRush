import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import AdminCustomerService from '../../services/AdminCustomerService';

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    status,
    location,
    date,
    orders,
    spent,
    minSpend,
    maxSpend,
    tier,
    cart,
    wishlist,
    role,
    custom,
    sortBy,
    sortOrder,
    page,
    limit,
  } = req.query;

  const result = await AdminCustomerService.getCustomers({
    search: search as string,
    status: status as string,
    location: location as string,
    date: date as string,
    orders: orders as string,
    spent: spent as string,
    minSpend: minSpend ? parseFloat(minSpend as string) : undefined,
    maxSpend: maxSpend ? parseFloat(maxSpend as string) : undefined,
    tier: tier as string,
    cart: cart as string,
    wishlist: wishlist as string,
    role: role as string,
    custom: custom as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10,
  });

  res.status(200).json(
    new ApiResponse(true, 'Customers retrieved successfully', {
      customers: result.customers,
      total: result.total,
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  );
});

export const getCustomerStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await AdminCustomerService.getCustomerStats();
  res.status(200).json(new ApiResponse(true, 'Customer statistics retrieved successfully', stats));
});

export const getCustomer360 = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = await AdminCustomerService.getCustomer360(id);
  res.status(200).json(new ApiResponse(true, 'Customer profile retrieved successfully', profile));
});

export const getCustomerOrders = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = await AdminCustomerService.getCustomer360(id);
  res.status(200).json(new ApiResponse(true, 'Customer orders retrieved successfully', profile.orders));
});

export const getCustomerCustomOrders = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = await AdminCustomerService.getCustomer360(id);
  res.status(200).json(new ApiResponse(true, 'Customer custom orders retrieved successfully', profile.customOrders));
});

export const updateCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const result = await AdminCustomerService.updateCustomerStatus(id, status, req.user);
  res.status(200).json(new ApiResponse(true, 'Customer status updated successfully', result));
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const result = await AdminCustomerService.deleteCustomer(id, reason, req.user);
  res.status(200).json(new ApiResponse(true, 'Customer account deleted successfully', result));
});

export const bulkUpdateCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !status) {
    throw new ApiError(400, 'Invalid request: customer IDs array and status are required');
  }

  const result = await AdminCustomerService.bulkUpdateStatus(ids, status, req.user);
  res.status(200).json(new ApiResponse(true, 'Bulk status updated successfully', result));
});

export const bulkDeleteCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Invalid request: customer IDs array is required');
  }

  const result = await AdminCustomerService.bulkDelete(ids, req.user);
  res.status(200).json(new ApiResponse(true, 'Customers deleted successfully', result));
});

export const getCustomerNotes = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const notes = await AdminCustomerService.getCustomerNotes(id);
  res.status(200).json(new ApiResponse(true, 'Customer notes retrieved successfully', notes));
});

export const addCustomerNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, tags, isPinned } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, 'Note content is required');
  }

  const note = await AdminCustomerService.addCustomerNote(id, content.trim(), tags || [], isPinned || false, req.user);
  res.status(201).json(new ApiResponse(true, 'Note added successfully', note));
});

export const updateCustomerNote = asyncHandler(async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const note = await AdminCustomerService.updateCustomerNote(noteId, req.body);
  res.status(200).json(new ApiResponse(true, 'Note updated successfully', note));
});

export const deleteCustomerNote = asyncHandler(async (req: Request, res: Response) => {
  const { noteId } = req.params;
  await AdminCustomerService.deleteCustomerNote(noteId);
  res.status(200).json(new ApiResponse(true, 'Note deleted successfully', { noteId }));
});
