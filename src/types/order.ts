export interface OrderAddress {
  recipientName?: string;
  customerName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface OrderPrice {
  itemSubtotal?: number;
  couponDiscount?: number;
  deliveryFee?: number;
  taxes?: number;
  amountPaid?: number;
}

export interface OrderItem {
  id?: string;
  name?: string;
  isCustom?: boolean;
  customDetails?: string;
  qty?: number;
  unitPrice?: number;
  subtotal?: number;
  price?: number; // Storefront list view uses price
  image?: string; // Storefront list view uses image
  category?: string; // Storefront list view uses category
}

export interface Order {
  id?: string;
  date?: string;
  status?: string; // e.g. 'pending' | 'confirmed' | 'shipped' | 'delivered'
  total?: number;
  time?: string;
  orderType?: 'Delivery' | 'Pickup' | string;
  amount?: string | number; // Support for Admin mock format
  email?: string;
  customer?: string | { name?: string; email?: string; phone?: string; };
  address?: OrderAddress;
  price?: OrderPrice;
  items?: OrderItem[];
  payment?: {
    method?: string;
    status?: string;
  };
  method?: string; // Legacy admin field
  paymentStatus?: string; // Legacy admin field
  estimatedDelivery?: string;
  estimatedTime?: string;
}
