import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import User from '../../models/User';
import AdminUserService from '../../services/AdminUserService';

export const getAdminMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await User.findById(userId).lean();

  if (!user) {
    throw new ApiError(404, 'Admin account not found');
  }

  const roleDisplay =
    user.role === 'super_admin' || user.role === 'owner'
      ? 'Super Admin'
      : user.role === 'admin' || user.role === 'main_admin'
      ? 'Administrator'
      : user.role === 'editor'
      ? 'Editor'
      : user.role === 'viewer'
      ? 'Viewer'
      : 'Customer';

  res.status(200).json(
    new ApiResponse(true, 'Admin profile retrieved', {
      id: String(user._id),
      _id: String(user._id),
      name: user.name || 'Admin User',
      email: user.email,
      phone: user.phone || '',
      role: roleDisplay,
      rawRole: user.role,
      avatar: user.avatar || null,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    })
  );
});

export const getAdminUsers = asyncHandler(async (req: Request, res: Response) => {
  const actorId = req.user!.id;
  const { search, role, status, page, limit } = req.query;

  const result = await AdminUserService.getUsers({
    actorId,
    search: search as string,
    role: role as string,
    status: status as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10,
  });

  res.status(200).json(new ApiResponse(true, 'Users retrieved successfully', result));
});

export const getAdminUserStats = asyncHandler(async (_req: Request, res: Response) => {
  const kpis = await AdminUserService.getUserStats();
  res.status(200).json(new ApiResponse(true, 'User KPI stats retrieved', kpis));
});

export const updateAdminRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const actorId = req.user!.id;
  const actorRole = req.user!.role;

  if (!role) {
    throw new ApiError(400, 'Role is required');
  }

  const updatedUser = await AdminUserService.updateUserRole(actorId, actorRole, id, role);
  res.status(200).json(new ApiResponse(true, 'User role updated successfully', updatedUser));
});

export const updateAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const actorId = req.user!.id;
  const actorRole = req.user!.role;

  if (!status || !['active', 'inactive'].includes(status.toLowerCase())) {
    throw new ApiError(400, 'Status must be either "active" or "inactive"');
  }

  const updatedUser = await AdminUserService.updateUserStatus(actorId, actorRole, id, status.toLowerCase() as any);
  res.status(200).json(new ApiResponse(true, `User marked as ${status} successfully`, updatedUser));
});

export const removeAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actorId = req.user!.id;
  const actorRole = req.user!.role;

  const updatedUser = await AdminUserService.removeAdmin(actorId, actorRole, id);
  res.status(200).json(new ApiResponse(true, 'Admin privileges revoked successfully', updatedUser));
});
