import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useTransform, AnimatePresence, animate } from 'framer-motion';
import { ChevronsRight, Loader2, Check, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters/currency';
import styles from './SlideToOrder.module.css';

interface SlideToOrderProps {
  onSuccess: () => void;
  totalAmount: number;
  isLoading?: boolean;
  disabled?: boolean;
  paymentMethod?: 'cod' | 'razorpay';
}

export const SlideToOrder: React.FC<SlideToOrderProps> = ({
  onSuccess,
  totalAmount,
  isLoading = false,
  disabled = false,
  paymentMethod = 'razorpay',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverThreshold, setIsOverThreshold] = useState(false);
  const x = useMotionValue(0);

  // Smoothly fade out text as slider is dragged past initial position (0px to 90px)
  const textOpacity = useTransform(x, [0, 85], [1, 0]);

  // Trail width precisely tracking the thumb center
  const trailWidth = useMotionValue(0);
  useMotionValueEvent(x, 'change', (latest) => {
    trailWidth.set(Math.max(0, latest + 24));
  });

  // Calculate available track slide distance
  useEffect(() => {
    const updateDimensions = () => {
      if (trackRef.current) {
        // Track width minus thumb (48px) and margins (8px total)
        const trackWidth = trackRef.current.clientWidth;
        setMaxDrag(Math.max(0, trackWidth - 48 - 8));
      }
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', updateDimensions);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Monitor drag threshold (50% of track)
  useMotionValueEvent(x, 'change', (latest) => {
    if (maxDrag > 0) {
      setIsOverThreshold(latest >= maxDrag * 0.5);
    }
  });

  const handleDragEnd = () => {
    setIsDragging(false);
    if (disabled || isLoading || isCompleted) return;

    if (x.get() >= maxDrag * 0.5) {
      setIsCompleted(true);
      // Snap cleanly to the end
      animate(x, maxDrag, {
        type: 'spring',
        stiffness: 400,
        damping: 28,
        onComplete: () => {
          onSuccess();
        },
      });
    } else {
      setIsOverThreshold(false);
      animate(x, 0, {
        type: 'spring',
        stiffness: 400,
        damping: 26,
      });
    }
  };

  // Reset if loading finishes
  useEffect(() => {
    if (!isLoading && isCompleted) {
      const timer = setTimeout(() => {
        setIsCompleted(false);
        setIsOverThreshold(false);
        x.set(0);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!isLoading) {
      setIsCompleted(false);
      setIsOverThreshold(false);
      x.set(0);
    }
  }, [isLoading, isCompleted, x]);

  const actionText = paymentMethod === 'cod' ? 'Swipe to Order' : 'Swipe to Pay';

  return (
    <div
      className={`${styles.track} ${disabled ? styles.disabled : ''} ${isLoading ? styles.loading : ''}`}
      ref={trackRef}
    >
      {/* Clean Smooth Fill Trail (No stripes) */}
      <motion.div
        className={styles.slideTrail}
        style={{
          width: isLoading || isCompleted ? 'calc(100% - 8px)' : trailWidth,
          opacity: isLoading || isCompleted ? 1 : isDragging || isCompleted ? 1 : 0,
        }}
      />

      {/* Target Destination Ring at Right End */}
      <div
        className={`${styles.endDock} ${isOverThreshold ? styles.endDockActive : ''}`}
        aria-hidden="true"
      >
        {isOverThreshold ? (
          <CheckCircle2 size={20} className={styles.dockCheckIcon} />
        ) : (
          <ChevronsRight size={18} className={styles.dockChevron} />
        )}
      </div>

      {/* Center Label with Smooth Fade on Drag */}
      <div className={styles.labelWrapper}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-label"
              className={styles.authorizingState}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={16} className={`${styles.spinnerIcon} animate-spin`} />
              <span className={styles.authorizingText}>
                {paymentMethod === 'cod' ? 'Placing your order...' : 'Processing payment...'}
              </span>
            </motion.div>
          ) : isOverThreshold ? (
            <motion.div
              key="release-label"
              className={styles.releasePrompt}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 24 }}
            >
              <CheckCircle2 size={16} className={styles.promptCheck} />
              <span className={styles.releaseText}>
                Release to Confirm • {formatCurrency(totalAmount)}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="swipe-label"
              className={styles.swipeLabel}
              style={{ opacity: textOpacity }}
            >
              <span className={styles.actionText}>{actionText}</span>
              <span className={styles.dotSeparator}>•</span>
              <span className={styles.amountText}>{formatCurrency(totalAmount)}</span>
              <span className={styles.chevronStream} aria-hidden="true">
                <ChevronRight size={14} strokeWidth={2.8} className={styles.chv1} />
                <ChevronRight size={14} strokeWidth={2.8} className={styles.chv2} />
                <ChevronRight size={14} strokeWidth={2.8} className={styles.chv3} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tactile Vibrant Floating Knob */}
      <motion.div
        className={`${styles.thumb} ${isCompleted ? styles.completed : ''} ${isDragging ? styles.dragging : ''} ${isLoading ? styles.loadingThumb : ''}`}
        drag={disabled || isCompleted || isLoading ? false : 'x'}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileHover={!isLoading && !isCompleted ? { scale: 1.04 } : {}}
        whileTap={!isLoading && !isCompleted ? { scale: 1.06 } : {}}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="thumb-loading"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Loader2 size={22} className={`${styles.thumbSpinner} animate-spin`} />
            </motion.div>
          ) : isCompleted ? (
            <motion.div
              key="thumb-completed"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check size={24} strokeWidth={3.2} className={styles.checkIcon} />
            </motion.div>
          ) : (
            <motion.div
              key="thumb-arrow"
              className={styles.thumbIconWrap}
              animate={isDragging ? { x: 1 } : { x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            >
              <ChevronsRight size={22} strokeWidth={2.8} className={styles.thumbArrow} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
