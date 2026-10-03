import React from 'react';
import styles from './CheckoutSkeleton.module.css';
import { Skeleton } from '@/components/ui/Skeleton';

export const CheckoutPaymentSkeleton = () => {
  return (
    <div className={styles.skeletonLayout}>
      {/* LEFT SIDE: Payment Details */}
      <div className={styles.skeletonMain}>
        
        {/* Payment Options Section */}
        <div className={styles.paymentSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: '4px' }}>
            <Skeleton variant="text" width={130} height={20} />
          </div>
          
          {/* Card 1: Selected / Online Payment */}
          <div className={`${styles.paymentOption} ${styles.selectedPaymentOption}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Skeleton variant="circular" width={18} height={18} />
                <Skeleton variant="text" width={120} height={20} />
              </div>
              <Skeleton variant="circular" width={34} height={34} />
            </div>
            <div style={{ paddingLeft: '27px' }}>
              <Skeleton variant="text" width="80%" height={14} />
            </div>
          </div>

          {/* Card 2: Cash on Delivery */}
          <div className={styles.paymentOption}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Skeleton variant="circular" width={18} height={18} />
                <Skeleton variant="text" width={110} height={20} />
              </div>
              <Skeleton variant="circular" width={34} height={34} />
            </div>
            <div style={{ paddingLeft: '27px' }}>
              <Skeleton variant="text" width="70%" height={14} />
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Summary */}
      <div className={styles.skeletonSidebar}>
        <div className={styles.summaryCard}>
          <Skeleton variant="text" width={160} height={28} style={{ marginBottom: '24px' }} />
          
          <div className={styles.summaryRow}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={80} height={20} />
          </div>
          <div className={styles.summaryRow}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={60} height={20} />
          </div>
          <div className={styles.summaryRow}>
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={90} height={20} />
          </div>

          <div className={styles.summaryDivider}>
            <Skeleton variant="rectangular" width="100%" height={1} />
          </div>

          <div className={styles.summaryRow}>
            <Skeleton variant="text" width={100} height={28} />
            <Skeleton variant="text" width={120} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
};
