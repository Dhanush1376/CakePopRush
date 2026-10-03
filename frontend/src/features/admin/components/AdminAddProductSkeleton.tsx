import React from 'react';
import styles from './AdminAddProductSkeleton.module.css';

export function AdminAddProductSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.actionBtn}`} />
      </div>

      {/* Mobile Stepper Skeleton */}
      <div className={styles.mobileOnly}>
        <div className={styles.mobileStepperCard}>
          <div className={`${styles.skeleton} ${styles.mobileStepperIcon}`} />
          <div className={styles.mobileStepperInfo}>
            <div className={`${styles.skeleton} ${styles.mobileStepCount}`} />
            <div className={`${styles.skeleton} ${styles.mobileStepLabel}`} />
          </div>
          <div className={`${styles.skeleton} ${styles.mobileProgressBar}`} />
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column: Form Area */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div>
              <div className={`${styles.skeleton} ${styles.cardTitle}`} />
              <div className={`${styles.skeleton} ${styles.cardSubtitle}`} />
            </div>

            <div className={`${styles.skeleton} ${styles.mediaBox}`} />

            <div className={styles.formGroup}>
              <div className={`${styles.skeleton} ${styles.label}`} />
              <div className={`${styles.skeleton} ${styles.input}`} />
            </div>

            <div className={styles.formGroup}>
              <div className={`${styles.skeleton} ${styles.label}`} />
              <div className={`${styles.skeleton} ${styles.input}`} style={{ height: '120px', borderRadius: '16px' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={styles.formGroup}>
                <div className={`${styles.skeleton} ${styles.label}`} />
                <div className={`${styles.skeleton} ${styles.input}`} />
              </div>
              <div className={styles.formGroup}>
                <div className={`${styles.skeleton} ${styles.label}`} />
                <div className={`${styles.skeleton} ${styles.input}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Stepper */}
        <div className={styles.rightColumn}>
          <div className={`${styles.stepperCard} ${styles.desktopOnly}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.stepperItem}>
                <div className={`${styles.skeleton} ${styles.stepperIcon}`} />
                <div className={`${styles.skeleton} ${styles.stepperText}`} />
              </div>
            ))}
          </div>

          <div className={`${styles.skeleton} ${styles.previewCard}`} />
        </div>
      </div>
    </div>
  );
}
