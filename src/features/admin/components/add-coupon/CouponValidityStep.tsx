import React from 'react';
import { Input } from '@/components/ui/Input';
import { CouponFormProps } from './useCouponForm';
import styles from './AdminAddCoupon.module.css';

export function CouponValidityStep({
  startDate, setStartDate, endDate, setEndDate,
  noExpiry, setNoExpiry, errors, setErrors,
}: CouponFormProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Coupon Validity</h2>
      <p className={styles.sectionSubtitle}>Choose when this coupon can be used.</p>
      
      <div className={styles.rowGrid}>
        <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
          <h3 className={styles.mediaBoxTitle}>START DATE</h3>
          <Input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
          />
        </div>

        {!noExpiry && (
          <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
            <h3 className={styles.mediaBoxTitle}>END DATE</h3>
            <Input 
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (errors.endDate) setErrors((prev: Record<string, string>) => ({ ...prev, endDate: '' }));
              }}
              error={errors.endDate}
              fullWidth
              min={startDate}
            />
          </div>
        )}
      </div>

      <div className={styles.mediaBox} style={{ marginTop: '16px', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>NO EXPIRY</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Coupon will remain active indefinitely.</p>
        </div>
        <label className={styles.toggleSwitch}>
          <input type="checkbox" checked={noExpiry} onChange={(e) => {
            setNoExpiry(e.target.checked);
            if (e.target.checked && errors.endDate) setErrors((prev: Record<string, string>) => ({ ...prev, endDate: '' }));
          }} />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>

      
    </div>
  );
}
