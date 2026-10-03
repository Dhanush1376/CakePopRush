import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import Order from '../../models/Order';
import User from '../../models/User';
import AuthIdentity from '../../models/AuthIdentity';
import DeliveryService from '../../services/DeliveryService';
import OrderStateMachine from '../../services/orders/OrderStateMachine';

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, paymentStatus, search, page = '1', limit = '20' } = req.query;

  const query: any = {};

  if (status && status !== 'all') {
    const canonical = OrderStateMachine.normalizeState(String(status));
    query.status = canonical;
  }

  if (paymentStatus && paymentStatus !== 'all') {
    query['payment.status'] = paymentStatus;
  }

  if (search) {
    const s = String(search).trim();
    query.$or = [
      { orderNumber: { $regex: s, $options: 'i' } },
      { customerName: { $regex: s, $options: 'i' } },
      { customerEmail: { $regex: s, $options: 'i' } },
      { customerPhone: { $regex: s, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('delivery.agentId', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(query),
  ]);

  // Format orders to match both frontend expectations
  const formatted = orders.map((o) => ({
    _id: o._id,
    id: o._id,
    orderNumber: o.orderNumber,
    customer: o.customerName,
    email: o.customerEmail,
    phone: o.customerPhone || o.delivery?.addressSnapshot?.phone || '',
    itemsCount: o.items?.reduce((sum, item) => sum + item.quantity, 0) || o.items?.length || 0,
    items: o.items,
    total: o.total,
    amount: o.total,
    status: o.status,
    orderStatus: o.status,
    method: o.payment?.method || o.paymentMethod || 'razorpay',
    paymentStatus: o.payment?.status || o.paymentStatus || 'pending',
    payment: o.payment,
    date: new Date(o.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    createdAt: o.createdAt,
    shippingAddress: o.delivery?.addressSnapshot || o.shippingAddress,
    delivery: o.delivery,
    agent: o.delivery?.agentId,
  }));

  res.status(200).json(
    new ApiResponse(true, 'Admin orders retrieved', {
      orders: formatted,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    })
  );
});

export const getOrderStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalOrders, statusCounts, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $nin: ['CANCELLED'] },
          'payment.status': { $in: ['paid', 'COD Collected'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
        },
      },
    ]),
  ]);

  const counts: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    'BEING BAKED': 0,
    DISPATCHED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  statusCounts.forEach((sc) => {
    const canonical = OrderStateMachine.normalizeState(sc._id);
    counts[canonical] = (counts[canonical] || 0) + sc.count;
  });

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  res.status(200).json(
    new ApiResponse(true, 'Order statistics retrieved', {
      totalOrders,
      totalRevenue,
      pending: counts.PENDING,
      confirmed: counts.CONFIRMED,
      processing: counts['BEING BAKED'],
      beingBaked: counts['BEING BAKED'],
      dispatched: counts.DISPATCHED,
      delivered: counts.DELIVERED,
      cancelled: counts.CANCELLED,
    })
  );
});

