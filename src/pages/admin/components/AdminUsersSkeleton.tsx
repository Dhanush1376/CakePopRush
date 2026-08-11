import React from 'react';
import styles from './AdminUsersSkeleton.module.css';

export function AdminUsersSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.skeleton + ' ' + styles.titleSkeleton} />
          <div className={styles.skeleton + ' ' + styles.subtitleSkeleton} />
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.skeleton + ' ' + styles.searchSkeleton} />
        <div className={styles.skeleton + ' ' + styles.btnSkeleton} />
        <div className={styles.skeleton + ' ' + styles.btnSkeleton} />
      </div>
      <div className={styles.contentBlock}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className={styles.skeleton + ' ' + styles.contentLine} />
            <div className={styles.skeleton + ' ' + styles.contentLineShort} style={{ marginBottom: '32px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
