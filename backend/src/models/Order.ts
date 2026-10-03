import mongoose, { Schema, Document } from 'mongoose';
import OrderStateMachine from '../services/orders/OrderStateMachine';

export type CanonicalOrderStatus = 'PENDING' | 'CONFIRMED' | 'BEING BAKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface IOrderItem {
  productId: string;
  name: string;
  title?: string;
  price: number;
  quantity: number;
  image?: string;
  imageSrc?: string;
  category?: string;
  variant?: string;
  customizationNote?: string;
  isNonRefundable: boolean;
}

export interface IOrderAddressSnapshot {
  recipientName: string;
  customerName?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  street: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type?: 'home' | 'work' | 'other' | string;
  deliveryInstructions?: string;
}

export interface IOrderPayment {
  method: 'razorpay' | 'cod' | 'wallet' | string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'Pending COD' | 'COD Collected' | string;
  provider?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface IOrderDelivery {
  addressSnapshot: IOrderAddressSnapshot;
  agentId?: mongoose.Types.ObjectId;
  status?: 'UNASSIGNED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'DISPATCHED' | 'DELIVERED';
  assignedAt?: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  otpHash?: string;
  customerOtp?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  otpMaxAttempts: number;
  otpSentAt?: Date;
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    updatedAt: Date;
  };
  isCodCollected: boolean;
  codAmountCollected?: number;
  instructions?: string;
}

export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
  performedBy?: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  shippingFee: number;
  codFee: number;
  total: number;
  status: CanonicalOrderStatus | string;
  orderStatus: CanonicalOrderStatus | string;
  internalStatus: string;
  payment: IOrderPayment;
  paymentMethod: string;
  paymentStatus: string;
  delivery: IOrderDelivery;
  shippingAddress: IOrderAddressSnapshot;
  statusHistory: IOrderStatusHistory[];
  idempotencyKey?: string;
  isNonReturnable: boolean;
  couponCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}


const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    title: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: '' },
    imageSrc: { type: String, default: '' },
    category: { type: String, default: 'Cake Pops' },
    variant: { type: String, default: 'Default' },
    customizationNote: { type: String, trim: true, maxlength: 2000 },
    isNonRefundable: { type: Boolean, default: true },
  },
  { _id: false }
);

const OrderAddressSnapshotSchema = new Schema<IOrderAddressSnapshot>(
  {
    recipientName: { type: String, default: '' },
    customerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    alternatePhone: { type: String, default: '' },
    email: { type: String, default: '' },
    street: { type: String, default: '' },
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    deliveryInstructions: { type: String, default: '' },
  },
  { _id: false }
);