export const getAdminOrderDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
  })
    .populate('delivery.agentId', 'name email phone avatar')
    .lean();

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Format to match AdminOrderDetail view interface
  const formatted = {
    ...order,
    id: order._id,
    orderId: order.orderNumber || String(order._id),
    customer: typeof order.customer === 'object' && order.customer ? order.customer : {
      id: order.user || order.customer || order._id,
      name: order.customerName || 'Guest Customer',
      email: order.customerEmail || '',
      phone: order.customerPhone || order.delivery?.addressSnapshot?.phone || '',
      ordersCount: 1,
    },
    customerName: order.customerName,
    email: order.customerEmail,
    phone: order.customerPhone || order.delivery?.addressSnapshot?.phone || '',
    address: order.delivery?.addressSnapshot || order.shippingAddress || {
      recipientName: order.customerName || '',
      phone: order.customerPhone || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    price: {
      itemSubtotal: order.subtotal || 0,
      couponDiscount: order.discount || 0,
      deliveryFee: order.deliveryFee || order.shippingFee || 0,
      taxes: (order as any).tax || (order as any).taxes || 0,
      amountPaid: order.total || 0,
    },
    payment: {
      method: (order.payment && typeof order.payment === 'object' ? order.payment.method : order.paymentMethod) || 'Online',
      status: (order.payment && typeof order.payment === 'object' ? order.payment.status : order.paymentStatus) || 'Pending',
      transactionId: (order.payment as any)?.razorpayPaymentId || (order as any).transactionId || 'N/A',
      date: (order as any).createdAt ? new Date((order as any).createdAt).toLocaleDateString('en-IN') : 'N/A',
    },
    date: (order as any).createdAt ? new Date((order as any).createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
    time: (order as any).createdAt ? new Date((order as any).createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '12:00 PM',
    orderType: (order as any).orderType || 'Standard Delivery',
    estimatedDelivery: (order as any).estimatedDelivery || 'Within 45 mins',
    items: order.items?.map((item) => ({
      ...item,
      id: item.productId,
      image: item.image || item.imageSrc || '',
      qty: item.quantity,
      unitPrice: item.price,
      subtotal: (item.price || 0) * (item.quantity || 1),
    })) || [],
    timeline: order.statusHistory?.map((h, i) => ({
      id: `t_${i}`,
      event: `Status: ${h.status}`,
      timestamp: new Date(h.timestamp).toLocaleString('en-IN'),
      note: h.note || '',
    })) || [],
    notes: (order as any).notes || [],
    deliveryAgent: order.delivery?.agentId,
  };

  res.status(200).json(new ApiResponse(true, 'Order detail retrieved', formatted));
});

export const updateAdminOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, agentId } = req.body;

  if (!status) {
    throw new ApiError(400, 'Order status is required');
  }

  const order = await Order.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const targetStatus = OrderStateMachine.normalizeState(status);

  // Validate state transition
  OrderStateMachine.validateTransition(String(order._id), order.status, targetStatus, true);

  if (targetStatus === 'DELIVERED') {
    throw new ApiError(
      400,
      'Orders cannot be directly marked DELIVERED via manual admin status update. Delivery completion strictly requires customer OTP verification by the assigned delivery agent.'
    );
  }

  if (targetStatus === 'DISPATCHED') {
    if (agentId) {
      const agent = await User.findById(agentId);
      if (!agent) {
        throw new ApiError(400, 'Selected delivery agent not found');
      }
      if (!order.delivery) {
        order.delivery = { addressSnapshot: order.shippingAddress, otpAttempts: 0, otpMaxAttempts: 5, isCodCollected: false };
      }
      order.delivery.agentId = agent._id;
      order.delivery.assignedAt = new Date();
    }

    if (!order.delivery?.agentId) {
      throw new ApiError(
        400,
        'Cannot dispatch order without an assigned delivery agent. Please assign a delivery agent first.'
      );
    }

    // Ensure 6-digit OTP is generated and assigned
    if (!order.delivery.customerOtp || !order.delivery.otpHash) {
      const crypto = await import('crypto');
      const rawOtp = crypto.randomInt(100000, 999999).toString();
      const otpHash = DeliveryService.hashDeliveryOtp(String(order._id), rawOtp);
      const otpExpiresAt = DeliveryService.getOtpExpiryDate();

      order.delivery.customerOtp = rawOtp;
      order.delivery.otpHash = otpHash;
      order.delivery.otpExpiresAt = otpExpiresAt;
      order.delivery.otpAttempts = 0;
      order.delivery.otpMaxAttempts = 5;
      order.delivery.otpSentAt = new Date();
    }

    order.delivery.dispatchedAt = order.delivery.dispatchedAt || new Date();
    order.delivery.pickedUpAt = order.delivery.pickedUpAt || new Date();
    order.delivery.status = 'DISPATCHED';

    if (!order.delivery.currentLocation) {
      const destAddr = (order.delivery?.addressSnapshot || order.shippingAddress || {}) as any;
      const destCoords = await DeliveryService.geocodeDestination(destAddr);
      order.delivery.currentLocation = {
        latitude: destCoords.latitude - 0.009,
        longitude: destCoords.longitude - 0.009,
        updatedAt: new Date(),
      };
    }
  }

  const prevStatus = order.status;
  if (targetStatus === 'PENDING') {
    order.internalStatus = 'CONFIRMED'; // reset to initial internal state
    order.status = 'PENDING';
    order.orderStatus = 'PENDING';
  } else if (targetStatus === 'BEING BAKED') {
    order.internalStatus = 'PREPARING';
    order.status = 'BEING BAKED';
    order.orderStatus = 'BEING BAKED';
  } else if (targetStatus === 'DISPATCHED') {
    order.internalStatus = 'DISPATCHED';
    order.status = 'DISPATCHED';
    order.orderStatus = 'DISPATCHED';
  } else if (targetStatus === 'CONFIRMED') {
    order.internalStatus = 'CONFIRMED';
    order.status = 'CONFIRMED';
    order.orderStatus = 'CONFIRMED';
  } else if (targetStatus === 'CANCELLED') {
    order.internalStatus = 'CANCELLED';
    order.status = 'CANCELLED';
    order.orderStatus = 'CANCELLED';
  } else {
    order.status = targetStatus;
    order.orderStatus = targetStatus;
  }

  order.statusHistory.push({
    status: targetStatus,
    timestamp: new Date(),
    note: note || `Status updated from ${prevStatus} to ${targetStatus}`,
    performedBy: req.user?.id || 'admin',
  });

  await order.save();
  res.status(200).json(new ApiResponse(true, `Order status updated to ${targetStatus}`, order));
});

