import React from 'react';
import { ShoppingBag, Calendar, Ticket, User, Grid } from 'lucide-react';
import { CouponFormProps } from './useCouponForm';
import styles from './AdminAddCoupon.module.css';

export function CouponPreviewPanel({
  mobileView, code, discountType, discountValue, description, minOrderValue,
  noExpiry, endDate, unlimitedUsage, usageLimit, firstOrderOnly,
  customerEligibility, appliesTo
}: CouponFormProps) {
  return (
    <div className={`${styles.card} ${mobileView === 'edit' ? styles.hideOnMobile : ''}`} style={{ alignSelf: 'start', position: 'sticky', top: '24px' }}>
      <h2 className={styles.sectionTitle}>Coupon Preview</h2>
      <p className={styles.sectionSubtitle} style={{ marginBottom: '24px' }}>Live summary of your configuration</p>

      <div className={styles.couponPreviewBanner}>
        <div className={styles.couponPreviewCode}>{code || 'COUPON CODE'}</div>
        <div className={styles.couponPreviewDiscount}>
          {discountValue ? (discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`) : '0% OFF'}
        </div>
        {description && <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px', textAlign: 'center' }}>{description}</div>}
      </div>

      <ul className={styles.couponPreviewList}>
        {minOrderValue && (
          <li className={styles.couponPreviewItem}>
            <ShoppingBag size={14} className={styles.couponPreviewIcon} />
            <span>On orders above <strong>₹{minOrderValue}</strong></span>
          </li>
        )}
        
        <li className={styles.couponPreviewItem}>
          <Calendar size={14} className={styles.couponPreviewIcon} />
          <span>
            {noExpiry 
              ? 'No expiry date' 
              : `Valid until ${endDate ? new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'set date'}`
            }
          </span>
        </li>
        
        {!unlimitedUsage && usageLimit && (
          <li className={styles.couponPreviewItem}>
            <Ticket size={14} className={styles.couponPreviewIcon} />
            <span><strong>{usageLimit}</strong> total uses available</span>
          </li>
        )}

        <li className={styles.couponPreviewItem}>
          <User size={14} className={styles.couponPreviewIcon} />
          <span>
            {firstOrderOnly 
              ? 'For first-time customers only' 
              : (customerEligibility === 'everyone' ? 'For all customers' : 'For specific customers')}
          </span>
        </li>

        {(appliesTo !== 'store') && (
          <li className={styles.couponPreviewItem}>
            <Grid size={14} className={styles.couponPreviewIcon} />
            <span>
              Valid on specific {appliesTo === 'products' ? 'products' : 'categories'}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
