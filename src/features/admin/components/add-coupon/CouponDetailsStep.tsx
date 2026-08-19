import React from 'react';
import { Input } from '@/components/ui/Input';
import { CouponFormProps } from './useCouponForm';
import styles from './AdminAddCoupon.module.css';

export function CouponDetailsStep({
  code, setCode, errors, setErrors, generateCode,
  description, setDescription,
}: CouponFormProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Coupon Details</h2>
      <p className={styles.sectionSubtitle}>Create the code customers will use at checkout.</p>
      
      <div className={styles.mediaBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 className={styles.mediaBoxTitle} style={{ margin: 0 }}>COUPON CODE</h3>
          <button 
            type="button" 
            onClick={generateCode} 
            style={{ color: '#F21B5B', background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            Generate Code
          </button>
        </div>
        <Input 
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/\s/g, ''));
            if (errors.code) setErrors((prev: Record<string, string>) => ({ ...prev, code: '' }));
          }}
          placeholder="e.g. SUMMER20"
          error={errors.code}
          fullWidth
          style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Customers will enter this code at checkout.</p>
      </div>

      <div className={styles.mediaBox}>
        <h3 className={styles.mediaBoxTitle}>INTERNAL DESCRIPTION (OPTIONAL)</h3>
        <Input 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: Independence Day promotional coupon"
          fullWidth
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Only visible to admins.</p>
      </div>

      
    </div>
  );
}
