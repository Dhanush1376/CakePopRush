import React from 'react';
import { Input } from '@/components/ui/Input';
import { CouponFormProps } from './useCouponForm';
import styles from './AdminAddCoupon.module.css';

export function CouponUsageLimitsStep({
  unlimitedUsage, setUnlimitedUsage, usageLimit, setUsageLimit,
  limitPerCustomer, setLimitPerCustomer, customLimit, setCustomLimit,
}: CouponFormProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Usage Limits</h2>
      <p className={styles.sectionSubtitle}>Control how many times this coupon can be used.</p>

      <div className={styles.mediaBox}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: !unlimitedUsage ? '16px' : '0' }}>
          <div>
            <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>UNLIMITED TOTAL USAGE</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Uncheck to limit the total number of times this coupon can be used.</p>
          </div>
          <label className={styles.toggleSwitch}>
            <input type="checkbox" checked={unlimitedUsage} onChange={(e) => setUnlimitedUsage(e.target.checked)} />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        {!unlimitedUsage && (
          <Input 
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 500"
            leftIcon="#"
            fullWidth
          />
        )}
      </div>

      <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
        <h3 className={styles.mediaBoxTitle}>LIMIT PER CUSTOMER</h3>
        <select 
          className={styles.textAreaInput} 
          style={{ height: '42px', padding: '0 14px' }}
          value={limitPerCustomer}
          onChange={(e) => setLimitPerCustomer(e.target.value)}
        >
          <option value="unlimited">Unlimited uses per customer</option>
          <option value="1">1 use per customer</option>
          <option value="2">2 uses per customer</option>
          <option value="3">3 uses per customer</option>
          <option value="custom">Custom amount...</option>
        </select>
        
        {limitPerCustomer === 'custom' && (
          <div style={{ marginTop: '12px' }}>
            <Input 
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 5"
              fullWidth
            />
          </div>
        )}
      </div>

      
    </div>
  );
}
