import React from 'react';
import styles from './DeliveryAgentPortalSkeleton.module.css';

interface DeliveryAgentPortalSkeletonProps {
  activeTab?: 'active' | 'history' | 'profile';
}

export const DeliveryAgentPortalSkeleton: React.FC<DeliveryAgentPortalSkeletonProps> = ({
  activeTab = 'active',
}) => {
  return (
    <div
      className={styles.portalSkeletonContainer}
      aria-busy="true"
      aria-label="Loading delivery partner portal"
    >
      {/* Sticky Header Skeleton */}
      <header className={styles.topHeader}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup}>
            <div className={`${styles.shimmer} ${styles.logoPlaceholder}`} />
          </div>
          <div className={styles.topNavTabsSkeleton}>
            <div className={`${styles.shimmer} ${styles.topNavTabSkeleton}`} />
            <div className={`${styles.shimmer} ${styles.topNavTabSkeleton}`} />
            <div className={`${styles.shimmer} ${styles.topNavTabSkeleton}`} />
          </div>
          <div className={styles.headerActions}>
            <div className={`${styles.shimmer} ${styles.profileAvatarSkeleton}`} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContainer}>
        {/* Greeting Bar & Duty Status Toggle */}
        <section className={styles.greetingBar}>
          <div>
            <div className={`${styles.shimmer} ${styles.greetingSub}`} />
            <div className={`${styles.shimmer} ${styles.greetingName}`} />
          </div>
          <div className={`${styles.shimmer} ${styles.statusSyncWidget}`} />
        </section>

        {/* Operational Stats 3-Card Row */}
        <section className={styles.statsRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`stat-skeleton-${i}`} className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <div className={`${styles.shimmer} ${styles.statLabel}`} />
                <div className={`${styles.shimmer} ${styles.statIcon}`} />
              </div>
              <div className={`${styles.shimmer} ${styles.statValue}`} />
            </div>
          ))}
        </section>

        {/* Active Task Tab: Ongoing Delivery Card Skeleton */}
        {activeTab === 'active' && (
          <div className={styles.activeCard}>
            {/* Card Header */}
            <div className={styles.activeCardHeader}>
              <div className={styles.orderBadgeRow}>
                <div className={`${styles.shimmer} ${styles.badgePill}`} />
                <div className={`${styles.shimmer} ${styles.orderNumber}`} />
              </div>
              <div className={`${styles.shimmer} ${styles.timeBadge}`} />
            </div>

            {/* Route Sequence Section */}
            <div className={styles.routeSection}>
              {/* Pickup Stop */}
              <div className={styles.routeStop}>
                <div className={`${styles.shimmer} ${styles.stopIconCircle}`} />
                <div className={styles.stopDetails}>
                  <div className={`${styles.shimmer} ${styles.stopLabel}`} />
                  <div className={`${styles.shimmer} ${styles.stopName}`} />
                  <div className={`${styles.shimmer} ${styles.stopAddress}`} />
                </div>
              </div>

              {/* Route Connector Line */}
              <div className={styles.routeConnector}>
                <div className={styles.connectorLine} />
                <div className={`${styles.shimmer} ${styles.connectorPill}`} />
              </div>

              {/* Customer Dropoff Stop */}
              <div className={styles.routeStop}>
                <div className={`${styles.shimmer} ${styles.stopIconCircle}`} />
                <div className={styles.stopDetails}>
                  <div className={`${styles.shimmer} ${styles.stopLabel}`} />
                  <div className={`${styles.shimmer} ${styles.stopName}`} />
                  <div className={`${styles.shimmer} ${styles.stopAddress}`} />
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className={styles.cardFooter}>
              <div className={styles.footerLeft}>
                <div className={`${styles.shimmer} ${styles.actionCircle}`} />
                <div className={`${styles.shimmer} ${styles.actionCircle}`} />
              </div>
              <div className={`${styles.shimmer} ${styles.viewOrderLink}`} />
            </div>

            {/* Light Extension Strip (OTP App Drawer Button Trigger) */}
            <div className={styles.cardExtensionStrip}>
              <div className={`${styles.shimmer} ${styles.extensionLeftShimmer}`} />
              <div className={`${styles.shimmer} ${styles.extensionBadgeShimmer}`} />
            </div>
          </div>
        )}

        {/* Deliveries History Skeleton */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`history-skeleton-${i}`} className={styles.activeCard}>
                <div className={styles.activeCardHeader}>
                  <div className={`${styles.shimmer} ${styles.orderNumber}`} />
                  <div className={`${styles.shimmer} ${styles.timeBadge}`} />
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div className={`${styles.shimmer} ${styles.stopIconCircle}`} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className={`${styles.shimmer} ${styles.stopName}`} />
                    <div className={`${styles.shimmer} ${styles.stopAddress}`} />
                  </div>
                  <div className={`${styles.shimmer} ${styles.badgePill}`} style={{ width: '80px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Skeleton */}
      <nav className={styles.bottomNav}>
        <div className={`${styles.shimmer} ${styles.bottomNavBtn}`} />
        <div className={`${styles.shimmer} ${styles.bottomNavBtn}`} />
        <div className={`${styles.shimmer} ${styles.bottomNavBtn}`} />
      </nav>
    </div>
  );
};

export default DeliveryAgentPortalSkeleton;
