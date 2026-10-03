import React from 'react';
import styles from './CustomOrderSkeleton.module.css';

/**
 * Modern high-fidelity skeleton for Step 1 of the Custom Orders flow.
 */
export const CustomOrderStep1Skeleton: React.FC = () => {
  return (
    <div className={styles.formSkeletonContainer} aria-busy="true" aria-label="Loading custom order form">
      {/* Step Header */}
      <div className={styles.stepHeader}>
        <div className={`${styles.stepBadge} ${styles.shimmer}`} />
        <div className={`${styles.stepTitle} ${styles.shimmer}`} />
        <div className={`${styles.stepSubtitle} ${styles.shimmer}`} />
      </div>

      {/* Form Fields Grid */}
      <div className={styles.formGrid}>
        {/* Field 1: Occasion / Celebration Type */}
        <div className={styles.fieldWrapper}>
          <div className={styles.labelRow}>
            <div className={styles.labelDot} />
            <div className={`${styles.labelText} ${styles.shimmer}`} style={{ width: '130px' }} />
          </div>
          <div className={styles.selectBox}>
            <div className={`${styles.selectText} ${styles.shimmer}`} />
            <div className={`${styles.chevronIcon} ${styles.shimmer}`} />
          </div>
        </div>

        {/* Field 2: Design Inspiration / Reference Image Dropzone */}
        <div className={styles.fieldWrapper}>
          <div className={styles.labelRow}>
            <div className={`${styles.labelText} ${styles.shimmer}`} style={{ width: '180px' }} />
          </div>
          <div className={styles.dropzoneBox}>
            <div className={`${styles.dropzoneIcon} ${styles.shimmer}`} />
            <div className={`${styles.dropzoneText} ${styles.shimmer}`} />
            <div className={`${styles.dropzoneSubtext} ${styles.shimmer}`} />
          </div>
        </div>

        {/* Field 3: Occasion & Customization Requirements (Textarea) */}
        <div className={styles.fieldWrapper}>
          <div className={styles.labelRow}>
            <div className={`${styles.labelText} ${styles.shimmer}`} style={{ width: '210px' }} />
          </div>
          <div className={styles.textareaBox}>
            <div className={`${styles.textareaLine1} ${styles.shimmer}`} />
            <div className={`${styles.textareaLine2} ${styles.shimmer}`} />
          </div>
        </div>

        {/* Field 4: Target Date & Qty (Two Column Row) */}
        <div className={styles.twoColRow}>
          {/* Target Date */}
          <div className={styles.fieldWrapper}>
            <div className={styles.labelRow}>
              <div className={`${styles.labelText} ${styles.shimmer}`} style={{ width: '85px' }} />
            </div>
            <div className={styles.inputBox}>
              <div className={`${styles.inputIcon} ${styles.shimmer}`} />
              <div className={`${styles.inputText} ${styles.shimmer}`} style={{ width: '90px' }} />
            </div>
          </div>

          {/* Qty */}
          <div className={styles.fieldWrapper}>
            <div className={styles.labelRow}>
              <div className={`${styles.labelText} ${styles.shimmer}`} style={{ width: '45px' }} />
            </div>
            <div className={styles.inputBox}>
              <div className={`${styles.inputIcon} ${styles.shimmer}`} />
              <div className={`${styles.inputText} ${styles.shimmer}`} style={{ width: '45px' }} />
            </div>
          </div>
        </div>

        {/* Field 5: Mobile Number */}
        <div className={styles.fieldWrapper}>
          <div className={styles.labelRow}>
            <div className={`${styles.labelDot} ${styles.shimmer}`} />
            <div className={`${styles.labelText} ${styles.shimmer}`} style={{ width: '110px' }} />
          </div>
          <div className={styles.inputBox}>
            <div className={`${styles.inputIcon} ${styles.shimmer}`} />
            <div className={`${styles.inputText} ${styles.shimmer}`} style={{ width: '130px' }} />
          </div>
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className={styles.actionsRow}>
        <div className={`${styles.nextBtnSkeleton} ${styles.shimmer}`} />
      </div>
    </div>
  );
};

/**
 * Modern skeleton for the Left Sidebar steps rail.
 */
