import React from 'react';
import styles from './CheckoutSkeleton.module.css';
import { Skeleton } from '@/components/ui/Skeleton';

export const CheckoutPaymentSkeleton = () => {
  return (
    <div className={styles.skeletonLayout}>
      {/* LEFT SIDE: Payment Details */}
      <div className={styles.skeletonMain}>
        
        {/* Date Input Section */}
        <div className={styles.paymentSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={200} height={24} />
          </div>
          <Skeleton variant="text" width={250} height={16} style={{ marginBottom: '16px' }} />
          <Skeleton variant="rounded" width="100%" height={48} />
          <Skeleton variant="text" width={200} height={14} style={{ marginTop: '8px' }} />
        </div>

        {/* Promo Banner Skeleton */}
        <div className={styles.paymentSection} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="80%" height={20} />
        </div>

        {/* Payment Options */}
        <div className={styles.paymentSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={180} height={24} />
          </div>
          
          {[1, 2].map((i) => (
            <div key={i} className={styles.paymentOption}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Skeleton variant="circular" width={20} height={20} />
                <div>
                  <Skeleton variant="text" width={120} height={20} style={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width={160} height={14} />
                </div>
              </div>
              <Skeleton variant="circular" width={24} height={24} />
            </div>
          ))}
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
