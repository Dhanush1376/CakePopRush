import React, { useState } from 'react';
import { Ticket, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import styles from './CouponSection.module.css';
import sharedStyles from './CartComponents.module.css';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';
import { CouponModal } from './CouponModal';

export const CouponSection = () => {
  const { couponState, couponCode, applyCoupon, removeCoupon, couponDiscountValue } = useCart();
  const [inputValue, setInputValue] = useState(couponCode || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApply = () => {
    if (inputValue.trim()) {
      applyCoupon(inputValue);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setInputValue('');
  };

  return (
    <div className={sharedStyles.sectionCard}>
      <div className={sharedStyles.sectionHeader}>
        <h2 className={sharedStyles.sectionTitle}>COUPONS & OFFERS</h2>
        <button className={styles.viewAllBtn} onClick={() => setIsModalOpen(true)}>VIEW ALL</button>
      </div>

      <div className={styles.couponCard} onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
        <div className={styles.couponCardLeft}>
          <Ticket size={24} strokeWidth={1.5} className={styles.icon} />
          <div className={styles.couponCardText}>
            <span className={styles.title}>Apply Coupon</span>
            <span className={styles.subtitle}>Login to see best offers</span>
          </div>
        </div>
        <ChevronRight size={20} strokeWidth={1.5} className={styles.chevron} />
      </div>

      {couponState === 'applied' ? (
        <div className={styles.appliedState}>
          <div className={styles.appliedLeft}>
            <CheckCircle2 size={18} strokeWidth={2} className={styles.successIcon} />
            <div>
              <span className={styles.appliedCode}>{couponCode} applied</span>
              <p className={styles.savingsText}>You saved {formatCurrency(couponDiscountValue)}</p>
            </div>
          </div>
          <button className={styles.removeLink} onClick={handleRemove}>Remove</button>
        </div>
      ) : (
        <div className={styles.inputGroup}>
          <input 
            type="text"
            placeholder="ENTER COUPON CODE" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={styles.couponInput}
          />
          <button 
            className={styles.applyBtn}
            onClick={handleApply}
            disabled={!inputValue.trim()}
          >
            APPLY
          </button>
        </div>
      )}

      {couponState === 'invalid' && (
        <div className={styles.errorMsg}>
          <AlertCircle size={14} strokeWidth={1.5} />
          <span>Invalid coupon code</span>
        </div>
      )}
      
      {couponState === 'expired' && (
        <div className={styles.errorMsg}>
          <AlertCircle size={14} strokeWidth={1.5} />
          <span>This coupon has expired</span>
        </div>
      )}

      <CouponModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onApply={(code) => {
          setInputValue(code);
          applyCoupon(code);
        }} 
      />
    </div>
  );
};
