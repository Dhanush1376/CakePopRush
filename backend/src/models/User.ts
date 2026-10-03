import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerAddress {
  _id?: mongoose.Types.ObjectId;
  label?: string;
  type?: 'home' | 'work' | 'other';
  street?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
}

export interface ICustomerCartItem {
  id?: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  variantId?: string;
  variantName?: string;
  customization?: any;
  priceModifier?: number;
}

export interface ICustomerWishlistItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  slug?: string;
  addedAt?: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: 'customer' | 'user' | 'owner' | 'super_admin' | 'main_admin' | 'admin' | 'editor' | 'viewer' | 'delivery_agent' | 'DELIVERY_AGENT';
  avatar?: string;
  providers: string[];
  googleId?: string;
  isVerified: boolean;
  isLocked: boolean;
  isActive?: boolean;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  addresses?: ICustomerAddress[];
  cart?: ICustomerCartItem[];
  wishlist?: ICustomerWishlistItem[];
  walletBalance?: number;
  rewardPoints?: number;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<ICustomerAddress>(
  {
    label: { type: String, default: 'Home' },
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    street: { type: String, default: '' },
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CartItemSchema = new Schema<ICustomerCartItem>(
  {
    id: { type: String },
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, default: 1 },
    image: { type: String, default: '' },
    variant: { type: String, default: '' },
    variantId: { type: String, default: '' },
    variantName: { type: String, default: '' },
    customization: { type: Schema.Types.Mixed, default: null },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false }
);

const WishlistItemSchema = new Schema<ICustomerWishlistItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    slug: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, default: '', trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['customer', 'user', 'owner', 'super_admin', 'main_admin', 'admin', 'editor', 'viewer', 'delivery_agent', 'DELIVERY_AGENT'],
      default: 'customer',
    },
    avatar: { type: String, default: '' },
    providers: {
      type: [{ type: String }],
      default: ['otp'],
    },
    googleId: { type: String, sparse: true },
    isVerified: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    loyaltyTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    addresses: { type: [AddressSchema], default: [] },
    cart: { type: [CartItemSchema], default: [] },
    wishlist: { type: [WishlistItemSchema], default: [] },
    walletBalance: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ role: 1, isLocked: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
