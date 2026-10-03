import React from 'react';
import styles from './AdminDeliveryAgentsSkeleton.module.css';

interface AdminDeliveryAgentsSkeletonProps {
  view?: 'list' | 'grid';
}

export const AdminDeliveryAgentsSkeleton: React.FC<AdminDeliveryAgentsSkeletonProps> = ({
  view = 'list',
}) => {
  return (
    <div className={styles.container} aria-busy="true" aria-label="Loading delivery agents roster">
      {/* 1. Header with Title & Stats Subtitle Row */}
      <div className={styles.header}>
        <div>
          <div className={`${styles.shimmer} ${styles.titleSkeleton}`} />
          <div className={styles.statsSubtitleSkeleton}>
            <div className={`${styles.shimmer} ${styles.statPillSkeleton}`} style={{ width: '85px' }} />
            <div className={`${styles.shimmer} ${styles.statPillSkeleton}`} style={{ width: '135px' }} />
            <div className={`${styles.shimmer} ${styles.statPillSkeleton}`} style={{ width: '145px' }} />
            <div className={`${styles.shimmer} ${styles.statPillSkeleton}`} style={{ width: '110px' }} />
          </div>
        </div>
      </div>

      {/* 2. Sticky Toolbar (Search Bar + Action Controls Group) */}
      <div className={styles.stickyWrapper}>
        <div className={styles.searchActionsBar}>
          {/* Search Input Box */}
          <div className={styles.searchWrapper}>
            <div className={`${styles.shimmer} ${styles.searchIconSkeleton}`} />
            <div className={`${styles.shimmer} ${styles.searchPlaceholderSkeleton}`} />
          </div>

          {/* Action Controls: Filter by Status + Export + View Toggle */}
          <div className={styles.actionControlsGroup}>
            <div className={`${styles.shimmer} ${styles.statusSelectSkeleton}`} />
            <div className={`${styles.shimmer} ${styles.exportBtnSkeleton}`} />
            <div className={`${styles.shimmer} ${styles.viewToggleSkeleton}`} />
          </div>
        </div>
      </div>

      {/* 3. Main Content: Table View or Grid View */}
      {view === 'grid' ? (
        /* Grid View Cards Skeleton */
        <div className={styles.gridWrapper}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-grid-${i}`} className={styles.gridCard}>
              <div className={styles.gridCardHeader}>
                <div className={styles.agentInfo}>
                  <div className={`${styles.shimmer} ${styles.agentAvatar}`} />
                  <div>
                    <div className={`${styles.shimmer} ${styles.nameSkeleton}`} style={{ width: `${110 + (i % 3) * 20}px` }} />
                    <div className={`${styles.shimmer} ${styles.emailSkeleton}`} style={{ width: `${140 + (i % 2) * 25}px`, marginTop: '5px' }} />
                  </div>
                </div>
                <div className={`${styles.shimmer} ${styles.badgeSkeleton}`} style={{ width: '65px' }} />
              </div>

              <div className={styles.gridStatsRow}>
                <div className={styles.gridStatBox}>
                  <div className={`${styles.shimmer} ${styles.statValSkeleton}`} />
                  <div className={`${styles.shimmer} ${styles.statLblSkeleton}`} />
                </div>
                <div className={styles.gridStatBox}>
                  <div className={`${styles.shimmer} ${styles.statValSkeleton}`} />
                  <div className={`${styles.shimmer} ${styles.statLblSkeleton}`} />
                </div>
              </div>

              <div className={styles.gridCardFooter}>
                <div className={styles.switchGroup}>
                  <div className={`${styles.shimmer} ${styles.switchTrackSkeleton}`} />
                  <div className={`${styles.shimmer} ${styles.dutyLabelSkeleton}`} />
                </div>
                <div className={styles.actionsGroup}>
                  <div className={`${styles.shimmer} ${styles.actionBtnPortalSkeleton}`} />
                  <div className={`${styles.shimmer} ${styles.actionBtnDetailsSkeleton}`} />
                  <div className={`${styles.shimmer} ${styles.actionBtnDeleteSkeleton}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Table View Skeleton */
        <div className={styles.tableCard}>
          {/* Desktop Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '50px' }} /></th>
                  <th style={{ width: '130px' }}><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '45px' }} /></th>
                  <th style={{ width: '130px' }}><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '55px' }} /></th>
                  <th style={{ width: '70px', textAlign: 'center' }}><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '42px', margin: '0 auto' }} /></th>
                  <th style={{ width: '80px', textAlign: 'center' }}><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '60px', margin: '0 auto' }} /></th>
                  <th style={{ width: '100px' }}><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '50px' }} /></th>
                  <th style={{ width: '80px', textAlign: 'center' }}><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '36px', margin: '0 auto' }} /></th>
                  <th style={{ width: '135px', textAlign: 'right' }}><div className={`${styles.shimmer} ${styles.thSkeleton}`} style={{ width: '55px', marginLeft: 'auto' }} /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-row-${i}`} className={styles.tableRow}>
                    {/* Agent Cell */}
                    <td>
                      <div className={styles.agentInfo}>
                        <div className={`${styles.shimmer} ${styles.agentAvatar}`} />
                        <div>
                          <div className={`${styles.shimmer} ${styles.nameSkeleton}`} style={{ width: `${115 + (i % 3) * 20}px` }} />
                          <div className={`${styles.shimmer} ${styles.emailSkeleton}`} style={{ width: `${145 + (i % 2) * 30}px`, marginTop: '5px' }} />
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className={`${styles.shimmer} ${styles.phoneIconSkeleton}`} />
                        <div className={`${styles.shimmer} ${styles.phoneTextSkeleton}`} />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <div className={`${styles.shimmer} ${styles.badgeSkeleton}`} />
                    </td>

                    {/* Active In-Transit */}
                    <td style={{ textAlign: 'center' }}>
                      <div className={`${styles.shimmer} ${styles.countSkeleton}`} style={{ margin: '0 auto' }} />
                    </td>

                    {/* Delivered */}
                    <td style={{ textAlign: 'center' }}>
                      <div className={`${styles.shimmer} ${styles.countSkeleton}`} style={{ margin: '0 auto' }} />
                    </td>

                    {/* Joined Date */}
                    <td>
                      <div className={`${styles.shimmer} ${styles.dateSkeleton}`} />
                    </td>

                    {/* Duty Switch */}
                    <td style={{ textAlign: 'center' }}>
                      <div className={`${styles.shimmer} ${styles.switchTrackSkeleton}`} style={{ margin: '0 auto' }} />
                    </td>

                    {/* Actions Group */}
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionsGroup} style={{ justifyContent: 'flex-end' }}>
                        <div className={`${styles.shimmer} ${styles.actionBtnPortalSkeleton}`} />
                        <div className={`${styles.shimmer} ${styles.actionBtnDetailsSkeleton}`} />
                        <div className={`${styles.shimmer} ${styles.actionBtnDeleteSkeleton}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Fallback (when table stacks on small screens) */}
          <div className={styles.mobileCardsList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-mob-${i}`} className={styles.mobileCard}>
                <div className={styles.mobileCardTop}>
                  <div className={styles.agentInfo}>
                    <div className={`${styles.shimmer} ${styles.agentAvatar}`} />
                    <div>
                      <div className={`${styles.shimmer} ${styles.nameSkeleton}`} style={{ width: `${110 + (i % 2) * 30}px` }} />
                      <div className={`${styles.shimmer} ${styles.emailSkeleton}`} style={{ width: `${135 + (i % 2) * 25}px`, marginTop: '4px' }} />
                    </div>
                  </div>
                  <div className={`${styles.shimmer} ${styles.badgeSkeleton}`} style={{ width: '70px' }} />
                </div>

                <div className={styles.mobileCardStats}>
                  <div className={styles.mobileStatItem}>
                    <div className={`${styles.shimmer} ${styles.statValSkeleton}`} style={{ width: '28px', height: '18px' }} />
                    <div className={`${styles.shimmer} ${styles.statLblSkeleton}`} style={{ width: '60px' }} />
                  </div>
                  <div className={styles.mobileStatItem}>
                    <div className={`${styles.shimmer} ${styles.statValSkeleton}`} style={{ width: '28px', height: '18px' }} />
                    <div className={`${styles.shimmer} ${styles.statLblSkeleton}`} style={{ width: '70px' }} />
                  </div>
                  <div className={styles.mobileStatItem}>
                    <div className={`${styles.shimmer} ${styles.switchTrackSkeleton}`} />
                    <div className={`${styles.shimmer} ${styles.dutyLabelSkeleton}`} style={{ width: '45px' }} />
                  </div>
                </div>

                <div className={styles.mobileCardBottom}>
                  <div className={`${styles.shimmer} ${styles.phoneTextSkeleton}`} style={{ width: '100px' }} />
                  <div className={styles.actionsGroup}>
                    <div className={`${styles.shimmer} ${styles.actionBtnPortalSkeleton}`} />
                    <div className={`${styles.shimmer} ${styles.actionBtnDetailsSkeleton}`} />
                    <div className={`${styles.shimmer} ${styles.actionBtnDeleteSkeleton}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
