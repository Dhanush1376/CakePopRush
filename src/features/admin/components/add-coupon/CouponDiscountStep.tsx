import React from 'react';
import { Input } from '@/components/ui/Input';
import { CouponFormProps } from './useCouponForm';
import styles from './AdminAddCoupon.module.css';

export function CouponDiscountStep({
  discountType, setDiscountType, errors, setErrors,
  discountValue, setDiscountValue, hasMaxDiscount, setHasMaxDiscount,
  maxDiscountValue, setMaxDiscountValue, minOrderValue, setMinOrderValue,
}: CouponFormProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Discount</h2>
      <p className={styles.sectionSubtitle}>Choose how much customers will save.</p>
      
      <div className={styles.segmentedControl}>
        <button 
          className={`${styles.segmentedBtn} ${discountType === 'percentage' ? styles.segmentedBtnActive : ''}`}
          onClick={() => {
            setDiscountType('percentage');
            if (errors.discountValue) setErrors((prev: Record<string, string>) => ({ ...prev, discountValue: '' }));
          }}
        >
          Percentage
        </button>
        <button 
          className={`${styles.segmentedBtn} ${discountType === 'fixed' ? styles.segmentedBtnActive : ''}`}
          onClick={() => {
            setDiscountType('fixed');
            setHasMaxDiscount(false);
            if (errors.discountValue) setErrors((prev: Record<string, string>) => ({ ...prev, discountValue: '' }));
          }}
        >
          Fixed Amount
        </button>
      </div>

      <div className={styles.rowGrid}>
        <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
          <h3 className={styles.mediaBoxTitle}>{discountType === 'percentage' ? 'DISCOUNT (%)' : 'DISCOUNT AMOUNT (₹)'}</h3>
          <Input 
            value={discountValue}
            onChange={(e) => {
              setDiscountValue(e.target.value.replace(/[^0-9.]/g, ''));
              if (errors.discountValue) setErrors((prev: Record<string, string>) => ({ ...prev, discountValue: '' }));
            }}
            placeholder={discountType === 'percentage' ? "20" : "500"}
            leftIcon={discountType === 'percentage' ? '%' : '₹'}
            error={errors.discountValue}
            fullWidth
          />
        </div>

        <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
          <h3 className={styles.mediaBoxTitle}>MINIMUM ORDER VALUE</h3>
          <Input 
            value={minOrderValue}
            onChange={(e) => {
              setMinOrderValue(e.target.value.replace(/[^0-9]/g, ''));
              if (errors.minOrderValue) setErrors((prev: Record<string, string>) => ({ ...prev, minOrderValue: '' }));
            }}
            placeholder="No minimum"
            leftIcon="₹"
            error={errors.minOrderValue}
            fullWidth
          />
        </div>
      </div>

      {discountType === 'percentage' && (
        <div className={styles.mediaBox} style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasMaxDiscount ? '16px' : '0' }}>
            <div>
              <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>SET MAXIMUM DISCOUNT</h3>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Prevent unlimited discounts on large orders.</p>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={hasMaxDiscount} onChange={(e) => setHasMaxDiscount(e.target.checked)} />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          {hasMaxDiscount && (
            <Input 
              value={maxDiscountValue}
              onChange={(e) => setMaxDiscountValue(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 1000"
              leftIcon="₹"
              fullWidth
            />
          )}
        </div>
      )}

      
    </div>
  );
}
