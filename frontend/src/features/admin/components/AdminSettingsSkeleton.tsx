import React from 'react';
import styles from './AdminSettingsSkeleton.module.css';

export function AdminSettingsSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.skeleton + ' ' + styles.titleSkeleton} />
          <div className={styles.skeleton + ' ' + styles.subtitleSkeleton} />
        </div>
      </div>
      
      <div className={styles.workspace}>
        {/* Nav Panel Skeleton */}
        <div className={styles.navPanel}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.navItemSkeleton}>
              <div className={styles.skeleton + ' ' + styles.navIconSkeleton} />
              <div className={styles.skeleton + ' ' + styles.navTextSkeleton} />
            </div>
          ))}
        </div>

        {/* Form Content Skeleton */}
        <div className={styles.formContent}>
          <div className={styles.card}>
            <div className={styles.skeleton + ' ' + styles.cardTitleSkeleton} />
            <div className={styles.skeleton + ' ' + styles.cardSubtitleSkeleton} />
            
            <div className={styles.skeleton + ' ' + styles.inputSkeleton} style={{ marginTop: '24px' }} />
            <div className={styles.skeleton + ' ' + styles.inputSkeleton} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className={styles.skeleton + ' ' + styles.inputSkeleton} />
              <div className={styles.skeleton + ' ' + styles.inputSkeleton} />
            </div>
            
            <div className={styles.skeleton + ' ' + styles.textareaSkeleton} />
          </div>
        </div>
      </div>
    </div>
  );
}
