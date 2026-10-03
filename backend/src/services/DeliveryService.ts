import crypto from 'crypto';
import mongoose from 'mongoose';
import Order, { IOrder } from '../models/Order';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';
import { Fast2SmsProvider, MockSmsProvider } from './SmsProviderService';
import EmailService from './EmailService';
import { isDeliveryAgentRole } from '../config/adminConfig';
import OrderStateMachine from './orders/OrderStateMachine';

export class DeliveryService {
  /**
   * Retrieves the dedicated OTP_SECRET.
   * OTP_SECRET is strictly mandatory across all environments.
   * Throws a fatal configuration error immediately if missing.
   * Does NOT fall back to JWT_SECRET or any hardcoded secret.
   */
  static getOtpSecret(): string {
    const secret = process.env.OTP_SECRET;
    if (!secret) {
      throw new Error(
        '[FATAL SECURITY CONFIG] OTP_SECRET environment variable is mandatory and missing. Configure OTP_SECRET in your environment or .env file before starting the application.'
      );
    }
    return secret;
  }

  /**
   * Generates HMAC-SHA256 hash using a dedicated server-side secret and order-specific salt.
   * HMAC-SHA256 protects OTP hashes from offline guessing while the HMAC secret remains secret.
   * It does not mathematically eliminate brute force if the secret itself is compromised.
   * The 5-attempt server-side verification lock is a mandatory defense-in-depth layer.
   */
  static hashDeliveryOtp(orderId: string, otp: string): string {
    const secret = DeliveryService.getOtpSecret();
    return crypto.createHmac('sha256', secret).update(`${orderId}:${otp.trim()}`).digest('hex');
  }

  /**
   * Computes the delivery OTP expiration timestamp.
   * Configurable via DELIVERY_OTP_EXPIRY_MINUTES env var (defaults to 60 minutes).
   */
  static getOtpExpiryDate(): Date {
    const expiryMinutes = parseInt(process.env.DELIVERY_OTP_EXPIRY_MINUTES || '60', 10);
    return new Date(Date.now() + expiryMinutes * 60 * 1000);
  }

