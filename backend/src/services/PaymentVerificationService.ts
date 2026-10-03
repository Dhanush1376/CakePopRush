import crypto from 'crypto';
import Order from '../models/Order';
import PaymentAttempt from '../models/PaymentAttempt';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';

export interface VerifyPaymentInput {
  razorpay_order_id?: string;
  razorpayOrderId?: string;
  razorpay_payment_id?: string;
  razorpayPaymentId?: string;
  razorpay_signature?: string;
  razorpaySignature?: string;
}

export class PaymentVerificationService {
  static async verifyPayment(paymentData: VerifyPaymentInput, invokerId: string, role: string) {
    const razorpay_order_id = paymentData.razorpay_order_id || paymentData.razorpayOrderId;
    const razorpay_payment_id = paymentData.razorpay_payment_id || paymentData.razorpayPaymentId;
    const razorpay_signature = paymentData.razorpay_signature || paymentData.razorpaySignature;

    if (!razorpay_order_id || !razorpay_payment_id) {
      throw new ApiError(400, 'Missing payment verification parameters (razorpayOrderId and razorpayPaymentId are required)');
    }

    // 1. Signature Verification
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKeySecret) {
      if (!razorpay_signature) {
        throw new ApiError(400, 'Missing Razorpay signature');
      }

      const hmac = crypto.createHmac('sha256', razorpayKeySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = hmac.digest('hex');

      const expectedBuffer = Buffer.from(digest, 'utf8');
      const signatureBuffer = Buffer.from(razorpay_signature, 'utf8');

      const isValid =
        expectedBuffer.length === signatureBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

      if (!isValid) {
        logger.error(`[PAYMENT VERIFY] Signature mismatch for order: ${razorpay_order_id}`);
        throw new ApiError(400, 'Invalid payment signature. Verification failed.');
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new ApiError(500, 'Razorpay key secret is not configured in production. Payment verification cannot proceed.');
      }
      logger.warn('[PAYMENT VERIFY] No RAZORPAY_KEY_SECRET found in environment. Running in developer mode verification.');
    }

    // 2. Fetch Payment Attempt and Lock
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const attempt = await PaymentAttempt.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
        $or: [
          { status: { $in: ['initiated', 'failed'] } },
          { status: 'processing', leaseExpiresAt: { $lt: fiveMinutesAgo } },
        ],
      },
      {
        $set: {
          status: 'processing',
          leaseExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      },
      { returnDocument: 'after' }
    );

    if (!attempt) {
      const existingAttempt = await PaymentAttempt.findOne({ razorpayOrderId: razorpay_order_id });
      if (existingAttempt && existingAttempt.status === 'success') {
        logger.info(`[PAYMENT IDEMPOTENT] Payment already verified successfully for ${razorpay_order_id}`);
        const existingOrder = await Order.findById(existingAttempt.orderData.pendingOrderId);
        if (existingOrder) return existingOrder;
      }
      throw new ApiError(404, 'Checkout intent not found or payment already in final state');
    }

    // 3. User Ownership Verification
    if (String(attempt.userId) !== invokerId && role !== 'admin' && role !== 'super_admin') {
      attempt.status = 'initiated';
      await attempt.save();
      throw new ApiError(403, 'You are not authorized to verify this payment');
    }

    const { orderData } = attempt;

    // 4. Create authoritative Order in DB
    const order = new Order({
      _id: orderData.pendingOrderId,
      orderNumber: orderData.orderNumber,
      user: attempt.userId,
      customer: attempt.userId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      shippingFee: orderData.deliveryFee || 0,
      codFee: 0,
      total: orderData.total,
      status: 'PENDING',
      orderStatus: 'PENDING',
      payment: {
        method: 'razorpay',
        status: 'paid',
        provider: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature || '',
      },
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      delivery: {
        addressSnapshot: orderData.shippingAddress,
        otpAttempts: 0,
        otpMaxAttempts: 5,
        isCodCollected: false,
        codAmountCollected: 0,
        instructions: orderData.notes || '',
      },
      shippingAddress: orderData.shippingAddress,
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note: `Payment verified via Razorpay (${razorpay_payment_id}) – awaiting admin approval`,
          performedBy: 'customer',
        },
      ],
      idempotencyKey: orderData.idempotencyKey,
      isNonReturnable: true,
      couponCode: orderData.couponCode,
      notes: orderData.notes,
    });

    await order.save();

    // 5. Clear Cart in customer record
    await User.findByIdAndUpdate(attempt.userId, { $set: { cart: [] } });

    // 6. Finalize PaymentAttempt
    attempt.status = 'success';
    await attempt.save();

    logger.info(`[PAYMENT VERIFIED] Order ${order.orderNumber} successfully confirmed with payment ${razorpay_payment_id}`);

    return order;
  }
}

export default PaymentVerificationService;
