import Razorpay from 'razorpay';
import logger from '../../config/logger';

export interface CreateRazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

export class RazorpayGateway {
  private static instance: Razorpay | null = null;

  public static isConfigured(): boolean {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  public static getInstance(): Razorpay {
    if (!this.instance) {
      if (!this.isConfigured()) {
        throw new Error('Razorpay keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in environment variables.');
      }
      this.instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });
    }
    return this.instance;
  }

  static async createOrder(options: CreateRazorpayOrderOptions): Promise<{ id: string; amount: number; currency: string; receipt: string }> {
    logger.info(`[RAZORPAY GATEWAY] Creating order for receipt ${options.receipt}, amount: ₹${options.amount / 100}`);

    if (this.isConfigured()) {
      try {
        const razorpay = this.getInstance();
        const res = await razorpay.orders.create(options);
        return {
          id: res.id,
          amount: Number(res.amount),
          currency: res.currency,
          receipt: options.receipt,
        };
      } catch (err: any) {
        logger.error(`[RAZORPAY GATEWAY] Razorpay API failed: ${err.message}`);
        throw err;
      }
    }

    // Graceful developer / mock fallback if no live keys provided in test/dev
    logger.warn('[RAZORPAY GATEWAY] Live keys not present, using development order mock.');
    return {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
    };
  }

  static async getPayment(paymentId: string): Promise<any> {
    if (this.isConfigured()) {
      const razorpay = this.getInstance();
      return await razorpay.payments.fetch(paymentId);
    }
    return {
      id: paymentId,
      status: 'captured',
      amount: 10000,
      currency: 'INR',
    };
  }
}

export default RazorpayGateway;
