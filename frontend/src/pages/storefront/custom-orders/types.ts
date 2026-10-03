export interface CustomOrderData {
  id?: string;
  orderId?: string;
  design: File | string | null;
  designImage?: string;
  designPreviewUrl?: string;
  occasionDescription: string;
  targetDate: string;
  quantity: string;
  mobileNumber: string;
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  occasion?: string;
  budget?: string;
  productId?: string;
  product?: {
    id?: string;
    productId?: string;
    name: string;
    image?: string;
    categoryName?: string;
    category?: string;
    flavor?: string;
    price?: number;
    description?: string;
  } | null;
  source?: 'GENERAL' | 'PRODUCT';
  customOrderType?: string;
  attachments?: Array<{ url: string; originalName?: string; mimeType?: string; size?: number }>;
  status?: string;
  customizationDetails?: Record<string, any>;
}

