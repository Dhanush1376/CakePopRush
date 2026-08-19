export type FulfillmentType = 'delivery' | 'pickup';
export type OrderSource = 'Phone' | 'WhatsApp' | 'Instagram' | 'Walk-in' | 'Staff Entry' | 'Other';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Online Payment' | 'Other';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending' | 'Failed';

export interface OrderItem {
  id: string; // unique local id
  productId?: string;
  isCustom: boolean;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  customization?: {
    flavor?: string;
    size?: string;
    message?: string;
    design?: string;
    instructions?: string;
  };
  notes?: string;
  customerNote?: string;
  internalNote?: string;
}

export const TAX_RATE = 0.10;

export const WIZARD_STEPS = [
  { id: 1, name: 'Customer' },
  { id: 2, name: 'Items' },
  { id: 3, name: 'Delivery' },
  { id: 4, name: 'Payment' },
  { id: 5, name: 'Review' }
];
