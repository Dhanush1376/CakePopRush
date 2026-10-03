import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, PackageCheck, CheckCheck, XCircle } from 'lucide-react';
import styles from './OrderTimeline.module.css';

interface OrderTimelineProps {
  status?: string;
  orderNumber?: string;
}

const STEPS = [
  { key: 'PENDING', label: 'Pending', icon: Clock, colorClass: styles.stepYellow },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, colorClass: styles.stepPink },
  { key: 'BEING BAKED', label: 'Being Baked', icon: PackageCheck, colorClass: styles.stepTurquoise },
  { key: 'DISPATCHED', label: 'Dispatched', icon: PackageCheck, colorClass: styles.stepTurquoise },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCheck, colorClass: styles.stepPink },
];

export function OrderTimeline({ status = 'PENDING', orderNumber }: OrderTimelineProps) {
  const norm = status.toUpperCase();
  const isCancelled = norm === 'CANCELLED';

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
      case 'ORDER CONFIRMED':
        return 1;
      case 'BEING BAKED':
      case 'BEING_BAKED':
      case 'PROCESSING':
      case 'PREPARING':
        return 2;
      case 'DISPATCHED':
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
      case 'PICKED_UP':
        return 3;
      case 'DELIVERED':
      case 'COMPLETED':
      case 'OTP_VERIFIED':
        return 4;
      default:
        return 0;
    }
  };

  const currentIdx = isCancelled ? -1 : getStepIndex(norm);
  const fillPercent = isCancelled ? 0 : Math.round((currentIdx / (STEPS.length - 1)) * 100);

  const getTitleAndSubtext = () => {
    if (isCancelled) {
      return {
        title: 'Order Cancelled',
        subtext: 'This order has been cancelled according to policy.',
      };
    }
    const stepIdx = getStepIndex(norm);
    switch (stepIdx) {
      case 0:
        return {
          title: 'Order Received',
          subtext: 'Your order is pending confirmation from our bakery kitchen.',
        };
      case 1:
        return {
          title: 'Order Confirmed!',
          subtext: "We've confirmed your order and scheduled kitchen preparation.",
        };
      case 2:
        return {
          title: 'Being Baked',
          subtext: 'Your order is actively being prepared in our bakery kitchen.',
        };
      case 3:
        return {
          title: 'Dispatched!',
          subtext: 'Your order is on the way with your delivery partner.',
        };
      case 4:
        return {
          title: 'Order Delivered!',
          subtext: 'Delivered securely with verified customer OTP confirmation.',
        };
      default:
        return {
          title: 'Order Received',
          subtext: 'We are processing your sweet treats with utmost care.',
        };
    }
  };

  const { title, subtext } = getTitleAndSubtext();

  return (
    <>
      <div className={styles.bigTickWrapper}>
        <motion.div
          className={styles.authTickCircle}
          style={{ backgroundColor: isCancelled ? '#EF4444' : undefined }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          {isCancelled ? (
            <XCircle size={32} color="white" />
          ) : (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13L9 17L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
          )}
        </motion.div>
        <h3 className={styles.bigTickTitle}>{title}</h3>
        <p className={styles.bigTickSubtext}>{subtext}</p>
        {orderNumber && (
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brand-pink)', marginTop: '4px' }}>
            #{orderNumber}
          </span>
        )}
      </div>

      <div className={styles.colorfulStepperContainer}>
        <div className={styles.colorfulStepperTrack}>
          <div className={styles.colorfulStepperFill} style={{ width: `${fillPercent}%` }} />
        </div>

        <div className={styles.colorfulSteps}>
          {STEPS.map((step, idx) => {
            const isCompleted = !isCancelled && idx <= currentIdx;
            const isCurrent = !isCancelled && idx === currentIdx;
            const Icon = step.icon;

            const stepClass = isCompleted ? step.colorClass : styles.stepGrey;

            return (
              <div key={step.key} className={`${styles.colorfulStep} ${stepClass}`}>
                <div
                  className={styles.colorfulNode}
                  style={isCurrent ? { transform: 'scale(1.15)', outline: '2px solid white' } : undefined}
                >
                  <Icon size={16} />
                </div>
                <span className={styles.colorfulLabel}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default OrderTimeline;