export const approveOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new ApiError(400, `Cannot approve order in ${order.status} state`);
  }

  // Idempotent if already in PREPARING
  if (order.internalStatus === 'PREPARING') {
    res.status(200).json(new ApiResponse(true, 'Order is already approved and preparing', order));
    return;
  }

  // Record the CONFIRMED step first
  order.statusHistory.push({
    status: 'CONFIRMED',
    timestamp: new Date(),
    note: 'Admin approved the order',
    performedBy: req.user?.id || 'admin',
  });

  // Then move to BEING BAKED (PREPARING)
  order.internalStatus = 'PREPARING';
  order.status = 'BEING BAKED';
  order.orderStatus = 'BEING BAKED';

  order.statusHistory.push({
    status: 'PREPARING',
    timestamp: new Date(),
    note: 'Fresh baking started in bakery kitchen.',
    performedBy: req.user?.id || 'admin',
  });

  await order.save();
  res.status(200).json(new ApiResponse(true, 'Order approved and moved to BEING BAKED (PREPARING)', order));
});

export const markOrderReady = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new ApiError(400, `Cannot mark ready for order in ${order.status} state`);
  }

  if (order.status === 'PENDING' || order.orderStatus === 'PENDING') {
    throw new ApiError(400, 'Cannot mark order ready before admin approval. Please approve the order first.');
  }

  // Idempotent if already READY_FOR_PICKUP
  if (order.internalStatus === 'READY_FOR_PICKUP') {
    res.status(200).json(new ApiResponse(true, 'Order is already marked ready for pickup', order));
    return;
  }

  order.internalStatus = 'READY_FOR_PICKUP';
  // Customer status remains BEING BAKED until physically picked up and dispatched
  order.status = 'BEING BAKED';
  order.orderStatus = 'BEING BAKED';

  order.statusHistory.push({
    status: 'READY_FOR_PICKUP',
    timestamp: new Date(),
    note: 'Order prepared and packed. Ready for delivery partner pickup.',
    performedBy: req.user?.id || 'admin',
  });

  await order.save();
  res.status(200).json(new ApiResponse(true, 'Order marked ready for delivery partner pickup', order));
});

export const assignDeliveryAgent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (!agentId) {
    throw new ApiError(400, 'Delivery agent ID is required');
  }

  const order = await DeliveryService.assignOrder(id, agentId, req.user!.id);
  res.status(200).json(new ApiResponse(true, 'Order assigned to delivery agent successfully', order));
});


