import React from 'react';
import styles from './AdminNotificationsSkeleton.module.css';

export function AdminNotificationsSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <div className={`${styles.skeleton} ${styles.searchSkeleton}`} />
        </div>
        
        <div className={styles.filtersScrollContainer}>
          <div className={`${styles.skeleton} ${styles.filterSelectSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.filterSelectSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.filterSelectSkeleton}`} />
        </div>
        
        <div className={styles.actionButtons}>
          <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
        </div>
      </div>

      <div className={styles.statsGrid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`stat-${i}`} className={styles.statCard}>
            <div className={`${styles.skeleton} ${styles.statIconSkeleton}`} />
            <div className={styles.statContent}>
              <div className={`${styles.skeleton} ${styles.statLabelSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.statValueSkeleton}`} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.contentBlock}>
        <div className={styles.tableWrapper}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.notifCell}>
                <div className={`${styles.skeleton} ${styles.iconSkeleton}`} />
                <div>
                  <div className={`${styles.skeleton} ${styles.titleLine}`} />
                  <div className={`${styles.skeleton} ${styles.subLine}`} />
                </div>
              </div>
              <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.textSkeleton}`} />
            </div>
          ))}
        </div>

        <div className={styles.mobileCards}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`mc-${i}`} className={styles.mobileCard}>
              <div className={styles.mcHeader}>
                <div className={styles.notifCell}>
                  <div className={`${styles.skeleton} ${styles.iconSkeleton}`} />
                  <div>
                    <div className={`${styles.skeleton} ${styles.titleLine}`} />
                    <div className={`${styles.skeleton} ${styles.subLine}`} />
                  </div>
                </div>
              </div>
              <div className={styles.mcRow}>
                <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} style={{ width: '60px' }} />
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
