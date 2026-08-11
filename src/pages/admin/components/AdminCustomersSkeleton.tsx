import React from 'react';
import styles from './AdminCustomersSkeleton.module.css';

export function AdminCustomersSkeleton() {
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
        <div className={`${styles.skeleton} ${styles.searchSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.filterSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.filterSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.filterSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
      </div>

      {/* KPI Grid */}
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

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={`${styles.skeleton} ${styles.tableTitleSkeleton}`} />
        </div>
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeaderRow}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`th-${i}`} className={`${styles.skeleton} ${styles.thSkeleton}`} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
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
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '80%' }} />
              </div>
              {/* Orders */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '40%', margin: '0 auto' }} />
              </div>
              {/* Spent */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '60%' }} />
              </div>
              {/* Date */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '90%', marginBottom: '6px' }} />
                <div className={`${styles.skeleton} ${styles.textSkeleton}`} style={{ width: '60%' }} />
              </div>
              {/* Status */}
              <div className={styles.cell}>
                <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} style={{ margin: '0 auto' }} />
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
