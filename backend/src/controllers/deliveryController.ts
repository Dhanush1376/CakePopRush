import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import DeliveryService from '../services/DeliveryService';
import User from '../models/User';
import Order from '../models/Order';
import { STAFF_ROLES } from '../config/adminConfig';

const getDeliveryActor = (req: Request) => {
  const isStaff = (STAFF_ROLES as readonly string[]).includes(req.user!.role);
  const previewAgentId = req.query.agentId
    ? String(req.query.agentId)
    : req.query.previewAgentId
    ? String(req.query.previewAgentId)
    : undefined;
  const agentId = isStaff && previewAgentId ? previewAgentId : req.user!.id;
  return { isStaff, agentId, previewAgentId };
};

export const getAgentOrders = asyncHandler(async (req: Request, res: Response) => {
  const { isStaff, agentId, previewAgentId } = getDeliveryActor(req);
  const orders = await DeliveryService.getAgentOrders(agentId, isStaff && !previewAgentId);
  res.status(200).json(new ApiResponse(true, 'Assigned delivery orders retrieved', orders));
});

export const getAgentOrderDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isStaff, agentId } = getDeliveryActor(req);
  const order = await DeliveryService.getAgentOrderDetail(id, agentId, isStaff);
  res.status(200).json(new ApiResponse(true, 'Delivery order detail retrieved', order));
});

export const acceptDelivery = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isStaff, agentId } = getDeliveryActor(req);
  const order = await DeliveryService.acceptDelivery(id, agentId, isStaff);
  res.status(200).json(new ApiResponse(true, 'Delivery task accepted successfully', order));
});

export const pickupDelivery = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isStaff, agentId } = getDeliveryActor(req);
  const order = await DeliveryService.pickupDelivery(id, agentId, isStaff);
  res.status(200).json(new ApiResponse(true, 'Order picked up and dispatched successfully. Live tracking enabled.', order));
});

export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isStaff, agentId } = getDeliveryActor(req);
  const { latitude, longitude, heading } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new ApiError(400, 'Valid numeric latitude and longitude are required');
  }

  const parsedHeading = typeof heading === 'number' && !isNaN(heading) ? heading : undefined;
  const location = await DeliveryService.updateLocation(id, agentId, latitude, longitude, isStaff, parsedHeading);
  res.status(200).json(new ApiResponse(true, 'Delivery location updated successfully', location));
});

export const sendDeliveryOtp = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isStaff, agentId } = getDeliveryActor(req);
  const result = await DeliveryService.sendDeliveryOtp(id, agentId, isStaff);
  res.status(200).json(new ApiResponse(true, result.message, { expiresAt: result.expiresAt, otp: result.otp }));
});

export const verifyDeliveryOtp = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isStaff, agentId } = getDeliveryActor(req);
  const { otp, codConfirmed, codAmountCollected } = req.body;

  if (!otp) {
    throw new ApiError(400, 'Customer delivery OTP is required');
  }

  const updatedOrder = await DeliveryService.verifyDeliveryOtpAndComplete(
    id,
    agentId,
    String(otp),
    codConfirmed,
    codAmountCollected ? Number(codAmountCollected) : undefined,
    isStaff
  );

  res.status(200).json(new ApiResponse(true, 'Order delivered successfully and verified via OTP', updatedOrder));
});

export const getDeliveryProfile = asyncHandler(async (req: Request, res: Response) => {
  const { isStaff, agentId, previewAgentId } = getDeliveryActor(req);

  const agent = await User.findById(agentId)
    .select('name email phone avatar isActive role createdAt addresses')
    .lean();

  if (!agent) {
    if (isStaff) {
      const orders = await DeliveryService.getAgentOrders(agentId, true);
      const todayStr = new Date().toISOString().split('T')[0];
      const todayDeliveries = orders.filter((o) => (o.assignedAt ? new Date(o.assignedAt).toISOString().split('T')[0] === todayStr : false)).length;
      const completedDeliveries = orders.filter((o) => o.status === 'DELIVERED').length;
      const activeDeliveries = orders.filter((o) => o.status === 'DISPATCHED' || o.status === 'BEING BAKED' || o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;

      return res.status(200).json(
        new ApiResponse(true, 'Supervisor delivery profile retrieved', {
          _id: req.user!.id,
          name: req.user!.name || 'Delivery Supervisor',
          email: req.user!.email || 'supervisor@cakepoprush.com',
          phone: req.user!.phone || '',
          avatar: '',
          isActive: true,
          role: req.user!.role,
          city: 'Bengaluru',
          createdAt: new Date().toISOString(),
          todayDeliveries,
          completedDeliveries,
          activeDeliveries,
        })
      );
    }
    throw new ApiError(404, 'Delivery partner profile not found');
  }

  const defaultAddr = agent.addresses?.find((addr: any) => addr.isDefault) || agent.addresses?.[0];
  const city = defaultAddr?.city || (agent as any).city || 'Bengaluru';

  const orders = await DeliveryService.getAgentOrders(agentId, isStaff && !previewAgentId);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDeliveries = orders.filter((o) => (o.assignedAt ? new Date(o.assignedAt).toISOString().split('T')[0] === todayStr : false)).length;
  const completedDeliveries = orders.filter((o) => o.status === 'DELIVERED').length;
  const activeDeliveries = orders.filter((o) => o.status === 'DISPATCHED' || o.status === 'BEING BAKED' || o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;

  res.status(200).json(
    new ApiResponse(true, 'Delivery profile retrieved', {
      ...agent,
      city,
      todayDeliveries,
      completedDeliveries,
      activeDeliveries,
    })
  );
});

export const updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { agentId } = getDeliveryActor(req);
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }

  const agent = await User.findById(agentId);
  if (!agent) {
    throw new ApiError(404, 'Delivery partner account not found');
  }

  // Delivery agent can only go offline when there are no active delivery orders
  if (!isActive) {
    const activeOrderCount = await Order.countDocuments({
      'delivery.agentId': agentId,
      status: { $nin: ['DELIVERED', 'CANCELLED', 'REFUNDED'] },
      'delivery.status': { $nin: ['DELIVERED', 'CANCELLED'] },
    });

    if (activeOrderCount > 0) {
      throw new ApiError(
        400,
        `Cannot switch to Offline while you have ${activeOrderCount} active delivery task${activeOrderCount > 1 ? 's' : ''}. Please deliver or complete all ongoing orders first.`
      );
    }
  }

  agent.isActive = isActive;
  await agent.save();

  res.status(200).json(
    new ApiResponse(true, `Duty status updated to ${isActive ? 'Online' : 'Offline'}`, {
      isActive: agent.isActive,
    })
  );
});
