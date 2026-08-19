import React from 'react';
import styles from './AdminOrderDetailSkeleton.module.css';

export function AdminOrderDetailSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={`${styles.skeleton} ${styles.backBtnSkeleton}`} />
          <div>
            <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
        </div>
      </div>

      <div className={styles.grid}>
        <div>
          {/* Items Card */}
          <div className={styles.card}>
            <div className={`${styles.skeleton} ${styles.cardHeaderSkeleton}`} />
            <div className={styles.tableSkeleton}>
              {[1, 2, 3].map(i => (
                <div key={i} className={styles.tableRowSkeleton}>
                  <div className={`${styles.skeleton} ${styles.tableColSkeleton1}`} />
                  <div className={`${styles.skeleton} ${styles.tableColSkeleton2}`} />
                  <div className={`${styles.skeleton} ${styles.tableColSkeleton3}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Totals Card */}
          <div className={styles.card}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={styles.totalsRowSkeleton}>
                <div className={`${styles.skeleton} ${styles.totalsTextSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.totalsValueSkeleton}`} />
              </div>
            ))}
          </div>

          {/* Timeline Card */}
          <div className={styles.card}>
            <div className={`${styles.skeleton} ${styles.cardHeaderSkeleton}`} />
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.timelineItemSkeleton}>
                <div className={`${styles.skeleton} ${styles.timelineIconSkeleton}`} />
                <div className={styles.timelineContentSkeleton}>
                  <div className={`${styles.skeleton} ${styles.timelineTitleSkeleton}`} />
                  <div className={`${styles.skeleton} ${styles.timelineDateSkeleton}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Summary Card */}
          <div className={styles.card}>
            <div className={`${styles.skeleton} ${styles.cardHeaderSkeleton}`} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={styles.infoRowSkeleton}>
                <div className={`${styles.skeleton} ${styles.infoLabelSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.infoValueSkeleton}`} />
              </div>
            ))}
          </div>

          {/* Customer Card */}
          <div className={styles.card}>
            <div className={`${styles.skeleton} ${styles.cardHeaderSkeleton}`} />
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={`${styles.skeleton} ${styles.timelineIconSkeleton}`} />
              <div style={{ flex: 1 }}>
                <div className={`${styles.skeleton} ${styles.timelineTitleSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.timelineDateSkeleton}`} />
              </div>
            </div>
            <div className={`${styles.skeleton} ${styles.infoValueSkeleton}`} />
          </div>

          {/* Address Card */}
          <div className={styles.card}>
            <div className={`${styles.skeleton} ${styles.cardHeaderSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.timelineTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} style={{ height: '40px', marginTop: '8px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
