import React from 'react';
import { motion } from 'framer-motion';
import { CakePopMascot } from './CakePopMascot';
import styles from './CancelledOrderMascot.module.css';

export interface CancelledOrderMascotProps {
  orderNumber?: string;
  cancellationReason?: string;
}

export const CancelledOrderMascot: React.FC<CancelledOrderMascotProps> = ({
  orderNumber,
  cancellationReason,
}) => {
  const formattedOrderNumber = orderNumber ? orderNumber.replace(/^#/, '') : '';

  return (
    <div className={styles.container} role="region" aria-label="Order Cancelled Notice">
      <div className={styles.ambientCircle1} />
      <div className={styles.ambientCircle2} />

      <div className={styles.contentWrapper}>
        {/* Thinkbox / Thought Bubble Floating Above Mascot */}
        <motion.div
          className={styles.thinkboxWrapper}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{
            opacity: 1,
            y: [0, -5, 0],
            scale: 1,
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 3.2,
              ease: 'easeInOut',
            },
            opacity: { duration: 0.35, ease: 'easeOut' },
            scale: { duration: 0.35, ease: 'easeOut' },
          }}
        >
          <div className={styles.thinkbox}>
            <div className={styles.thinkboxHeader}>
              <span>I'm so sorry! 💔</span>
            </div>
            <p className={styles.thinkboxText}>
              {formattedOrderNumber ? (
                <>
                  Order <span className={styles.thinkboxHighlight}>#{formattedOrderNumber}</span> has unfortunately been cancelled.
                </>
              ) : (
                <>Your order has unfortunately been cancelled.</>
              )}
              {cancellationReason && (
                <span style={{ display: 'block', marginTop: '3px', fontStyle: 'italic', color: '#6B7280' }}>
                  "{cancellationReason}"
                </span>
              )}
            </p>
            <div className={styles.thinkboxSubtext}>
              We apologize for the disappointment! If any payment was deducted, a full refund will be processed in 3–5 business days.
            </div>
          </div>

          {/* Thought Bubble Trailing Circles */}
          <div className={styles.thoughtDots} aria-hidden="true">
            <span className={styles.thoughtDot1} />
            <span className={styles.thoughtDot2} />
            <span className={styles.thoughtDot3} />
          </div>
        </motion.div>

        {/* Medium-sized Crying Mascot */}
        <div className={styles.mascotStage}>
          <div className={styles.mascotShadow} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220, delay: 0.1 }}
          >
            <CakePopMascot
              size="medium"
              reaction="cryingFountain"
              loop={true}
            />
          </motion.div>
        </div>

        {/* Status Pill */}
        <motion.div
          className={styles.statusPill}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
        >
          <span className={styles.statusPillDot} />
          <span>ORDER CANCELLED</span>
        </motion.div>
      </div>
    </div>
  );
};
