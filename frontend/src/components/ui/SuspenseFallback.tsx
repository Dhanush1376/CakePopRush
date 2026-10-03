import React from 'react';
import styles from './SuspenseFallback.module.css';

export function SuspenseFallback() {
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  return (
    <div className={styles.fallbackWrapper} role="status" aria-label="Loading page...">
      {isAdmin ? (
        <div className={styles.adminLayout}>
          {/* Header Skeleton */}
          <div className={styles.adminHeader}>
            <div className={styles.adminHeaderLeft}>
              <div className={`${styles.adminTitle} ${styles.shimmer}`} />
              <div className={`${styles.adminSubtitle} ${styles.shimmer}`} />
            </div>
            <div className={`${styles.adminActionBtn} ${styles.shimmer}`} />
          </div>

          {/* Stats KPI Row Skeleton */}
          <div className={styles.adminStatsRow}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.adminStatCard} ${styles.shimmer}`} />
            ))}
          </div>

          {/* Toolbar Skeleton */}
          <div className={`${styles.adminToolbar} ${styles.shimmer}`} />

          {/* Content Rows / Cards Skeleton */}
          <div className={styles.adminCardList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.adminCardItem} ${styles.shimmer}`} />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.storefrontLayout}>
          {/* Hero Banner Skeleton */}
          <div className={`${styles.storefrontHero} ${styles.shimmer}`} />

          {/* Category Pills Skeleton */}
          <div className={styles.storefrontCategories}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`${styles.storefrontPill} ${styles.shimmer}`} />
            ))}
          </div>

          {/* Product Grid Skeleton */}
          <div className={styles.storefrontGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={styles.storefrontCard}>
                <div className={`${styles.storefrontCardImage} ${styles.shimmer}`} />
                <div className={`${styles.storefrontCardTitle} ${styles.shimmer}`} />
                <div className={`${styles.storefrontCardPrice} ${styles.shimmer}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SuspenseFallback;
