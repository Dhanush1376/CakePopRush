import React from 'react';
import { OrderItemDetail } from '@/features/orders/types'
import styles from './AdminNewOrder.module.css';

export function OrderSummaryPanel({ form, mobileView }: { form: any, mobileView: 'form' | 'summary' }) {
  return (
    <div className={`${styles.stickySummary} ${mobileView === 'form' ? styles.hideOnMobile : ''}`}>
      <h3 className={styles.stickySummaryTitle}>Order Summary</h3>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Customer</span>
          <span className={styles.pricingValue} style={{textAlign: 'right'}}>{form.customerName || <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>Pending</span>}</span>
        </div>
        
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Items ({form.items.reduce((s: number, i: OrderItemDetail) => s + i.qty, 0)})</span>
          <span className={styles.pricingValue}>₹{form.pricing.subtotal.toFixed(2)}</span>
        </div>
        
        {form.pricing.discount > 0 && (
          <div className={styles.pricingRow}>
            <span className={styles.pricingLabel}>Discount</span>
            <span className={styles.pricingValue}>−₹{form.pricing.discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Tax (10%)</span>
          <span className={styles.pricingValue}>₹{form.pricing.tax.toFixed(2)}</span>
        </div>
        
        {form.fulfillmentType === 'delivery' && (
          <div className={styles.pricingRow}>
            <span className={styles.pricingLabel}>Delivery Fee</span>
            <span className={styles.pricingValue}>₹{form.pricing.deliveryFee.toFixed(2)}</span>
          </div>
        )}
        
        <div className={styles.divider} style={{margin: '4px 0'}} />
        
        <div className={styles.totalRow} style={{marginTop: 0}}>
          <span className={styles.totalLabel} style={{fontSize: 'var(--font-size-base)'}}>Total</span>
          <span className={styles.totalValue} style={{fontSize: 'var(--font-size-xl)'}}>₹{form.pricing.total.toFixed(2)}</span>
        </div>

        <div className={styles.divider} style={{margin: '4px 0'}} />

        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Payment</span>
          <span className={styles.pricingValue}>{form.paymentStatus}</span>
        </div>
      </div>
    </div>
  );
}
