import React from 'react';

export interface TrackingStep {
  status: string
  label: string
  desc: string
  date?: string
  time?: string
  icon: React.ReactNode
  color: string
}

export interface OrderItemDetail {
  id: string
  name: string
  variant?: string
  size?: string
  qty: number
  unitPrice: number
  discount: number
  subtotal: number
  icon: React.ReactNode
  image?: string
}

export interface DeliveryAddress {
  recipientName: string
  phone: string
  houseNo: string
  building?: string
  street: string
  area: string
  city: string
  state: string
  pincode: string
  type: 'Home' | 'Work' | 'Other'
  instructions?: string
}

export interface PriceBreakdown {
  itemSubtotal: number
  productDiscount: number
  couponDiscount: number
  deliveryFee: number
  packagingFee: number
  taxes: number
  totalDiscount: number
  amountPaid: number
}

export interface PaymentInfo {
  method: string
  status: string
  transactionId: string
  date: string
  time: string
  provider: string
  amountPaid: number
}

export interface CustomerInfo {
  id: string;
  orderCount: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  loyaltyPoints?: number;
}

export interface DeliveryAgent {
  name: string
  avatar: string
  rating: number
  phone: string
}

export interface OrderDetail {
  id: string
  date: string
  time: string
  status: string
  orderType: 'Delivery' | 'Pickup'
  estimatedDelivery?: string
  estimatedTime?: string
  actualDelivery?: string
  items: OrderItemDetail[]
  totalProducts: number
  totalQuantity: number
  address: DeliveryAddress
  price: PriceBreakdown
  payment: PaymentInfo
  customer: CustomerInfo
  agent?: DeliveryAgent
  notes?: string
  giftMessage?: string
  invoiceNumber: string
  invoiceDate: string
}
