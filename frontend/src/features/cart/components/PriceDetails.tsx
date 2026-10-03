import React from 'react';
import styles from './PriceDetails.module.css';
import sharedStyles from './CartComponents.module.css';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';

export const PriceDetails = () => {
  const { totalItems, totalMRP, totalDiscount, couponDiscountValue, shippingFee, total } = useCart();

  return (
    <div className={sharedStyles.sectionCard}>
      <div className={sharedStyles.sectionHeader}>
        <h2 className={sharedStyles.sectionTitle}>PRICE DETAILS ({totalItems} ITEM{totalItems > 1 ? 'S' : ''})</h2>
      </div>

      <div className={styles.detailsList}>
        <div className={styles.row}>
          <span className={styles.label}>Total MRP</span>
          <span className={styles.value}>{formatCurrency(totalMRP)}</span>
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
          <span className={styles.label}>Delivery Fee</span>
          <span className={styles.value}>
            <span style={{ color: '#7A685D', fontSize: '13px' }}>Calculated at checkout</span>
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
