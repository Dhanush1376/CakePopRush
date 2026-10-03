import React from 'react';
import styles from './DeliveryOrderDetailSkeleton.module.css';

export const DeliveryOrderDetailSkeleton: React.FC = () => {
  return (
    <div
      className={styles.pageSkeleton}
      aria-busy="true"
      aria-label="Loading delivery task details"
    >
      {/* 1. Map Section Skeleton (Top Half) */}
      <div className={styles.mapSkeleton}>
        {/* Header Bar Overlay */}
        <div className={styles.headerOverlay}>
          <div className={styles.headerLeft}>
            <div className={styles.backBtnSkeleton}>
              <div className={`${styles.shimmer} ${styles.backBtnIcon}`} />
            </div>
            <div className={styles.headerTitleBox}>
              <div className={`${styles.shimmer} ${styles.headerOrderText}`} />
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerSupportBtn}>
              <div className={`${styles.shimmer} ${styles.headerSupportText}`} />
            </div>
          </div>
        </div>

        {/* Floating ETA Card (Top Left below header) */}
        <div className={styles.etaCardSkeleton}>
          <div className={`${styles.shimmer} ${styles.etaLabel}`} />
          <div className={`${styles.shimmer} ${styles.etaTime}`} />
          <div className={`${styles.shimmer} ${styles.etaStatus}`} />
        </div>

        {/* Floating Map Action Controls (Bottom Right - situated cleanly above sheet) */}
        <div className={styles.floatingMapControls}>
          <div className={styles.mapFabsRow}>
            <div className={styles.mapFabSkeleton}>
              <div className={`${styles.shimmer} ${styles.fabIcon}`} />
            </div>
            <div className={styles.mapFabSkeleton}>
              <div className={`${styles.shimmer} ${styles.fabIcon}`} />
            </div>
          </div>
          <div className={styles.recenterBtnSkeleton}>
            <div className={`${styles.shimmer} ${styles.recenterIcon}`} />
            <div className={`${styles.shimmer} ${styles.recenterText}`} />
          </div>
        </div>
      </div>

      {/* 2. Sliding Bottom Sheet Skeleton */}
      <div className={styles.sheetContainer}>
        {/* Drag Handle */}
        <div className={styles.dragHandleArea}>
          <div className={styles.dragHandle} />
        </div>

        <div className={styles.sheetContent}>
          {/* Main Status Title Row */}
          <div className={styles.statusTitleRow}>
            <div className={`${styles.shimmer} ${styles.statusTitle}`} />
            <div className={`${styles.shimmer} ${styles.statusBadge}`} />
          </div>

          {/* Customer Profile Card */}
          <div className={styles.customerCard}>
            <div className={styles.customerLeft}>
              <div className={`${styles.shimmer} ${styles.avatarCircle}`} />
              <div className={styles.customerDetails}>
                <div className={`${styles.shimmer} ${styles.customerName}`} />
                <div className={`${styles.shimmer} ${styles.customerPhone}`} />
              </div>
            </div>
            <div className={styles.customerActions}>
              <div className={`${styles.shimmer} ${styles.actionBtnSkeleton}`} />
              <div className={`${styles.shimmer} ${styles.actionBtnSkeleton}`} />
            </div>
          </div>

          {/* Delivery Status & Destination Card */}
          <div className={styles.addressBox}>
            <div className={styles.addressHeaderRow}>
              <div className={`${styles.shimmer} ${styles.addressLabel}`} />
              <div className={`${styles.shimmer} ${styles.gpsLinkSkeleton}`} />
            </div>
            <div className={`${styles.shimmer} ${styles.addressLine1}`} />
            <div className={`${styles.shimmer} ${styles.addressLine2}`} />

            {/* 4-Step Vertical Timeline */}
            <div className={styles.timelineBox}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`step-skeleton-${i}`} className={styles.timelineRow}>
                  <div className={styles.timelineDotCol}>
                    <div className={`${styles.shimmer} ${styles.timelineDot}`} />
                    {i < 3 && <div className={styles.timelineConnector} />}
                  </div>
                  <div className={`${styles.shimmer} ${styles.timelineLabel}`} />
                </div>
              ))}
            </div>
          </div>

          {/* 4-Box Customer Delivery OTP Verification Strip */}
          <div className={styles.otpVerifyStrip}>
            <div className={`${styles.shimmer} ${styles.otpStripHeader}`} />
            <div className={styles.otpDigitsRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`otp-box-${i}`} className={styles.otpBoxWrapper}>
                  <div className={`${styles.shimmer} ${styles.otpBoxSkeleton}`} />
                </div>
              ))}
              <div className={`${styles.shimmer} ${styles.verifyBtnSkeleton}`} />
            </div>
          </div>

          {/* Order Items Summary Card */}
          <div className={styles.itemsBox}>
            <div className={styles.itemsHeader}>
              <div className={`${styles.shimmer} ${styles.itemsTitle}`} />
              <div className={`${styles.shimmer} ${styles.itemsBadge}`} />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`item-skeleton-${i}`} className={styles.itemRow}>
                <div className={`${styles.shimmer} ${styles.itemThumb}`} />
                <div className={styles.itemMeta}>
                  <div className={`${styles.shimmer} ${styles.itemName}`} />
                  <div className={`${styles.shimmer} ${styles.itemPrice}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderDetailSkeleton;
