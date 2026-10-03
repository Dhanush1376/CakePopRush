import mongoose, { Schema, Document, Types } from 'mongoose';
import Counter from './Counter';

export type CustomOrderStatus =
  | 'Pending Quote'
  | 'Quoted'
  | 'Approved'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';

export type CustomOrderSource = 'GENERAL' | 'PRODUCT';

export interface IProductSnapshot {
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  categoryName?: string;
  price?: number;
  description?: string;
}

export interface IStatusHistoryEntry {
  from: string;
  to: string;
  changedBy: string;
  changedAt: Date;
  note?: string;
}

export interface ICustomOrderAttachment {
  url: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
}

export interface IInternalNote {
  author: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

export interface ICustomOrder extends Document {
  orderId: string;
  customer?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  source: CustomOrderSource;
  customOrderType: 'general' | 'product';
  occasion: string;
  occasionDescription: string;
  targetDate: Date;
  quantity: number;
  budget?: string | number;
  designImage?: string;
  attachments: ICustomOrderAttachment[];
  productId?: string;
  productSnapshot?: IProductSnapshot;
  customizationDetails?: Record<string, unknown>;
  formVersion?: number;
  status: CustomOrderStatus;
  statusHistory: IStatusHistoryEntry[];
  internalNotes: IInternalNote[];
  adminNotes?: string;
  isDraft: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSnapshotSchema = new Schema<IProductSnapshot>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String },
    image: { type: String },
    categoryName: { type: String },
    price: { type: Number },
    description: { type: String },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const CustomOrderAttachmentSchema = new Schema<ICustomOrderAttachment>(
  {
    url: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const InternalNoteSchema = new Schema<IInternalNote>(
  {
    author: { type: String, required: true },
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CustomOrderSchema = new Schema<ICustomOrder>(
  {
    orderId: { type: String, unique: true, sparse: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    customerPhone: { type: String, trim: true, default: '' },
    source: {
      type: String,
      enum: ['GENERAL', 'PRODUCT'],
      default: 'GENERAL',
      index: true,
    },
    customOrderType: {
      type: String,
      enum: ['general', 'product'],
      default: 'general',
      index: true,
    },
    occasion: { type: String, default: 'Custom', trim: true },
    occasionDescription: { type: String, required: true, trim: true },
    targetDate: { type: Date, required: true },
    quantity: { type: Number, required: true, default: 12, min: 1 },
    budget: { type: Schema.Types.Mixed },
    designImage: { type: String },
    attachments: { type: [CustomOrderAttachmentSchema], default: [] },
    productId: { type: String, index: true },
    productSnapshot: { type: ProductSnapshotSchema },
    customizationDetails: { type: Schema.Types.Mixed, default: {} },
    formVersion: { type: Number, default: 1, index: true },
    status: {
      type: String,
      enum: ['Pending Quote', 'Quoted', 'Approved', 'In Progress', 'Completed', 'Rejected'],
      default: 'Pending Quote',
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    internalNotes: { type: [InternalNoteSchema], default: [] },
    adminNotes: { type: String, default: '' },
    isDraft: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes
CustomOrderSchema.index({ customer: 1, createdAt: -1 });
CustomOrderSchema.index({ customerEmail: 1, createdAt: -1 });
CustomOrderSchema.index({ status: 1, createdAt: -1 });
CustomOrderSchema.index({ archived: 1, status: 1, createdAt: -1 });
CustomOrderSchema.index({ isDraft: 1, archived: 1, createdAt: -1 });
CustomOrderSchema.index({ customer: 1, isDraft: 1, archived: 1, createdAt: -1 });
CustomOrderSchema.index({ targetDate: 1 });

// Atomic sequence generation for orderId (e.g., REQ-0843 or REQ-2026-0001)
CustomOrderSchema.pre<ICustomOrder>('save', async function (next) {
  if (!this.orderId && !this.isDraft) {
    const year = new Date().getFullYear();
    let counter;
    let retries = 3;
    while (retries > 0) {
      try {
        counter = await Counter.findByIdAndUpdate(
          { _id: `customOrder_${year}` },
          { $inc: { seq: 1 } },
          { returnDocument: 'after', upsert: true }
        );
        break;
      } catch (err: any) {
        if (err.code === 11000) {
          retries--;
          if (retries === 0) return next(err);
          await new Promise((res) => setTimeout(res, Math.random() * 50));
        } else {
          return next(err);
        }
      }
    }
    if (counter) {
      // Format as REQ-XXXX (4-digit padded, matching CakePopRush conventions, e.g. REQ-0843)
      this.orderId = `REQ-${String(counter.seq + 842).padStart(4, '0')}`;
    } else {
      this.orderId = `REQ-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    }
  }
  next();
});

export default mongoose.model<ICustomOrder>('CustomOrder', CustomOrderSchema);