export const getDeliveryAgents = asyncHandler(async (_req: Request, res: Response) => {
  const agents = await User.find({
    role: { $in: ['delivery_agent', 'DELIVERY_AGENT'] },
  })
    .select('name email phone avatar isLocked isActive createdAt addresses')
    .lean();

  // Aggregate active and delivered orders count for each agent
  const agentStats = await Order.aggregate([
    {
      $match: {
        'delivery.agentId': { $in: agents.map((a) => a._id) },
      },
    },
    {
      $group: {
        _id: {
          agentId: '$delivery.agentId',
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap: Record<string, { active: number; delivered: number }> = {};
  agentStats.forEach((s) => {
    const aId = String(s._id.agentId);
    if (!statsMap[aId]) statsMap[aId] = { active: 0, delivered: 0 };
    if (s._id.status === 'BEING BAKED' || s._id.status === 'CONFIRMED' || s._id.status === 'DISPATCHED') {
      statsMap[aId].active += s.count;
    } else if (s._id.status === 'DELIVERED') {
      statsMap[aId].delivered += s.count;
    }
  });

  const missingAvatarAgentIds = agents.filter((a) => !a.avatar).map((a) => a._id);
  const identityAvatarMap: Record<string, string> = {};
  if (missingAvatarAgentIds.length > 0) {
    const identities = await AuthIdentity.find({
      userId: { $in: missingAvatarAgentIds },
      'metadata.avatar': { $exists: true, $ne: '' },
    }).lean();
    identities.forEach((id: any) => {
      if (id.metadata?.avatar) {
        identityAvatarMap[String(id.userId)] = id.metadata.avatar;
      }
    });
  }

  const formatted = agents.map((a: any) => {
    const defaultAddr = a.addresses?.find((addr: any) => addr.isDefault) || a.addresses?.[0];
    const city = defaultAddr?.city || a.city || '';
    return {
      _id: a._id,
      id: a._id,
      name: a.name || 'Delivery Worker',
      email: a.email,
      phone: a.phone || '',
      avatar: a.avatar || identityAvatarMap[String(a._id)] || '',
      city: city,
      isActive: a.isActive !== false && !a.isLocked,
      activeOrders: statsMap[String(a._id)]?.active || 0,
      deliveredOrders: statsMap[String(a._id)]?.delivered || 0,
      createdAt: a.createdAt,
    };
  });

  res.status(200).json(new ApiResponse(true, 'Delivery agents retrieved', formatted));
});

export const toggleDeliveryAgentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const agent = await User.findOne({
    _id: id,
    role: { $in: ['delivery_agent', 'DELIVERY_AGENT'] },
  });

  if (!agent) {
    throw new ApiError(404, 'Delivery agent not found');
  }

  agent.isActive = typeof isActive === 'boolean' ? isActive : !agent.isActive;
  await agent.save();

  res.status(200).json(
    new ApiResponse(true, `Delivery agent is now ${agent.isActive ? 'Active' : 'Inactive'}`, {
      id: agent._id,
      isActive: agent.isActive,
    })
  );
});

export const createDeliveryAgent = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    throw new ApiError(400, 'Agent name and email are required');
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = await User.findOne({ email: cleanEmail });

  if (user) {
    user.role = 'delivery_agent';
    user.name = name.trim() || user.name;
    if (phone) user.phone = phone.trim();
    user.isActive = true;
    user.isLocked = false;
    user.isVerified = true;
    await user.save();
    return res.status(200).json(new ApiResponse(true, `Delivery agent ${user.name} updated`, user));
  }

  user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : undefined,
    role: 'delivery_agent',
    isActive: true,
    isLocked: false,
    isVerified: true,
  });

  res.status(201).json(new ApiResponse(true, `Delivery agent ${name} added successfully`, user));
});

export const deleteDeliveryAgent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const agent = await User.findOne({
    _id: id,
    role: { $in: ['delivery_agent', 'DELIVERY_AGENT'] },
  });

  if (!agent) {
    throw new ApiError(404, 'Delivery agent not found');
  }

  agent.role = 'customer';
  await agent.save();

  res.status(200).json(new ApiResponse(true, `Delivery agent ${agent.name} removed from roster`, { id: agent._id }));
});

