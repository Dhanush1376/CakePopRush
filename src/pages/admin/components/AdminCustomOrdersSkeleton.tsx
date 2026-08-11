import React from 'react';
import styles from './AdminCustomOrdersSkeleton.module.css';

export function AdminCustomOrdersSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`kpi-${i}`} className={styles.kpiCard}>
            <div className={`${styles.skeleton} ${styles.kpiIconSkeleton}`} />
            <div className={styles.kpiContent}>
              <div className={`${styles.skeleton} ${styles.kpiLabelSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.kpiValueSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.kpiTrendSkeleton}`} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={`${styles.skeleton} ${styles.searchSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.filterSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
      </div>

      <div className={styles.contentBlock}>
        <div className={styles.tableWrapper}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.customerCell}>
                <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                <div>
                  <div className={`${styles.skeleton} ${styles.nameSkeleton}`} />
                  <div className={`${styles.skeleton} ${styles.emailSkeleton}`} />
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
                <div className={styles.customerCell}>
                  <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                  <div>
                    <div className={`${styles.skeleton} ${styles.nameSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.emailSkeleton}`} />
                  </div>
                </div>
                <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} style={{ width: '60px' }} />
              </div>
              <div className={styles.mcRow}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '40%' }} />
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
