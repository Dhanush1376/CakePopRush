import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPaymentAttempt extends Document {
  razorpayOrderId: string;
  userId: mongoose.Types.ObjectId;
  type: 'purchase' | 'custom_order';
  status: 'initiated' | 'processing' | 'success' | 'failed' | 'expired';
  orderData: Record<string, any>;
  processingBy?: string;
  leaseExpiresAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    razorpayOrderId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['purchase', 'custom_order'], default: 'purchase', required: true },
    status: {
      type: String,
      enum: ['initiated', 'processing', 'success', 'failed', 'expired'],
      default: 'initiated',
    },
    orderData: { type: Schema.Types.Mixed, required: true },
    processingBy: { type: String },
    leaseExpiresAt: { type: Date },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

paymentAttemptSchema.index({ razorpayOrderId: 1, status: 1 });

export const PaymentAttempt: Model<IPaymentAttempt> = mongoose.model<IPaymentAttempt>(
  'PaymentAttempt',
  paymentAttemptSchema
);
export default PaymentAttempt;