export const CustomOrderSidebarSkeleton: React.FC = () => {
  return (
    <div className={styles.sidebarList} aria-busy="true" aria-label="Loading steps">
      {/* Step 1 (Active) */}
      <div className={styles.sidebarStepItem}>
        <div className={`${styles.stepCircleActive} ${styles.shimmer}`} />
        <div className={styles.stepTextGroup}>
          <div className={`${styles.stepTitleLine} ${styles.shimmer}`} style={{ width: '105px' }} />
        </div>
      </div>

      <div className={styles.stepDividerLine} />

      {/* Step 2 */}
      <div className={styles.sidebarStepItem}>
        <div className={`${styles.stepCircle} ${styles.shimmer}`} />
        <div className={styles.stepTextGroup}>
          <div className={`${styles.stepTitleLine} ${styles.shimmer}`} style={{ width: '90px' }} />
        </div>
      </div>

      <div className={styles.stepDividerLine} />

      {/* Step 3 */}
      <div className={styles.sidebarStepItem}>
        <div className={`${styles.stepCircle} ${styles.shimmer}`} />
        <div className={styles.stepTextGroup}>
          <div className={`${styles.stepTitleLine} ${styles.shimmer}`} style={{ width: '75px' }} />
        </div>
      </div>
    </div>
  );
};

/**
 * Modern skeleton for Tab 2: My Requests (Custom Orders Tracking List).
 */
export const CustomOrderTrackSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className={styles.trackList} aria-busy="true" aria-label="Loading your custom orders">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`track-skel-${i}`} className={styles.trackCard}>
          {/* Header */}
          <div className={styles.trackHeader}>
            <div className={styles.trackHeaderLeft}>
              <div className={`${styles.trackStatusChip} ${styles.shimmer}`} />
              <div className={`${styles.trackDate} ${styles.shimmer}`} />
            </div>
            <div className={`${styles.trackActionBtn} ${styles.shimmer}`} />
          </div>

          {/* Body */}
          <div className={styles.trackBody}>
            <div className={`${styles.trackImage} ${styles.shimmer}`} />
            <div className={styles.trackContent}>
              <div className={`${styles.trackTag} ${styles.shimmer}`} />
              <div className={`${styles.trackTitle} ${styles.shimmer}`} />
              <div className={`${styles.trackSub} ${styles.shimmer}`} />
              <div className={styles.trackChipsRow}>
                <div className={`${styles.trackChip} ${styles.shimmer}`} />
                <div className={`${styles.trackChip} ${styles.shimmer}`} style={{ width: '115px' }} />
              </div>
            </div>
            <div className={`${styles.trackChevron} ${styles.shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Modern skeleton for the Custom Order Detail Page (Overview Card + Consultation Feed).
 */
export const CustomOrderDetailSkeleton: React.FC = () => {
  return (
    <div className={styles.detailSkeletonContainer} aria-busy="true" aria-label="Loading custom order details">
      {/* 1. Request Overview Card Skeleton */}
      <div className={styles.trackCard}>
        <div className={styles.trackHeader}>
          <div className={styles.trackHeaderLeft}>
            <div className={`${styles.trackStatusChip} ${styles.shimmer}`} />
            <div className={`${styles.trackDate} ${styles.shimmer}`} />
          </div>
          <div className={`${styles.trackActionBtn} ${styles.shimmer}`} />
        </div>
        <div className={styles.trackBody}>
          <div className={`${styles.trackImage} ${styles.shimmer}`} />
          <div className={styles.trackContent}>
            <div className={`${styles.trackTag} ${styles.shimmer}`} />
            <div className={`${styles.trackTitle} ${styles.shimmer}`} />
            <div className={`${styles.trackSub} ${styles.shimmer}`} />
            <div className={styles.trackChipsRow}>
              <div className={`${styles.trackChip} ${styles.shimmer}`} />
              <div className={`${styles.trackChip} ${styles.shimmer}`} style={{ width: '115px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Conversational Chat Feed Skeleton */}
      <div className={styles.chatSkeletonBox}>
        <div className={styles.chatHeaderSkeleton}>
          <div className={`${styles.chatAvatarSkeleton} ${styles.shimmer}`} />
          <div className={styles.chatHeaderText}>
            <div className={`${styles.stepTitleLine} ${styles.shimmer}`} style={{ width: '130px', height: '14px' }} />
            <div className={`${styles.stepTitleLine} ${styles.shimmer}`} style={{ width: '85px', height: '10px' }} />
          </div>
        </div>
        <div className={styles.chatBodySkeleton}>
          <div className={`${styles.chatBubbleLeft} ${styles.shimmer}`} />
          <div className={`${styles.chatBubbleRight} ${styles.shimmer}`} />
          <div className={`${styles.chatBubbleLeft} ${styles.shimmer}`} style={{ width: '42%' }} />
        </div>
      </div>
    </div>
  );
};

