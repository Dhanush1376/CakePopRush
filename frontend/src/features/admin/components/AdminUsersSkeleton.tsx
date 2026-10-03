import React from 'react';
import styles from './AdminUsersSkeleton.module.css';

export function AdminUsersSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
        </div>
      </div>

      {/* Combined Unified Toolbar & Tabs Card */}
      <div className={styles.stickyWrapper}>
        <div className={styles.unifiedCard}>
          <div className={styles.tabBarRow}>
            {/* Segmented Tabs */}
            <div className={styles.segmentedControl}>
              <div className={`${styles.skeleton} ${styles.tabSkeleton} ${styles.tabSkeletonActive}`} />
              <div className={`${styles.skeleton} ${styles.tabSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.tabSkeleton}`} />
            </div>

            {/* Actions: View Toggle + Add Button */}
            <div className={styles.tabBarActions}>
              <div className={`${styles.skeleton} ${styles.toggleSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className={styles.tableCard}>
        {/* Desktop Table View */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th><div className={`${styles.skeleton} ${styles.checkboxSkeleton}`} /></th>
                <th><div className={`${styles.skeleton}`} style={{ width: '60px', height: '12px' }} /></th>
                <th style={{ textAlign: 'center' }}><div className={`${styles.skeleton}`} style={{ width: '45px', height: '12px', margin: '0 auto' }} /></th>
                <th style={{ textAlign: 'center' }}><div className={`${styles.skeleton}`} style={{ width: '55px', height: '12px', margin: '0 auto' }} /></th>
                <th><div className={`${styles.skeleton}`} style={{ width: '75px', height: '12px' }} /></th>
                <th><div className={`${styles.skeleton}`} style={{ width: '75px', height: '12px' }} /></th>
                <th><div className={`${styles.skeleton}`} style={{ width: '60px', height: '12px' }} /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skel-row-${i}`}>
                  <td>
                    <div className={`${styles.skeleton} ${styles.checkboxSkeleton}`} />
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                      <div className={styles.userInfo}>
                        <div className={`${styles.skeleton} ${styles.nameSkeleton}`} style={{ width: `${110 + (i % 3) * 25}px` }} />
                        <div className={`${styles.skeleton} ${styles.emailSkeleton}`} style={{ width: `${140 + (i % 2) * 35}px` }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className={`${styles.skeleton} ${styles.badgeSkeleton}`} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className={`${styles.skeleton} ${styles.statusSkeleton}`} />
                  </td>
                  <td>
                    <div className={styles.dateSkeleton}>
                      <div className={`${styles.skeleton} ${styles.datePrimarySkeleton}`} />
                      <div className={`${styles.skeleton} ${styles.dateSecondarySkeleton}`} />
                    </div>
                  </td>
                  <td>
                    <div className={styles.dateSkeleton}>
                      <div className={`${styles.skeleton} ${styles.datePrimarySkeleton}`} />
                      <div className={`${styles.skeleton} ${styles.dateSecondarySkeleton}`} />
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionsSkeleton}>
                      <div className={`${styles.skeleton} ${styles.actionBtnSkeleton}`} />
                      <div className={`${styles.skeleton} ${styles.actionBtnSkeleton}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <div className={`${styles.skeleton} ${styles.pageInfoSkeleton}`} />
            <div className={styles.pageControlsSkeleton}>
              <div className={`${styles.skeleton} ${styles.pageBtnSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.pageBtnSkeleton}`} />
              <div className={`${styles.skeleton} ${styles.pageBtnSkeleton}`} />
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className={styles.mobileCards}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-mob-${i}`} className={styles.mobileCard}>
              <div className={styles.mcHeader}>
                <div className={styles.userCell}>
                  <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                  <div className={styles.userInfo}>
                    <div className={`${styles.skeleton} ${styles.nameSkeleton}`} style={{ width: `${120 + (i % 2) * 30}px` }} />
                    <div className={`${styles.skeleton} ${styles.statusSkeleton}`} style={{ margin: 0, width: '55px' }} />
                  </div>
                </div>
              </div>

              <div className={styles.mcContact}>
                <div className={`${styles.skeleton} ${styles.emailSkeleton}`} style={{ width: `${150 + (i % 2) * 30}px` }} />
              </div>

              <div className={styles.mcStats}>
                <div className={styles.dateSkeleton}>
                  <div className={`${styles.skeleton}`} style={{ width: '55px', height: '11px' }} />
                  <div className={`${styles.skeleton} ${styles.datePrimarySkeleton}`} />
                  <div className={`${styles.skeleton} ${styles.dateSecondarySkeleton}`} />
                </div>
                <div className={styles.dateSkeleton} style={{ alignItems: 'flex-end' }}>
                  <div className={`${styles.skeleton}`} style={{ width: '55px', height: '11px' }} />
                  <div className={`${styles.skeleton} ${styles.datePrimarySkeleton}`} />
                  <div className={`${styles.skeleton} ${styles.dateSecondarySkeleton}`} />
                </div>
              </div>

              <div className={styles.mcActions}>
                <div className={`${styles.skeleton} ${styles.mcRoleSkeleton}`} />
                <div className={styles.actionsSkeleton}>
                  <div className={`${styles.skeleton} ${styles.actionBtnSkeleton}`} />
                  <div className={`${styles.skeleton} ${styles.actionBtnSkeleton}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
