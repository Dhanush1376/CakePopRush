import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './AdminAddCoupon.module.css';

export function AdminAddCouponSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.backBtn} style={{ background: '#f5f5f5', border: 'none' }} />
          <div className={styles.titleWrapper}>
            <Skeleton width={150} height={20} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '8px' }} />
            <Skeleton width={200} height={14} variant="rectangular" style={{ borderRadius: '4px' }} />
          </div>
        </div>
        <div className={styles.headerRight}>
          <Skeleton width={80} height={40} variant="rectangular" style={{ borderRadius: '100px' }} />
          <Skeleton width={140} height={40} variant="rectangular" style={{ borderRadius: '100px', marginLeft: '12px' }} />
        </div>
      </div>

      {/* Stepper Skeleton */}
      <div className={`${styles.stepperContainer} ${styles.desktopOnly}`}>
        <div className={styles.stepper}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <React.Fragment key={i}>
              <div className={styles.step}>
                <Skeleton width={32} height={32} variant="circular" />
                <Skeleton width={60} height={16} variant="rectangular" style={{ borderRadius: '4px', marginLeft: '12px' }} />
              </div>
              {i < 6 && <div className={styles.stepLine} style={{ opacity: 0.2 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile Stepper Skeleton */}
      <div className={styles.mobileOnly}>
         <Skeleton width="100%" height={80} variant="rectangular" style={{ borderRadius: '12px', marginBottom: '16px' }} />
         <Skeleton width="100%" height={48} variant="rectangular" style={{ borderRadius: '100px', marginBottom: '24px' }} />
      </div>

      {/* Main Grid Skeleton */}
      <div className={styles.mainGrid}>
        {/* Left Column Skeleton */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <Skeleton width={180} height={24} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '12px' }} />
            <Skeleton width={260} height={16} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '24px' }} />
            
            <div className={styles.mediaBox}>
              <Skeleton width={100} height={14} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '16px' }} />
              <Skeleton width="100%" height={48} variant="rectangular" style={{ borderRadius: '8px', marginBottom: '8px' }} />
              <Skeleton width={140} height={12} variant="rectangular" style={{ borderRadius: '4px' }} />
            </div>

            <div className={styles.mediaBox}>
              <Skeleton width={200} height={14} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '16px' }} />
              <Skeleton width="100%" height={48} variant="rectangular" style={{ borderRadius: '8px', marginBottom: '8px' }} />
              <Skeleton width={120} height={12} variant="rectangular" style={{ borderRadius: '4px' }} />
            </div>
            
            <div className={styles.mediaFooter} style={{ marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
               <Skeleton width={120} height={40} variant="rectangular" style={{ borderRadius: '100px' }} />
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className={`${styles.card} ${styles.desktopOnly}`}>
          <Skeleton width={140} height={24} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '12px' }} />
          <Skeleton width={200} height={16} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '24px' }} />
          
          <Skeleton width="100%" height={120} variant="rectangular" style={{ borderRadius: '12px', marginBottom: '24px' }} />

          {[1, 2, 3, 4, 5].map(i => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
               <Skeleton width={20} height={20} variant="circular" style={{ marginRight: '12px' }} />
               <Skeleton width={180} height={16} variant="rectangular" style={{ borderRadius: '4px' }} />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