const OrderPaymentSchema = new Schema<IOrderPayment>(
  {
    method: { type: String, default: 'razorpay' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'Pending COD', 'COD Collected'],
      default: 'pending',
    },
    provider: { type: String, default: 'razorpay' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { _id: false }
);

const OrderDeliverySchema = new Schema<IOrderDelivery>(
  {
    addressSnapshot: { type: OrderAddressSnapshotSchema, required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['UNASSIGNED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DISPATCHED', 'DELIVERED'],
      default: 'UNASSIGNED',
    },
    assignedAt: { type: Date },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date },
    otpHash: { type: String, select: false },
    customerOtp: { type: String, select: false },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    otpMaxAttempts: { type: Number, default: 5 },
    otpSentAt: { type: Date },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      heading: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    isCodCollected: { type: Boolean, default: false },
    codAmountCollected: { type: Number, default: 0 },
    instructions: { type: String, default: '' },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    performedBy: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, default: '', trim: true },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    
    // Customer-facing 4-step order status (plus legacy aliases)
    status: {
      type: String,
      enum: [
        'PENDING', 'CONFIRMED', 'BEING BAKED', 'BEING_BAKED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED',
        'Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled', 'Dispatched'
      ],
      default: 'CONFIRMED',
      index: true,
    },
    orderStatus: {
      type: String,
      default: 'CONFIRMED',
    },

    // Internal Operational Substate for Admin & Delivery Partner Tracking
    internalStatus: {
      type: String,
      enum: [
        'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'AGENT_ACCEPTED',
        'PICKED_UP', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'ARRIVED', 'OTP_VERIFIED',
        'DELIVERED', 'CANCELLED'
      ],
      index: true,
    },

    payment: { type: OrderPaymentSchema, default: () => ({ method: 'razorpay', status: 'pending' }) },
    // Backwards-compatible top-level payment accessors
    paymentMethod: { type: String, default: 'razorpay' },
    paymentStatus: { type: String, default: 'pending' },

    delivery: { type: OrderDeliverySchema, required: true },
    shippingAddress: { type: OrderAddressSnapshotSchema, default: () => ({}) },

    statusHistory: { type: [OrderStatusHistorySchema], default: [] },
    idempotencyKey: { type: String, unique: true, sparse: true },
    isNonReturnable: { type: Boolean, default: true },
    couponCode: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Synchronize mirrors before validation
OrderSchema.pre<IOrder>('validate', function (next) {
  if (this.user && !this.customer) {
    this.customer = this.user;
  } else if (this.customer && !this.user) {
    this.user = this.customer;
  }

  // 1. Establish internalStatus as canonical operational truth
  if (!this.internalStatus) {
    const s = String(this.status || 'CONFIRMED').toUpperCase().trim();
    if (s === 'PROCESSING' || s === 'BEING_BAKED' || s === 'BEING BAKED') {
      this.internalStatus = 'PREPARING';
    } else if (s === 'DISPATCHED') {
      this.internalStatus = 'DISPATCHED';
    } else if (s === 'DELIVERED') {
      this.internalStatus = 'DELIVERED';
    } else if (s === 'CANCELLED') {
      this.internalStatus = 'CANCELLED';
    } else {
      this.internalStatus = 'CONFIRMED';
    }
  }

  // 2. Derive Customer Status strictly from internalStatus (Only 4 states)
  const projectedCustomerStatus = OrderStateMachine.toCustomerStatus(this.internalStatus as any);
  this.status = projectedCustomerStatus;
  this.orderStatus = projectedCustomerStatus;

  // 3. Keep delivery.status aligned with internalStatus to guarantee zero contradiction
  if (this.delivery) {
    if (['DELIVERED', 'OTP_VERIFIED'].includes(this.internalStatus)) {
      this.delivery.status = 'DELIVERED';
    } else if (['DISPATCHED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED'].includes(this.internalStatus)) {
      this.delivery.status = 'DISPATCHED';
    } else if (this.internalStatus === 'AGENT_ACCEPTED') {
      this.delivery.status = 'ACCEPTED';
    } else if (this.internalStatus === 'ASSIGNED') {
      this.delivery.status = 'ASSIGNED';
    } else if (this.delivery.agentId) {
      this.delivery.status = 'ASSIGNED';
    } else {
      this.delivery.status = 'UNASSIGNED';
    }
  }


  // Sync payment fields
  if (this.payment) {
    this.paymentMethod = this.payment.method || this.paymentMethod || 'razorpay';
    this.paymentStatus = this.payment.status || this.paymentStatus || 'pending';
  }

  // Sync delivery & shipping address
  if (this.delivery?.addressSnapshot && (!this.shippingAddress || !this.shippingAddress.city)) {
    this.shippingAddress = this.delivery.addressSnapshot;
  } else if (this.shippingAddress && (!this.delivery || !this.delivery.addressSnapshot)) {
    if (!this.delivery) {
      this.delivery = {
        addressSnapshot: this.shippingAddress,
        otpAttempts: 0,
        otpMaxAttempts: 5,
        isCodCollected: false,
      };
    } else {
      this.delivery.addressSnapshot = this.shippingAddress;
    }
  }

  // Sync fees
  if (this.deliveryFee && !this.shippingFee) {
    this.shippingFee = this.deliveryFee;
  } else if (this.shippingFee && !this.deliveryFee) {
    this.deliveryFee = this.shippingFee;
  }

  next();
});

OrderSchema.index({ 'delivery.agentId': 1, status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
