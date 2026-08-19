import React from 'react';
import styles from './PaymentSummaryCard.module.css';
import { PriceBreakdown, PaymentInfo } from '@/features/orders/types';

interface InfoRowProps {
  label: string;
  value: string;
  accent?: boolean;
  compact?: boolean;
  statusBadge?: boolean;
}

export function PaymentSummaryCard({ 
  price, 
  payment,
  InfoRowComponent
}: { 
  price: PriceBreakdown;
  payment: PaymentInfo;
  InfoRowComponent: React.ComponentType<InfoRowProps>;
}) {
  return (
    <>
      <InfoRowComponent label="Subtotal" value={`Rs.${price.itemSubtotal}`} />
      <InfoRowComponent label="Delivery" value={`Rs.${price.deliveryFee}`} />
      {price.couponDiscount > 0 && (
        <InfoRowComponent label="Discount" value={`-Rs.${price.couponDiscount}`} />
      )}
      <div className={styles.totalRow}>
        <span>Total</span>
        <span>Rs.${price.amountPaid}</span>
      </div>
      
      <div className={styles.paymentMetaBox}>
         <InfoRowComponent label="Payment Method" value={payment.method} compact />
         <InfoRowComponent label="Status" value="Paid" statusBadge compact />
      </div>
    </>
  );
}
