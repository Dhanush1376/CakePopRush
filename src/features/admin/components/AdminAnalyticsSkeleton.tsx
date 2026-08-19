import React from 'react';
import styles from './AdminAnalyticsSkeleton.module.css';

export function AdminAnalyticsSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.datePickerSkeleton}`} />
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <div className={`${styles.skeleton} ${styles.kpiIconSkeleton}`} />
              <div className={styles.kpiContent}>
                <div className={`${styles.skeleton} ${styles.kpiLabelSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.kpiValueSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.kpiTrendSkeleton}`} />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Row 1: Charts */}
      <div className={styles.chartsRow1}>
        {/* Revenue Overview */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.skeleton} ${styles.chartTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.chartActionSkeleton}`} />
          </div>
          <div className={`${styles.skeleton} ${styles.chartLegendSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.largeChartSkeleton}`} />
        </div>

        {/* Orders Overview */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.skeleton} ${styles.chartTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.chartActionSkeleton}`} />
          </div>
          <div className={styles.donutSkeletonWrapper}>
            <div className={`${styles.skeleton} ${styles.donutCircleSkeleton}`} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className={`${styles.skeleton} ${styles.donutLegendItem}`} />
              <div className={`${styles.skeleton} ${styles.donutLegendItem}`} />
              <div className={`${styles.skeleton} ${styles.donutLegendItem}`} />
            </div>
          </div>
        </div>

        {/* Top Traffic Sources */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.skeleton} ${styles.chartTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.chartActionSkeleton}`} />
          </div>
          <div className={styles.donutSkeletonWrapper}>
            <div className={`${styles.skeleton} ${styles.donutCircleSkeleton}`} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className={`${styles.skeleton} ${styles.donutLegendItem}`} />
              <div className={`${styles.skeleton} ${styles.donutLegendItem}`} />
              <div className={`${styles.skeleton} ${styles.donutLegendItem}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts and Lists */}
      <div className={styles.chartsRow2}>
        {/* Sales Over Time */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.skeleton} ${styles.chartTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.chartActionSkeleton}`} />
          </div>
          <div className={`${styles.skeleton} ${styles.chartLegendSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.largeChartSkeleton}`} />
        </div>

        {/* Best Selling Products */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.skeleton} ${styles.chartTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.chartActionSkeleton}`} />
          </div>
          <div className={styles.listArea}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.listItem}>
                <div className={`${styles.skeleton} ${styles.listImgSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.listTextSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.listValSkeleton}`} />
              </div>
            ))}
          </div>
        </div>

        {/* User Activity */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={`${styles.skeleton} ${styles.chartTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.chartActionSkeleton}`} />
          </div>
          <div className={styles.listArea}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.listItem}>
                <div className={`${styles.skeleton} ${styles.listImgSkeleton}`} style={{ borderRadius: '50%' }} />
                <div className={`${styles.skeleton} ${styles.listTextSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.listValSkeleton}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
