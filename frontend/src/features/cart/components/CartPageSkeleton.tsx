import React from 'react';
import styles from './CartPageSkeleton.module.css';
import { Skeleton } from '@/components/ui/Skeleton';

export const CartPageSkeleton = () => {
  return (
    <div className={styles.skeletonLayout}>
      {/* LEFT SIDE: Cart Content */}
      <div className={styles.skeletonMain}>
        
        {/* Header Row */}
        <div className={styles.headerRow}>
          <Skeleton variant="text" width={180} height={28} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>

        {/* 3 Cart Item Skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.cartItemCard}>
            <Skeleton variant="rounded" width={110} height={110} />
            <div className={styles.itemDetails}>
              <div className={styles.itemHeader}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </div>
                <Skeleton variant="circular" width={24} height={24} />
              </div>
              <div className={styles.itemFooter}>
                <Skeleton variant="rounded" width={100} height={36} style={{ borderRadius: '20px' }} />
                <Skeleton variant="text" width={80} height={24} />
              </div>
            </div>
          </div>
        ))}

        {/* Coupon Section Skeleton */}
        <div style={{ marginTop: '24px' }}>
          <Skeleton variant="rounded" width="100%" height={80} style={{ borderRadius: '16px' }} />
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

          <Skeleton variant="rounded" width="100%" height={56} style={{ marginTop: '32px', borderRadius: '40px' }} />
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <Skeleton variant="text" width={220} height={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
