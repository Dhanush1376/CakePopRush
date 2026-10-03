export interface InvoiceItem {
  id: string;
  name: string;
  sku?: string;
  isCustom?: boolean;
  customDetails?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface InvoiceAddress {
  name: string;
  phone?: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string;
  orderDate: string;
  
  business: {
    name: string;
    address: string;
    cityStateZip: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    gstin?: string;
  };

  customer: {
    name: string;
    email?: string;
    phone?: string;
  };

  billingAddress?: InvoiceAddress;
  shippingAddress?: InvoiceAddress;
  
  fulfillment: {
    type: 'Delivery' | 'Pickup';
    date: string;
    timeSlot?: string;
  };

  items: InvoiceItem[];

  pricing: {
    subtotal: number;
    itemDiscount: number;
    couponDiscount: number;
    tax: number;
    deliveryFee: number;
    total: number;
  };

  payment: {
    method: string;
    status: 'Paid' | 'Pending' | 'Partially Paid' | 'Cancelled' | 'Refunded';
    amountPaid: number;
    balanceDue: number;
  };

  coupon?: {
    code: string;
    description: string;
  };

  notes?: string;
  qrCodeUrl: string;
  barcodeValue: string;
}


