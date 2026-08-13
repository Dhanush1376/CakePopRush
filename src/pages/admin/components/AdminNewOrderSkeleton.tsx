import React from 'react';
import styles from './AdminNewOrderSkeleton.module.css';

export function AdminNewOrderSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Column: Steps */}
        <div className={styles.stepsCol}>
          <div className={styles.wizardHeader}>
            <div className={`${styles.skeleton} ${styles.stepPill}`} />
            <div className={`${styles.skeleton} ${styles.stepPill}`} />
            <div className={`${styles.skeleton} ${styles.stepPill}`} />
          </div>

          <div className={styles.card}>
            <div>
              <div className={`${styles.skeleton} ${styles.cardTitle}`} />
              <div className={`${styles.skeleton} ${styles.cardSubtitle}`} />
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.skeleton} ${styles.inputBox}`} />
              <div className={`${styles.skeleton} ${styles.inputBox}`} />
            </div>
            <div className={styles.formRow}>
              <div className={`${styles.skeleton} ${styles.inputBox}`} />
              <div className={`${styles.skeleton} ${styles.inputBox}`} />
            </div>
            <div className={`${styles.skeleton} ${styles.inputBox}`} style={{ height: '100px' }} />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryCol}>
          <div className={styles.summaryCard}>
            <div className={`${styles.skeleton} ${styles.cardTitle}`} />
            
            <div style={{ marginTop: '24px' }}>
              <div className={styles.summaryItem}>
                <div className={`${styles.skeleton} ${styles.summaryText}`} />
                <div className={`${styles.skeleton} ${styles.summaryValue}`} />
              </div>
              <div className={styles.summaryItem}>
                <div className={`${styles.skeleton} ${styles.summaryText}`} />
                <div className={`${styles.skeleton} ${styles.summaryValue}`} />
              </div>
              <div className={styles.summaryItem}>
                <div className={`${styles.skeleton} ${styles.summaryText}`} />
                <div className={`${styles.skeleton} ${styles.summaryValue}`} />
              </div>
              
              <hr style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
              
              <div className={`${styles.skeleton} ${styles.summaryTotal}`} />
            </div>

            <div className={`${styles.skeleton} ${styles.actionBtn}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
