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
          <div className={`${styles.skeleton} ${styles.toggleSkeleton}`} />
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
              {/* Row 1: Avatar, Name, ID, Badge */}
              <div className={styles.mcHeader}>
                <div className={styles.customerCell}>
                  <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                  <div>
                    <div className={`${styles.skeleton} ${styles.nameSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.emailSkeleton}`} style={{ width: '80px', height: '11px' }} />
                  </div>
                </div>
                <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} style={{ width: '70px', height: '22px' }} />
              </div>

              {/* Row 2: Email & Date */}
              <div className={styles.mcSubRow}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '45%', height: '12px' }} />
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '25%', height: '12px' }} />
              </div>

              {/* Row 3: Scope Box */}
              <div className={styles.mcScopeBox}>
                <div className={`${styles.skeleton} ${styles.mcScopeThumb}`} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '40%', height: '10px' }} />
                  <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '70%', height: '13px' }} />
                </div>
              </div>

              {/* Row 4: Action Toolbar */}
              <div className={styles.mcActionToolbar}>
                <div className={`${styles.skeleton} ${styles.mcActionBtn}`} />
                <div className={`${styles.skeleton} ${styles.mcWhatsAppBtn}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
