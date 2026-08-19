import React from 'react';
import styles from './PriceDetails.module.css';
import sharedStyles from './CartComponents.module.css';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';

export const PriceDetails = () => {
  const { totalItems, subtotal, totalDiscount, couponDiscountValue, shippingFee, total } = useCart();

  const isShippingCalculated = shippingFee > 0 || totalItems === 0;

  return (
    <div className={sharedStyles.sectionCard}>
      <div className={sharedStyles.sectionHeader}>
        <h2 className={sharedStyles.sectionTitle}>PRICE DETAILS ({totalItems} ITEM{totalItems > 1 ? 'S' : ''})</h2>
      </div>

      <div className={styles.detailsList}>
        <div className={styles.row}>
          <span className={styles.label}>Total MRP</span>
          <span className={styles.value}>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className={styles.row}>
          <span className={styles.label}>Discount on MRP</span>
          <span className={`${styles.value} ${styles.discountValue}`}>
            - {formatCurrency(totalDiscount)}
          </span>
        </div>
        
        {couponDiscountValue > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>Coupon Discount</span>
            <span className={`${styles.value} ${styles.discountValue}`}>
              - {formatCurrency(couponDiscountValue)}
            </span>
          </div>
        )}
        
        <div className={styles.row}>
          <span className={styles.label}>Shipping Fee</span>
          <span className={styles.value}>
            {isShippingCalculated ? (shippingFee === 0 ? <span className={styles.freeShipping}>FREE</span> : formatCurrency(shippingFee)) : <span className={styles.calcMsg}>Calculated at checkout</span>}
          </span>
        </div>
      </div>

      <hr className={sharedStyles.divider} />

      <div className={`${styles.row} ${styles.totalRow}`}>
        <span className={styles.totalLabel}>TOTAL AMOUNT</span>
        <span className={styles.totalValue}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
