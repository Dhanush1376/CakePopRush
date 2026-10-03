import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import OrderCheckoutService from '../services/orders/OrderCheckoutService';
import PaymentVerificationService from '../services/PaymentVerificationService';
import DeliveryService from '../services/DeliveryService';
import Order from '../models/Order';
import OrderStateMachine from '../services/orders/OrderStateMachine';
import { STAFF_ROLES } from '../config/adminConfig';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const idempotencyKey = (
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    req.body?.idempotencyKey
  ) as string;

  const userId = req.user!.id;
  const orderData = { ...req.body, idempotencyKey };

  const result = await OrderCheckoutService.createOrder(userId, orderData);
  res.status(201).json(new ApiResponse(true, 'Order created successfully', result));
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const order = await PaymentVerificationService.verifyPayment(
    req.body,
    req.user!.id,
    req.user!.role
  );
  res.status(200).json(new ApiResponse(true, 'Payment verified successfully', order));
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const orders = await Order.find({
    $or: [{ user: userId }, { customer: userId }],
  })
    .select('+delivery.customerOtp')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = orders.map((o) => {
    const customerStatus = OrderStateMachine.toCustomerStatus(o.internalStatus || o.status);
    const isDispatched = customerStatus === 'DISPATCHED';

    return {
      ...o,
      status: customerStatus,
      orderStatus: customerStatus,
      // Delivery OTP is visible to the customer ONLY when order is DISPATCHED
      deliveryOtp: isDispatched ? o.delivery?.customerOtp : undefined,
    };
  });

  res.status(200).json(new ApiResponse(true, 'Orders retrieved successfully', formatted));
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findOne(DeliveryService.getOrderQuery(id))
    .select('+delivery.customerOtp')
    .populate('delivery.agentId', 'name phone avatar rating')
    .lean();

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Authorization check: customer owner or staff
  const isOwner =
    req.user &&
    ((order.user && String(order.user) === String(req.user.id)) ||
      (order.customer && String(order.customer) === String(req.user.id)));
  const isStaff = req.user && (STAFF_ROLES as readonly string[]).includes(req.user.role);

  if (!isOwner && !isStaff) {
    throw new ApiError(403, 'You are not authorized to view this order');
  }

  const customerStatus = OrderStateMachine.toCustomerStatus(order.internalStatus || order.status);
  const isDispatched = customerStatus === 'DISPATCHED';

  const formatted = {
    ...order,
    status: customerStatus,
    orderStatus: customerStatus,
    deliveryOtp: isOwner && isDispatched ? order.delivery?.customerOtp : undefined,
  };

  res.status(200).json(new ApiResponse(true, 'Order fetched successfully', formatted));
});

export const getOrderTracking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : '';
  const isStaff = req.user ? (STAFF_ROLES as readonly string[]).includes(req.user.role) : false;

  const tracking = await DeliveryService.getOrderTracking(id, userId, isStaff);
  res.status(200).json(new ApiResponse(true, 'Live tracking retrieved successfully', tracking));
});
