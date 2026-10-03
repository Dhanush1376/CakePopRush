import React from 'react';
import styles from './AdminCustomersSkeleton.module.css';

export function AdminCustomersSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={styles.statsSubtitleSkeleton}>
            <div className={`${styles.skeleton} ${styles.statBadgeSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.statBadgeSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.statBadgeSkeleton}`} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <div className={`${styles.skeleton} ${styles.searchSkeleton}`} />
        </div>
        
        <div className={styles.actionButtons}>
          <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.toggleSkeleton}`} />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeaderRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`th-${i}`} className={`${styles.skeleton} ${styles.thSkeleton}`} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className={styles.tableRow}>
              {/* Customer Cell */}
              <div className={styles.cell}>
                <div className={styles.customerCell}>
                  <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                  <div>
                    <div className={`${styles.skeleton} ${styles.nameSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.emailSkeleton}`} />
                  </div>
                </div>
              </div>
              {/* Location */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '70%' }} />
              </div>
              {/* Orders */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '50%' }} />
              </div>
              {/* Spent */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '60%' }} />
              </div>
              {/* Tier */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} style={{ width: '65px' }} />
              </div>
              {/* Date */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '80%' }} />
              </div>
              {/* Status */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} style={{ width: '60px' }} />
              </div>
              {/* Actions */}
              <div className={styles.cell}>
                <div className={styles.actionsCell}>
                  <div className={`${styles.skeleton} ${styles.actionSkeleton}`} />
                  <div className={`${styles.skeleton} ${styles.actionSkeleton}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminCustomersSkeleton;
