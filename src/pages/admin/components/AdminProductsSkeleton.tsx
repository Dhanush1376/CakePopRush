import React from 'react';
import styles from './AdminProductsSkeleton.module.css';

export function AdminProductsSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
        </div>
      </div>

      {/* Toolbar */}
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

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {Array.from({ length: 5 }).map((_, i) => (
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

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={`${styles.skeleton} ${styles.tableTitleSkeleton}`} />
        </div>
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeaderRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`th-${i}`} className={`${styles.skeleton} ${styles.thSkeleton}`} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className={styles.tableRow}>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <div key={`col-${colIndex}`} className={styles.cell}>
                  {colIndex === 0 ? (
                    <div className={styles.customerCell}>
                      <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                      <div>
                        <div className={`${styles.skeleton} ${styles.nameSkeleton}`} />
                        <div className={`${styles.skeleton} ${styles.emailSkeleton}`} />
                      </div>
                    </div>
                  ) : colIndex === 4 ? (
                    <div className={styles.actionsCell}>
                      <div className={`${styles.skeleton} ${styles.actionSkeleton}`} />
                      <div className={`${styles.skeleton} ${styles.actionSkeleton}`} />
                    </div>
                  ) : (
                    <div className={`${styles.skeleton} ${colIndex % 2 === 0 ? styles.badgeSkeleton : styles.textSkeleton}`} style={{ width: colIndex % 2 === 0 ? '60px' : '80%' }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile Cards Skeleton */}
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
