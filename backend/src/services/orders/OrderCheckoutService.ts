import mongoose from 'mongoose';
import Order, { IOrderItem, IOrderAddressSnapshot } from '../../models/Order';
import PaymentAttempt from '../../models/PaymentAttempt';
import User from '../../models/User';
import productsData from '../../data/seed/products.json';
import ApiError from '../../utils/ApiError';
import logger from '../../config/logger';
import OrderIdempotencyManager from '../OrderIdempotencyManager';
import RazorpayGateway from '../../utils/payment/RazorpayGateway';

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  variant?: string;
  customizationNote?: string;
}

export interface CreateOrderInput {
  items: CheckoutItemInput[];
  shippingAddress: IOrderAddressSnapshot;
  paymentMethod: 'razorpay' | 'cod';
  couponCode?: string;
  notes?: string;
  idempotencyKey?: string;
}

export class OrderCheckoutService {
  private static findCatalogProduct(idOrSlug: string) {
    if (!idOrSlug) return null;
    return (productsData as any[]).find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CPR-${timestamp}${random}`;
  }

  static async createOrder(userId: string, input: CreateOrderInput) {
    const { items, shippingAddress, paymentMethod, couponCode, notes, idempotencyKey } = input;
    const isCod = paymentMethod === 'cod';

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'At least one item is required to checkout');
    }

    if (!shippingAddress || !shippingAddress.phone || !shippingAddress.city || !shippingAddress.pincode) {
      throw new ApiError(400, 'Valid delivery address with phone, city, and pincode is required');
    }

    // Acquire idempotency lock
    await OrderIdempotencyManager.acquireLock(userId, idempotencyKey);
    const cached = await OrderIdempotencyManager.getCachedResponse(userId, idempotencyKey);
    if (cached) {
      await OrderIdempotencyManager.releaseLock(userId, idempotencyKey);
      return cached;
    }

    try {
      const user = await User.findById(userId);
      if (!user) throw new ApiError(404, 'Customer account not found');

      // Validate items against catalog to prevent price tampering
      let subtotal = 0;
      const orderItems: IOrderItem[] = [];

      for (const item of items) {
        if (!item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity)) {
          throw new ApiError(400, `Invalid quantity for product ${item.productId}`);
        }

        const product = this.findCatalogProduct(item.productId);
        if (!product) {
          throw new ApiError(404, `Product not found in catalog: ${item.productId}`);
        }

        const price =
          typeof product.price === 'number'
            ? product.price
            : typeof product.basePrice === 'number'
            ? Math.round(product.basePrice / 100)
            : 0;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        const imageSrc =
          Array.isArray(product.images) && product.images.length > 0
            ? typeof product.images[0] === 'string'
              ? product.images[0]
              : product.images[0]?.url || product.image
            : product.image || '';

        orderItems.push({
          productId: String(product.id),
          name: product.name,
          title: product.name,
          price,
          quantity: item.quantity,
          variant: item.variant || 'Default',
          image: imageSrc,
          imageSrc,
          category: product.categoryName || 'Cake Pops',
          customizationNote: item.customizationNote,
          isNonRefundable: true,
        });
      }

      // Financial breakdown
      let discount = 0;
      if (couponCode && couponCode.trim()) {
        const code = couponCode.trim().toUpperCase();
        if (code === 'RUSH10' || code === 'WELCOME10') {
          discount = Math.round(subtotal * 0.1);
        } else if (code === 'FLAT50') {
          discount = Math.min(50, subtotal);
        }
      }

      const deliveryFee = subtotal >= 499 ? 0 : 49;
      const codFee = isCod ? 30 : 0;
      const total = Math.max(0, subtotal - discount + deliveryFee + codFee);

      const pendingOrderId = new mongoose.Types.ObjectId();
      const orderNumber = this.generateOrderNumber();

      const addressSnapshot: IOrderAddressSnapshot = {
        recipientName: shippingAddress.recipientName || shippingAddress.customerName || user.name || 'Valued Customer',
        customerName: shippingAddress.recipientName || shippingAddress.customerName || user.name || 'Valued Customer',
        phone: shippingAddress.phone,
        alternatePhone: shippingAddress.alternatePhone || '',
        email: shippingAddress.email || user.email || '',
        street: shippingAddress.street || shippingAddress.line1 || '',
        line1: shippingAddress.line1 || shippingAddress.street || '',
        line2: shippingAddress.line2 || '',
        landmark: shippingAddress.landmark || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        type: shippingAddress.type || 'home',
        deliveryInstructions: shippingAddress.deliveryInstructions || notes || '',
      };

      if (isCod) {
        // Instant COD Order placement
        const order = new Order({
          _id: pendingOrderId,
          orderNumber,
          user: user._id,
          customer: user._id,
          customerName: addressSnapshot.recipientName,
          customerEmail: user.email || addressSnapshot.email || '',
          customerPhone: addressSnapshot.phone,
          items: orderItems,
          subtotal,
          discount,
          deliveryFee,
          shippingFee: deliveryFee,
          codFee,
          total,
          status: 'PENDING',
          orderStatus: 'PENDING',
          payment: {
            method: 'cod',
            status: 'Pending COD',
            provider: 'cod',
          },
          paymentMethod: 'cod',
          paymentStatus: 'Pending COD',
          delivery: {
            addressSnapshot,
            otpAttempts: 0,
            otpMaxAttempts: 5,
            isCodCollected: false,
            codAmountCollected: 0,
            instructions: notes || '',
          },
          shippingAddress: addressSnapshot,
          statusHistory: [
            {
              status: 'PENDING',
              timestamp: new Date(),
              note: 'Order placed – awaiting admin approval',
              performedBy: 'customer',
            },
          ],
          idempotencyKey,
          isNonReturnable: true,
          couponCode: couponCode ? couponCode.toUpperCase() : undefined,
          notes,
        });

        await order.save();

        // Clear cart in customer record
        user.cart = [];
        await user.save();

        logger.info(`[ORDER CREATED] COD order ${orderNumber} created for user ${userId}`);

        const result = {
          order,
          type: 'cod',
          isInstantCheckout: true,
        };

        await OrderIdempotencyManager.cacheResponseAndReleaseLock(userId, idempotencyKey, result);
        return result;
      } else {
        // Razorpay Online Flow: Create payment intent and order on Razorpay
        const razorpayOptions = {
          amount: Math.round(total * 100), // paise
          currency: 'INR',
          receipt: `rcpt_${pendingOrderId}`,
          notes: {
            userId: String(userId),
            orderNumber,
          },
        };

        const razorpayOrder = await RazorpayGateway.createOrder(razorpayOptions);

        const attemptData = {
          pendingOrderId: String(pendingOrderId),
          orderNumber,
          userId: String(userId),
          customerName: addressSnapshot.recipientName,
          customerEmail: user.email || addressSnapshot.email || '',
          customerPhone: addressSnapshot.phone,
          items: orderItems,
          subtotal,
          discount,
          deliveryFee,
          codFee: 0,
          total,
          shippingAddress: addressSnapshot,
          couponCode: couponCode ? couponCode.toUpperCase() : undefined,
          notes,
          idempotencyKey,
        };

        await PaymentAttempt.create({
          razorpayOrderId: razorpayOrder.id,
          userId: user._id,
          type: 'purchase',
          status: 'initiated',
          orderData: attemptData,
        });

        logger.info(`[PAYMENT INITIATED] Razorpay order ${razorpayOrder.id} initiated for receipt rcpt_${pendingOrderId}`);

        const result = {
          order: {
            _id: pendingOrderId,
            orderNumber,
            total,
            razorpayOrderId: razorpayOrder.id,
            idempotencyKey,
          },
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          },
          type: 'online',
          isInstantCheckout: false,
        };

        await OrderIdempotencyManager.cacheResponseAndReleaseLock(userId, idempotencyKey, result);
        return result;
      }
    } catch (err: any) {
      await OrderIdempotencyManager.releaseLock(userId, idempotencyKey);
      throw err;
    }
  }
}

export default OrderCheckoutService;
