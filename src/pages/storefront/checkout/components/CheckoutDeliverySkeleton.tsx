import React from 'react';
import styles from './CheckoutSkeleton.module.css';
import { Skeleton } from '@/components/ui/Skeleton';

export const CheckoutDeliverySkeleton = () => {
  return (
    <div className={styles.skeletonLayout}>
      {/* LEFT SIDE: Delivery Details */}
      <div className={styles.skeletonMain}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Skeleton variant="text" width={180} height={24} />
        </div>

        {/* 2 Address Skeletons */}
        {[1, 2].map((i) => (
          <div key={i} className={styles.addressCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="rounded" width={50} height={20} />
              </div>
              <Skeleton variant="circular" width={24} height={24} />
            </div>
            <div style={{ paddingLeft: '32px' }}>
              <Skeleton variant="text" width="80%" height={16} style={{ marginBottom: '8px' }} />
              <Skeleton variant="text" width="60%" height={16} style={{ marginBottom: '8px' }} />
              <Skeleton variant="text" width="40%" height={16} />
            </div>
            <div style={{ paddingLeft: '32px', marginTop: '16px' }}>
              <Skeleton variant="text" width={150} height={16} />
            </div>
          </div>
        ))}
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
