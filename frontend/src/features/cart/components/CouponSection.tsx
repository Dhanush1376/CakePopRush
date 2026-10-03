import React, { useState } from 'react';
import { Tag, CheckCircle2 } from 'lucide-react';
import styles from './CouponSection.module.css';
import sharedStyles from './CartComponents.module.css';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';
import { CouponModal } from './CouponModal';

export const CouponSection = () => {
  const { couponState, couponCode, applyCoupon, removeCoupon, couponDiscountValue } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCoupon();
  };

  return (
    <div className={`${sharedStyles.sectionCard} ${styles.couponSectionCard}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Coupons</h2>
      </div>

      <div className={styles.divider} />

      {couponState === 'applied' ? (
        <div className={styles.appliedRow}>
          <div className={styles.appliedLeft}>
            <CheckCircle2 size={18} strokeWidth={2.2} className={styles.successIcon} />
            <div className={styles.appliedText}>
              <span className={styles.appliedCode}>{couponCode} applied</span>
              <p className={styles.savingsText}>You saved {formatCurrency(couponDiscountValue)}</p>
            </div>
          </div>
          <button className={styles.removeBtn} onClick={handleRemove}>
            Remove
          </button>
        </div>
      ) : (
        <div className={styles.couponRow} onClick={() => setIsModalOpen(true)} role="button" tabIndex={0}>
          <div className={styles.couponRowLeft}>
            <Tag size={17} strokeWidth={2.2} className={styles.tagIcon} />
            <div className={styles.labelCol}>
              <span className={styles.couponRowLabel}>Apply Promo Code</span>
              <span className={styles.couponRowSub}>Check available offers</span>
            </div>
          </div>
          <button 
            type="button" 
            className={styles.applyOutlineBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            Apply
          </button>
        </div>
      )}

      <CouponModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onApply={(code) => {
          applyCoupon(code);
        }} 
      />
    </div>
  );
};