  /**
   * Helper to resolve an order by either MongoDB ObjectId or Order Number (e.g., CPR-10482, #CPR-10482)
   */
  static getOrderQuery(orderId: string) {
    const trimmed = String(orderId || '').trim();
    const cleanNum = trimmed.replace(/^#/, '');
    const isObjectId = mongoose.Types.ObjectId.isValid(trimmed) && /^[0-9a-fA-F]{24}$/.test(trimmed);

    if (isObjectId) {
      return {
        $or: [
          { _id: new mongoose.Types.ObjectId(trimmed) },
          { orderNumber: trimmed },
          { orderNumber: cleanNum },
          { orderNumber: `#${cleanNum}` },
        ],
      };
    }

    return {
      $or: [
        { orderNumber: trimmed },
        { orderNumber: cleanNum },
        { orderNumber: `#${cleanNum}` },
      ],
    };
  }

  /**
   * Admin: Assigns an order to an available delivery agent.
   * Note: ASSIGNMENT != DISPATCH!
   * The order moves to internal substate ASSIGNED.
   * Customer status is 'BEING BAKED'.
   */
  static async assignOrder(orderId: string, agentId: string, actorId: string): Promise<IOrder> {
    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId));
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new ApiError(400, `Cannot assign delivery agent to order in ${order.status} state`);
    }

    if (order.status === 'PENDING' || order.orderStatus === 'PENDING') {
      throw new ApiError(400, 'Cannot assign delivery agent to order in PENDING state. Order must be approved by admin first.');
    }

    const agent = await User.findById(agentId);
    if (!agent) {
      throw new ApiError(404, 'Delivery agent account not found');
    }

    if (!isDeliveryAgentRole(agent.role)) {
      throw new ApiError(400, `Selected user (${agent.email || agent.name}) does not have the DELIVERY_AGENT role`);
    }

    if (agent.isActive === false || agent.isLocked) {
      throw new ApiError(400, 'Selected delivery agent is currently inactive or locked');
    }

    // Update assignment details
    order.delivery.agentId = agent._id;
    order.delivery.assignedAt = new Date();
    order.delivery.status = 'ASSIGNED';
    order.internalStatus = 'ASSIGNED';
    
    // Customer status remains BEING BAKED
    order.status = 'BEING BAKED';
    order.orderStatus = 'BEING BAKED';

    order.statusHistory.push({
      status: 'ASSIGNED',
      timestamp: new Date(),
      note: `Assigned to delivery partner: ${agent.name || agent.email}`,
      performedBy: actorId,
    });

    await order.save();
    logger.info(`[DELIVERY ASSIGN] Order ${order.orderNumber} assigned to agent ${agent._id} (${agent.name})`);

    return order;
  }

  /**
   * Delivery Agent: Accepts the assigned delivery task.
   * Moves internal substate: ASSIGNED -> AGENT_ACCEPTED.
   * Customer status remains 'BEING BAKED'.
   */
  static async acceptDelivery(orderId: string, agentId: string, isStaff = false): Promise<IOrder> {
    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId));
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // IDOR Protection: authenticated agent must be the assigned agent (or staff supervisor)
    const isAssigned = order.delivery?.agentId && String(order.delivery.agentId) === String(agentId);
    if (!isAssigned && !isStaff) {
      throw new ApiError(403, 'Access denied: You are not assigned to this delivery task');
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new ApiError(400, `Cannot accept order in ${order.status} state`);
    }

    // Idempotent if already accepted
    if (order.delivery.status === 'ACCEPTED' || order.internalStatus === 'AGENT_ACCEPTED') {
      return order;
    }

    order.delivery.status = 'ACCEPTED';
    order.delivery.acceptedAt = new Date();
    order.internalStatus = 'AGENT_ACCEPTED';

    order.statusHistory.push({
      status: 'AGENT_ACCEPTED',
      timestamp: new Date(),
      note: `Delivery task accepted by agent ${agentId}`,
      performedBy: agentId,
    });

    await order.save();
    logger.info(`[DELIVERY ACCEPT] Order ${order.orderNumber} accepted by agent ${agentId}`);

    await order.populate('user', 'name email phone avatar');
    await order.populate('customer', 'name email phone avatar');

    return order;
  }

  /**
   * Delivery Agent: Confirms physical pickup from bakery kitchen.
   * THIS IS THE CRITICAL DISPATCH EVENT!
   * 1. Transitions internalStatus to 'DISPATCHED'
   * 2. Customer status becomes 'DISPATCHED'
   * 3. Generates cryptographically secure 6-digit Delivery OTP on server
   * 4. Enables live customer tracking session
   */
  static async pickupDelivery(orderId: string, agentId: string, isStaff = false): Promise<IOrder> {
    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId)).select('+delivery.otpHash +delivery.customerOtp');
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // IDOR Protection: authenticated agent must be the assigned agent (or staff supervisor)
    const isAssigned = order.delivery?.agentId && String(order.delivery.agentId) === String(agentId);
    if (!isAssigned && !isStaff) {
      throw new ApiError(403, 'Access denied: You are not assigned to this delivery task');
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new ApiError(400, `Cannot pickup order in ${order.status} state`);
    }

    if (order.status === 'PENDING' || order.orderStatus === 'PENDING') {
      throw new ApiError(400, 'Cannot pickup order in PENDING state. Order must be approved by admin and prepared first.');
    }

    // Idempotent if already dispatched
    if (order.status === 'DISPATCHED' && order.delivery.customerOtp) {
      return order;
    }

    // 1. Generate cryptographically secure 6-digit random OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = DeliveryService.hashDeliveryOtp(String(order._id), rawOtp);
    const otpExpiresAt = DeliveryService.getOtpExpiryDate();

    // 2. Set dispatch state
    const now = new Date();
    order.delivery.pickedUpAt = now;
    order.delivery.dispatchedAt = now;
    order.delivery.status = 'DISPATCHED';
    order.internalStatus = 'DISPATCHED';
    order.status = 'DISPATCHED';
    order.orderStatus = 'DISPATCHED';

    // 3. Store secure OTP (hash for verification, raw for customer retrieval)
    order.delivery.customerOtp = rawOtp;
    order.delivery.otpHash = otpHash;
    order.delivery.otpExpiresAt = otpExpiresAt;
    order.delivery.otpAttempts = 0;
    order.delivery.otpMaxAttempts = 5;
    order.delivery.otpSentAt = now;

    // 4. Initial store coordinates for live tracking (localized to customer destination area)
    const destAddrForPickup = (order.delivery?.addressSnapshot || order.shippingAddress || {}) as any;
    const destCoordsForPickup = await DeliveryService.geocodeDestination(destAddrForPickup);
    order.delivery.currentLocation = {
      latitude: destCoordsForPickup.latitude - 0.009,
      longitude: destCoordsForPickup.longitude - 0.009,
      updatedAt: now,
    };

    order.statusHistory.push({
      status: 'DISPATCHED',
      timestamp: now,
      note: `Order picked up and dispatched by delivery partner ${agentId}. Live tracking enabled and Delivery OTP generated.`,
      performedBy: agentId,
    });

    await order.save();
    logger.info(`[ORDER DISPATCHED] Order ${order.orderNumber} picked up by agent ${agentId}. Secure OTP generated.`);

    // Dispatch SMS/Email notifications
    const recipientPhone = order.delivery?.addressSnapshot?.phone || order.customerPhone;
    const recipientEmail = order.customerEmail || order.delivery?.addressSnapshot?.email;

    if (recipientPhone) {
      const smsProvider = process.env.SMS_PROVIDER === 'fast2sms' ? new Fast2SmsProvider() : new MockSmsProvider();
      try {
        await smsProvider.sendOtp(recipientPhone, rawOtp);
      } catch (err: any) {
        logger.error(`[DELIVERY OTP] SMS dispatch failed for order ${order.orderNumber}: ${err.message}`);
      }
    }

    if (recipientEmail) {
      try {
        await EmailService.sendDeliveryOtpEmail({
          toEmail: recipientEmail,
          customerName: order.customerName || 'Valued Customer',
          orderNumber: order.orderNumber,
          otp: rawOtp,
        });
      } catch (err: any) {
        logger.error(`[DELIVERY OTP] Email dispatch failed for order ${order.orderNumber}: ${err.message}`);
      }
    }

    await order.populate('user', 'name email phone avatar');
    await order.populate('customer', 'name email phone avatar');

    return order;
  }

  /**
   * Delivery Agent: Pushes GPS coordinates during active delivery.
   * Scoped to assigned agent and active dispatched delivery.
   */
  static async updateLocation(
    orderId: string,
    agentId: string,
    latitude: number,
    longitude: number,
    isStaff = false,
    heading?: number
  ): Promise<{ latitude: number; longitude: number; heading?: number; updatedAt: Date }> {
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      throw new ApiError(400, 'Invalid latitude (-90 to 90)');
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      throw new ApiError(400, 'Invalid longitude (-180 to 180)');
    }

    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId));
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // IDOR Protection: authenticated agent must be the assigned agent (or staff supervisor)
    const isAssigned = order.delivery?.agentId && String(order.delivery.agentId) === String(agentId);
    if (!isAssigned && !isStaff) {
      throw new ApiError(403, 'Access denied: You are not assigned to deliver this order');
    }

    // Only allow location updates during active dispatch
    if (order.status !== 'DISPATCHED' && order.internalStatus !== 'OUT_FOR_DELIVERY' && order.internalStatus !== 'ARRIVED') {
      throw new ApiError(400, `Cannot update location for order in ${order.status} state. Location tracking only active during dispatch.`);
    }

    const now = new Date();
    const cleanHeading = typeof heading === 'number' && !isNaN(heading) ? (Math.round(heading) % 360) : (order.delivery?.currentLocation?.heading || 0);

    order.delivery.currentLocation = {
      latitude,
      longitude,
      heading: cleanHeading,
      updatedAt: now,
    };

    await order.save();
    return order.delivery.currentLocation;
  }

  /**
   * Delivery Agent: Retrieves only orders assigned to the authenticated delivery agent.
   * Identity is derived strictly from the authenticated session (IDOR protection).
   * Plaintext OTP and OTP hash are NEVER returned.
   */
  static async getAgentOrders(agentId: string, isStaffWithoutAgent = false) {
    const isObjectId = mongoose.Types.ObjectId.isValid(agentId) && /^[0-9a-fA-F]{24}$/.test(agentId);

    let query: any;
    if (isStaffWithoutAgent) {
      query = {
        $or: [
          { 'delivery.agentId': { $exists: true, $ne: null } },
          { status: { $in: ['DISPATCHED', 'DELIVERED', 'BEING BAKED', 'PROCESSING'] } },
        ],
      };
    } else if (isObjectId) {
      query = { 'delivery.agentId': new mongoose.Types.ObjectId(agentId) };
    } else {
      query = { 'delivery.agentId': agentId };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .select('-delivery.otpHash -delivery.customerOtp')
      .populate('user', 'name email phone avatar')
      .populate('customer', 'name email phone avatar')
      .lean();

    return orders.map((o) => {
      const customerObj = (o.customer as any) || (o.user as any);
      return {
        _id: o._id,
        id: o._id,
        orderNumber: o.orderNumber,
        status: o.status,
        orderStatus: o.status,
        internalStatus: o.internalStatus || (o.status === 'DELIVERED' ? 'DELIVERED' : o.status === 'DISPATCHED' ? 'DISPATCHED' : 'ASSIGNED'),
        deliveryStatus: o.delivery?.status || 'ASSIGNED',
        total: o.total,
        itemCount: o.items?.reduce((sum, item) => sum + item.quantity, 0) || o.items?.length || 0,
        customerName: o.customerName || o.delivery?.addressSnapshot?.recipientName || customerObj?.name || 'Customer',
        customerPhone: o.delivery?.addressSnapshot?.phone || o.customerPhone || customerObj?.phone || '',
        customerEmail: o.customerEmail || o.delivery?.addressSnapshot?.email || customerObj?.email || '',
        customerAvatar: customerObj?.avatar || '',
        customer: customerObj,
        items: o.items || [],
        address: o.delivery?.addressSnapshot || o.shippingAddress,
        shippingAddress: o.shippingAddress || o.delivery?.addressSnapshot,
        delivery: o.delivery,
        paymentMethod: o.payment?.method || o.paymentMethod || 'razorpay',
        paymentStatus: o.payment?.status || o.paymentStatus || 'pending',
        isCod: (o.payment?.method || o.paymentMethod) === 'cod',
        createdAt: o.createdAt,
        assignedAt: o.delivery?.assignedAt,
        acceptedAt: o.delivery?.acceptedAt,
        pickedUpAt: o.delivery?.pickedUpAt,
        dispatchedAt: o.delivery?.dispatchedAt,
        deliveredAt: o.delivery?.deliveredAt,
        isCodCollected: o.delivery?.isCodCollected || false,
      };
    });
  }

  /**
   * Delivery Agent: Retrieves detailed view of an assigned order.
   * Strictly enforces agent ownership (IDOR protection) or staff supervisor privilege.
   * Plaintext OTP and OTP hash are NEVER returned.
   */
  static async getAgentOrderDetail(orderId: string, agentId: string, isStaff = false) {
    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId))
      .select('-delivery.otpHash -delivery.customerOtp')
      .populate('user', 'name email phone avatar')
      .populate('customer', 'name email phone avatar')
      .lean();
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const isAssigned = order.delivery?.agentId && String(order.delivery.agentId) === String(agentId);
    if (!isAssigned && !isStaff) {
      throw new ApiError(403, 'Access denied: You are not assigned to deliver this order');
    }

    const customerObj = (order.customer as any) || (order.user as any);
    const customerAvatar = customerObj?.avatar || '';

    return {
      ...order,
      customerAvatar,
      customer: customerObj || order.customer,
    };
  }

  /**
   * Re-sends Delivery OTP to customer upon request (e.g. if SMS didn't arrive).
   */
  static async sendDeliveryOtp(orderId: string, agentId: string, isStaff = false) {
    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId)).select('+delivery.otpHash +delivery.customerOtp');
    if (!order) throw new ApiError(404, 'Order not found');

    const isAssigned = order.delivery?.agentId && String(order.delivery.agentId) === String(agentId);
    if (!isAssigned && !isStaff) {
      throw new ApiError(403, 'Access denied: You are not assigned to deliver this order');
    }

    if (order.status !== 'DISPATCHED' && order.status !== 'PROCESSING' && order.status !== 'BEING BAKED') {
      throw new ApiError(400, `Cannot send delivery OTP for order with status: ${order.status}. Order must be in active delivery state.`);
    }

    // Cooldown check: prevent spamming resend within 45 seconds
    if (order.delivery.otpSentAt) {
      const secondsSinceLastSend = (Date.now() - new Date(order.delivery.otpSentAt).getTime()) / 1000;
      if (secondsSinceLastSend < 45) {
        throw new ApiError(429, `Please wait ${Math.ceil(45 - secondsSinceLastSend)} seconds before requesting a new OTP.`);
      }
    }

    // Cryptographically secure 6-digit random OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = DeliveryService.hashDeliveryOtp(String(order._id), rawOtp);
    const otpExpiresAt = DeliveryService.getOtpExpiryDate();

    order.delivery.customerOtp = rawOtp;
    order.delivery.otpHash = otpHash;
    order.delivery.otpExpiresAt = otpExpiresAt;
    order.delivery.otpAttempts = 0;
    order.delivery.otpMaxAttempts = 5;
    order.delivery.otpSentAt = new Date();

    await order.save();

    const recipientPhone = order.delivery?.addressSnapshot?.phone || order.customerPhone;
    const recipientEmail = order.customerEmail || order.delivery?.addressSnapshot?.email;

    if (recipientPhone) {
      const smsProvider = process.env.SMS_PROVIDER === 'fast2sms' ? new Fast2SmsProvider() : new MockSmsProvider();
      try {
        await smsProvider.sendOtp(recipientPhone, rawOtp);
      } catch (err: any) {
        logger.error(`[DELIVERY OTP] SMS dispatch failed for order ${order.orderNumber}: ${err.message}`);
      }
    }

    if (recipientEmail) {
      try {
        await EmailService.sendDeliveryOtpEmail({
          toEmail: recipientEmail,
          customerName: order.customerName || 'Valued Customer',
          orderNumber: order.orderNumber,
          otp: rawOtp,
        });
      } catch (err: any) {
        logger.error(`[DELIVERY OTP] Email dispatch failed for order ${order.orderNumber}: ${err.message}`);
      }
    }

    logger.info(`[DELIVERY OTP] Re-sent delivery verification OTP for order ${order.orderNumber}`);

    return {
      success: true,
      message: 'Delivery verification OTP has been sent to the customer.',
      expiresAt: otpExpiresAt,
      otp: (process.env.NODE_ENV === 'development' || isStaff) ? rawOtp : undefined,
    };
  }

  /**
   * Verifies the customer delivery OTP and atomically transitions the order to DELIVERED.
   * If COD, enforces confirmation that cash was collected.
   * Closes tracking and records audit history.
   */
  static async verifyDeliveryOtpAndComplete(
    orderId: string,
    agentId: string,
    otpInput: string,
    codConfirmed?: boolean,
    codAmountCollected?: number,
    isStaff = false
  ): Promise<IOrder> {
    if (!otpInput || typeof otpInput !== 'string' || otpInput.trim().length !== 6) {
      throw new ApiError(400, 'A valid 6-digit delivery OTP is required');
    }

    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId)).select('+delivery.otpHash +delivery.customerOtp');
    if (!order) throw new ApiError(404, 'Order not found');

    // 1. Agent Ownership Check (IDOR) or Staff Supervisor privilege
    const isAssigned = order.delivery?.agentId && String(order.delivery.agentId) === String(agentId);
    if (!isAssigned && !isStaff) {
      throw new ApiError(403, 'Access denied: You are not assigned to complete this order');
    }

    // 2. Order Status Check (Only active delivery orders can be delivered)
    if (order.status !== 'DISPATCHED' && order.status !== 'PROCESSING' && order.status !== 'BEING BAKED') {
      if (order.status === 'DELIVERED') {
        throw new ApiError(409, 'This order has already been delivered');
      }
      throw new ApiError(400, `Order in status ${order.status} cannot be delivered. Order must be in active delivery state.`);
    }

    // 3. COD Validation
    const isCod = (order.payment?.method || order.paymentMethod) === 'cod';
    if (isCod) {
      if (!codConfirmed) {
        throw new ApiError(400, 'Cash collection confirmation is required for Cash on Delivery orders');
      }
      const expectedAmount = order.total;
      const collected = typeof codAmountCollected === 'number' ? codAmountCollected : expectedAmount;
      if (collected !== expectedAmount) {
        throw new ApiError(400, `Collected amount (₹${collected}) must equal the order total due (₹${expectedAmount})`);
      }
    }

    // 4. OTP Existence & Expiry Check
    if (!order.delivery.otpHash || !order.delivery.otpExpiresAt) {
      throw new ApiError(400, 'No active delivery OTP found for this order. Please send OTP to the customer.');
    }

    if (new Date() > new Date(order.delivery.otpExpiresAt)) {
      throw new ApiError(400, 'Delivery OTP has expired. Please request a new OTP.');
    }

    // 5. Brute Force Protection (Max Attempts)
    const attempts = order.delivery.otpAttempts || 0;
    const maxAttempts = order.delivery.otpMaxAttempts || 5;

    if (attempts >= maxAttempts) {
      throw new ApiError(429, 'Too many incorrect OTP attempts. The current OTP has been invalidated. Please request a new OTP.');
    }

    // 6. Secure Timing-Safe Hash Comparison using HMAC-SHA256 (with fallback to legacy SHA-256)
    const candidateHmac = DeliveryService.hashDeliveryOtp(String(order._id), otpInput);
    const candidateLegacySha = crypto.createHash('sha256').update(otpInput).digest('hex');
    const expectedHashBuffer = Buffer.from(order.delivery.otpHash, 'utf8');
    const candidateHmacBuffer = Buffer.from(candidateHmac, 'utf8');
    const candidateLegacyBuffer = Buffer.from(candidateLegacySha, 'utf8');

    const isHmacMatch =
      expectedHashBuffer.length === candidateHmacBuffer.length &&
      crypto.timingSafeEqual(expectedHashBuffer, candidateHmacBuffer);
    const isLegacyMatch =
      expectedHashBuffer.length === candidateLegacyBuffer.length &&
      crypto.timingSafeEqual(expectedHashBuffer, candidateLegacyBuffer);

    if (!isHmacMatch && !isLegacyMatch) {
      order.delivery.otpAttempts = attempts + 1;
      await order.save();
      logger.warn(`[DELIVERY OTP FAIL] Incorrect OTP attempt (${attempts + 1}/${maxAttempts}) for order ${order.orderNumber}`);
      throw new ApiError(400, `Incorrect delivery OTP. (${maxAttempts - (attempts + 1)} attempts remaining)`);
    }

    // 7. Atomic Conditional Delivery Completion (Prevents double verification / concurrent race conditions)
    const now = new Date();
    const updateData: any = {
      $set: {
        status: 'DELIVERED',
        orderStatus: 'DELIVERED',
        internalStatus: 'DELIVERED',
        'delivery.status': 'DELIVERED',
        'delivery.deliveredAt': now,
        ...(isCod ? {
          'delivery.isCodCollected': true,
          'delivery.codAmountCollected': order.total,
          'payment.status': 'paid',
          paymentStatus: 'paid'
        } : {})
      },
      $unset: {
        'delivery.otpHash': '',
        'delivery.customerOtp': '',
        'delivery.otpExpiresAt': ''
      },
      $push: {
        statusHistory: {
          status: 'DELIVERED',
          timestamp: now,
          note: `Delivery successfully completed and verified via Customer OTP by agent ${agentId}`,
          performedBy: agentId,
        }
      }
    };

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: { $in: ['DISPATCHED', 'PROCESSING', 'BEING BAKED'] },
        'delivery.status': { $ne: 'DELIVERED' }
      },
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      // Idempotent return if already completed by a concurrent request
      const existingDelivered = await Order.findById(order._id);
      if (existingDelivered && existingDelivered.status === 'DELIVERED') {
        return existingDelivered;
      }
      throw new ApiError(409, 'Order is already marked as DELIVERED or concurrent update in progress');
    }

    logger.info(`[DELIVERY SUCCESS] Order ${updatedOrder.orderNumber} successfully marked DELIVERED via OTP verification`);
    return updatedOrder;
  }

  /**
   * Customer / Staff: Scoped live tracking endpoint.
   * Returns live location ONLY when order is DISPATCHED.
   * Closes tracking when DELIVERED.
   */
  static async getOrderTracking(orderId: string, userId: string, isStaff: boolean) {
    const order = await Order.findOne(DeliveryService.getOrderQuery(orderId))
      .select('+delivery.customerOtp')
      .populate('delivery.agentId', 'name phone avatar rating')
      .lean();

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Authorization: Owner or Staff or Assigned Agent or Guest Order
    const isOwner =
      (order.user && String(order.user) === String(userId)) ||
      (order.customer && String(order.customer) === String(userId));
    const agentRawId = (order.delivery?.agentId as any)?._id || order.delivery?.agentId;
    const isAssignedAgent = agentRawId && String(agentRawId) === String(userId);

    if (!isOwner && !isStaff && !isAssignedAgent && order.user) {
      throw new ApiError(403, 'You are not authorized to view tracking for this order');
    }

    const customerStatus = OrderStateMachine.toCustomerStatus(order.internalStatus || order.status);
    const destAddr = (order.delivery?.addressSnapshot || order.shippingAddress || {}) as any;
    const customerLocation = await DeliveryService.geocodeDestination(destAddr);

    const storeLocation = {
      latitude: customerLocation.latitude - 0.015,
      longitude: customerLocation.longitude - 0.015,
    };

    // Pre-dispatch state: live tracking NOT active
    if (customerStatus === 'CONFIRMED' || customerStatus === 'BEING BAKED') {
      return {
        trackingActive: false,
        status: customerStatus,
        internalStatus: order.internalStatus || 'PREPARING',
        reason: 'Order is not dispatched yet. Live tracking begins when picked up by the delivery partner.',
        storeLocation,
        deliveryOtp: undefined, // NEVER exposed before dispatch
      };
    }

    // Delivered state: tracking closed
    if (customerStatus === 'DELIVERED') {
      return {
        trackingActive: false,
        delivered: true,
        status: 'DELIVERED',
        internalStatus: 'DELIVERED',
        deliveredAt: order.delivery?.deliveredAt,
        deliveryOtp: undefined, // Consumed upon delivery
      };
    }

    // Dispatched state: live tracking ACTIVE
    const agent = (order.delivery?.agentId as any) || {
      name: 'Assigned Partner',
      phone: '',
      avatar: '',
      rating: 4.9,
    };

    // Save geocoded coordinates back onto the order so subsequent requests are instant
    if ((!destAddr.latitude || destAddr.latitude === 18.95) && customerLocation.latitude !== 18.95) {
      Order.updateOne(
        { _id: order._id },
        {
          $set: {
            'shippingAddress.latitude': customerLocation.latitude,
            'shippingAddress.longitude': customerLocation.longitude,
            'delivery.addressSnapshot.latitude': customerLocation.latitude,
            'delivery.addressSnapshot.longitude': customerLocation.longitude,
          },
        }
      ).catch(() => {});
    }

    const rawCurrent = order.delivery?.currentLocation as any;
    const hasRealAgentGps = rawCurrent &&
      typeof rawCurrent.latitude === 'number' && !isNaN(rawCurrent.latitude) &&
      typeof rawCurrent.longitude === 'number' && !isNaN(rawCurrent.longitude) &&
      rawCurrent.latitude !== 0 && rawCurrent.longitude !== 0 &&
      !(Math.abs(rawCurrent.latitude - 18.9674) < 0.001 && Math.abs(rawCurrent.longitude - 72.8116) < 0.001); // Ignore default Mumbai placeholder

    let agentCurrent: { latitude: number; longitude: number; heading: number };
    if (hasRealAgentGps) {
      // Use the exact real device GPS reported by the logged in delivery partner portal
      agentCurrent = {
        latitude: rawCurrent.latitude,
        longitude: rawCurrent.longitude,
        heading: rawCurrent.heading || 0,
      };
    } else {
      // Fallback only if device hasn't reported location yet
      agentCurrent = {
        latitude: customerLocation.latitude - 0.009,
        longitude: customerLocation.longitude - 0.009,
        heading: 45,
      };
    }

    // Approximate distance & ETA calculation (25 km/h urban delivery speed)
    const dLat = (customerLocation.latitude - agentCurrent.latitude) * Math.PI / 180;
    const dLon = (customerLocation.longitude - agentCurrent.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(agentCurrent.latitude * Math.PI / 180) *
              Math.cos(customerLocation.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(6371 * c * 10) / 10;
    const distanceMeters = Math.round(distanceKm * 1000);
    const etaMinutes = Math.max(3, Math.round((distanceKm / 25) * 60));

    return {
      trackingActive: true,
      status: 'DISPATCHED',
      internalStatus: order.internalStatus || 'DISPATCHED',
      deliveryOtp: (isOwner || isStaff || process.env.NODE_ENV === 'development') ? order.delivery?.customerOtp : undefined,
      agent: {
        name: agent.name,
        phone: agent.phone,
        avatar: agent.avatar,
        rating: agent.rating || 4.9,
      },
      currentLocation: agentCurrent,
      customerLocation,
      storeLocation,
      destinationAddress: {
        ...destAddr,
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
      },
      distanceKm,
      distanceMeters,
      etaMinutes,
      dispatchedAt: order.delivery?.dispatchedAt,
    };
  }

  private static geocodeCache = new Map<string, { latitude: number; longitude: number }>();

  static async geocodeDestination(addr: any): Promise<{ latitude: number; longitude: number }> {
    if (
      typeof addr?.latitude === 'number' &&
      !isNaN(addr.latitude) &&
      typeof addr?.longitude === 'number' &&
      !isNaN(addr.longitude) &&
      !(Math.abs(addr.latitude - 18.95) < 0.001 && Math.abs(addr.longitude - 72.8) < 0.001)
    ) {
      return { latitude: addr.latitude, longitude: addr.longitude };
    }

    const pincode = String(addr?.pincode || addr?.zipCode || addr?.postalCode || '').trim();
    const city = String(addr?.city || '').trim();
    const state = String(addr?.state || '').trim();
    const street = String(addr?.street || addr?.line1 || addr?.landmark || '').trim();

    const cacheKey = `${pincode}_${city}_${state}`;
    if (DeliveryService.geocodeCache.has(cacheKey)) {
      return DeliveryService.geocodeCache.get(cacheKey)!;
    }

    // 1. Try Nominatim with postalcode in India
    if (pincode && /^\d{5,6}$/.test(pincode)) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&postalcode=${encodeURIComponent(pincode)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'CakePopRush/1.0' } });
        if (res.ok) {
          const list: any = await res.json();
          if (Array.isArray(list) && list.length > 0 && list[0].lat && list[0].lon) {
            const result = { latitude: Number(list[0].lat), longitude: Number(list[0].lon) };
            DeliveryService.geocodeCache.set(cacheKey, result);
            return result;
          }
        }
      } catch (err: any) {
        logger.warn(`[GEOCODE] Nominatim postal search failed for ${pincode}: ${err?.message}`);
      }
    }

    // 2. Try Photon with pincode or city + state
    const queryStr = [street, city, state, pincode, 'India'].filter(Boolean).join(' ');
    if (queryStr) {
      try {
        const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryStr)}&limit=1`;
        const pRes = await fetch(pUrl);
        if (pRes.ok) {
          const pData: any = await pRes.json();
          const feat = pData?.features?.[0];
          if (feat?.geometry?.coordinates?.length >= 2) {
            const [lng, lat] = feat.geometry.coordinates;
            if (typeof lat === 'number' && typeof lng === 'number') {
              const result = { latitude: lat, longitude: lng };
              DeliveryService.geocodeCache.set(cacheKey, result);
              return result;
            }
          }
        }
      } catch (err: any) {
        logger.warn(`[GEOCODE] Photon search failed for ${queryStr}: ${err?.message}`);
      }
    }

    // 3. Known cities fallback dictionary
    const lowerCity = (city || '').toLowerCase();
    const cityCoords: Record<string, { latitude: number; longitude: number }> = {
      phagwara: { latitude: 31.2240, longitude: 75.7708 },
      jalandhar: { latitude: 31.3260, longitude: 75.5762 },
      ludhiana: { latitude: 30.9010, longitude: 75.8573 },
      amritsar: { latitude: 31.6340, longitude: 74.8723 },
      chandigarh: { latitude: 30.7333, longitude: 76.7794 },
      delhi: { latitude: 28.6139, longitude: 77.2090 },
      'new delhi': { latitude: 28.6139, longitude: 77.2090 },
      bengaluru: { latitude: 12.9716, longitude: 77.5946 },
      bangalore: { latitude: 12.9716, longitude: 77.5946 },
      mumbai: { latitude: 18.9674, longitude: 72.8116 },
      hyderabad: { latitude: 17.3850, longitude: 78.4867 },
      pune: { latitude: 18.5204, longitude: 73.8567 },
      chennai: { latitude: 13.0827, longitude: 80.2707 },
      kolkata: { latitude: 22.5726, longitude: 88.3639 },
      jaipur: { latitude: 26.9124, longitude: 75.7873 },
      ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
    };

    for (const [name, coords] of Object.entries(cityCoords)) {
      if (lowerCity.includes(name) || (state.toLowerCase().includes('punjab') && name === 'phagwara')) {
        DeliveryService.geocodeCache.set(cacheKey, coords);
        return coords;
      }
    }

    return { latitude: 31.2533, longitude: 75.6958 }; // Fallback to Punjab / Phagwara region instead of Mumbai
  }
}

export default DeliveryService;
