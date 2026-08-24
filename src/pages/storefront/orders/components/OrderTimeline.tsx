import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck } from 'lucide-react';
import styles from './OrderTimeline.module.css';

export function OrderTimeline() {
  return (
    <>
      <div className={styles.bigTickWrapper}>
        <motion.div 
          className={styles.authTickCircle}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path 
              d="M5 13L9 17L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
            />
          </svg>
        </motion.div>
        <h3 className={styles.bigTickTitle}>Order Confirmed!</h3>
        <p className={styles.bigTickSubtext}>We've received your order and started preparing it.</p>
      </div>

      <div className={styles.colorfulStepperContainer}>
        <div className={styles.colorfulStepperTrack}>
          <div className={styles.colorfulStepperFill} />
        </div>

        <div className={styles.colorfulSteps}>
          <div className={`${styles.colorfulStep} ${styles.stepYellow}`}>
            <div className={styles.colorfulNode}>
              <CheckCircle2 size={16} />
            </div>
            <span className={styles.colorfulLabel}>Order Placed</span>
          </div>

          <div className={`${styles.colorfulStep} ${styles.stepPink}`}>
            <div className={styles.colorfulNode}>
              <CheckCircle2 size={16} />
            </div>
            <span className={styles.colorfulLabel}>Confirmed</span>
          </div>

          <div className={`${styles.colorfulStep} ${styles.stepTurquoise}`}>
            <div className={styles.colorfulNode}>
              <Package size={16} />
            </div>
            <span className={styles.colorfulLabel}>Preparing</span>
          </div>

          <div className={`${styles.colorfulStep} ${styles.stepGrey}`}>
            <div className={styles.colorfulNode}>
              <Truck size={16} />
            </div>
            <span className={styles.colorfulLabel}>Delivery</span>
          </div>
        </div>
      </div>
    </>
  );
}
