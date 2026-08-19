import React from 'react';
import { Search, User, X } from 'lucide-react';
import { CouponFormProps } from './useCouponForm';
import styles from './AdminAddCoupon.module.css';

export function CouponEligibilityStep({
  customerEligibility, setCustomerEligibility, selectedCustomers, setSelectedCustomers,
  removeItem, firstOrderOnly, setFirstOrderOnly,
}: CouponFormProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Customer Eligibility</h2>
      <p className={styles.sectionSubtitle}>Choose who can use this coupon.</p>

      <div className={styles.segmentedControl}>
        <button 
          className={`${styles.segmentedBtn} ${customerEligibility === 'everyone' ? styles.segmentedBtnActive : ''}`}
          onClick={() => setCustomerEligibility('everyone')}
        >
          Everyone
        </button>
        <button 
          className={`${styles.segmentedBtn} ${customerEligibility === 'specific' ? styles.segmentedBtnActive : ''}`}
          onClick={() => setCustomerEligibility('specific')}
        >
          Specific Customers
        </button>
      </div>

      {customerEligibility === 'everyone' && (
        <div className={styles.mediaBox} style={{ marginBottom: '16px', textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#FFF0F5', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#F21B5B' }}>
            <User size={24} />
          </div>
          <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '8px' }}>AVAILABLE TO EVERYONE</h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0, maxWidth: '300px' }}>Any customer with this code will be able to apply the discount.</p>
        </div>
      )}

      {customerEligibility === 'specific' && (
        <div className={styles.mediaBox} style={{ marginBottom: '16px' }}>
          <h3 className={styles.mediaBoxTitle}>SEARCH CUSTOMERS</h3>
          <div className={styles.inputWithIcon} style={{ marginBottom: '12px' }}>
            <span className={styles.inputIcon}><Search size={14} /></span>
            <input type="text" placeholder="Search by name, phone or email..." className={styles.urlInput} style={{paddingLeft: '36px'}} />
          </div>
          <div className={styles.chipGroup}>
            {selectedCustomers.map((customer: string, idx: number) => (
              <div key={idx} className={styles.chip}>
                {customer}
                <button type="button" onClick={() => removeItem(setSelectedCustomers, idx)}><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.mediaBox} style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>FIRST ORDER ONLY</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Allow this coupon only for a customer's first purchase.</p>
        </div>
        <label className={styles.toggleSwitch}>
          <input type="checkbox" checked={firstOrderOnly} onChange={(e) => setFirstOrderOnly(e.target.checked)} />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>

      
    </div>
  );
}
