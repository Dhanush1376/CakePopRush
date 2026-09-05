import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionValueEvent, AnimatePresence, animate } from 'framer-motion';
import { ChevronsRight, Loader2, Check, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters/currency';
import styles from './SlideToOrder.module.css';

interface SlideToOrderProps {
  onSuccess: () => void;
  totalAmount: number;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SlideToOrder: React.FC<SlideToOrderProps> = ({
  onSuccess,
  totalAmount,
  isLoading = false,
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverThreshold, setIsOverThreshold] = useState(false);
  const x = useMotionValue(0);

  // Measure available slide distance
  useEffect(() => {
    const updateDimensions = () => {
      if (trackRef.current) {
        // Track width minus 46px thumb and 8px total padding (4px on each side)
        const trackWidth = trackRef.current.clientWidth;
        setMaxDrag(Math.max(0, trackWidth - 46 - 8));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Monitor drag position to update dynamic states
  useMotionValueEvent(x, 'change', (latest) => {
    if (maxDrag > 0) {
      setIsOverThreshold(latest >= maxDrag * 0.55);
    }
  });

  // Calculate trail width directly following thumb center
  const trailWidth = useMotionValue(0);
  useMotionValueEvent(x, 'change', (latest) => {
    trailWidth.set(Math.max(0, latest + 24));
  });

  const handleDragEnd = () => {
    setIsDragging(false);
    if (disabled || isLoading || isCompleted) return;

    // Slide threshold: 55% of track width
    if (x.get() >= maxDrag * 0.55) {
      setIsCompleted(true);
      // Snap smoothly to the very end
      animate(x, maxDrag, {
        type: 'spring',
        stiffness: 500,
        damping: 32,
        onComplete: () => {
          onSuccess();
        },
      });
    } else {
      setIsOverThreshold(false);
      animate(x, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      });
    }
  };

  // Reset if loading finishes or error
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

  return (
    <div
      className={`${styles.track} ${disabled ? styles.disabled : ''} ${isLoading ? styles.loading : ''}`}
      ref={trackRef}
    >
      {/* Animated Candy-Gloss Slide Trail with Active Flow */}
      <motion.div
        className={styles.slideTrail}
        style={{
          width: isLoading || isCompleted ? 'calc(100% - 6px)' : trailWidth,
          opacity: isLoading || isCompleted ? 1 : (isDragging || isCompleted ? 1 : 0),
        }}
      >
        <div className={styles.slideTrailShimmer} />
        <div className={styles.trailChevrons}>
          <span>›</span>
          <span>›</span>
          <span>›</span>
          <span>›</span>
          <span>›</span>
        </div>
      </motion.div>

      {/* Target Destination Dock at right end */}
      <div 
        className={`${styles.endDock} ${isOverThreshold ? styles.endDockActive : ''}`} 
        aria-hidden="true"
      >
        {isOverThreshold ? (
          <CheckCircle2 size={18} className={styles.dockCheckIcon} />
        ) : (
          <ChevronsRight size={18} className={styles.dockIcon} />
        )}
      </div>

      {/* Dynamic Centered Text that informs the user in real time */}
      <div className={styles.labelWrapper}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading-label"
              className={styles.authorizingState}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.authorizingText}>Securing your payment...</span>
            </motion.div>
          ) : isOverThreshold ? (
            <motion.div 
              key="release-label"
              className={styles.releasePrompt}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <CheckCircle2 size={16} className={styles.promptCheckIcon} />
              <span className={styles.releaseText}>Release to Pay {formatCurrency(totalAmount)}</span>
            </motion.div>
          ) : (
            <motion.div 
              key="slide-label"
              className={styles.shimmerText}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className={styles.actionText}>Slide to Pay</span>
              <span className={styles.separator}>•</span>
              <span className={styles.amountText}>{formatCurrency(totalAmount)}</span>
              <span className={styles.chevronStream} aria-hidden="true">
                <span className={styles.chv1}>›</span>
                <span className={styles.chv2}>›</span>
                <span className={styles.chv3}>›</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tactile Floating Thumb that stays mounted during loading with fluid icon transitions */}
      <motion.div
        className={`${styles.thumb} ${isCompleted ? styles.completed : ''} ${isDragging ? styles.dragging : ''} ${isLoading ? styles.loadingThumb : ''}`}
        drag={disabled || isCompleted || isLoading ? false : 'x'}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileHover={!isLoading && !isCompleted ? { scale: 1.05 } : {}}
        whileTap={!isLoading && !isCompleted ? { scale: 1.08 } : {}}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="thumb-loading"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={22} className={`${styles.thumbSpinner} animate-spin`} />
            </motion.div>
          ) : isCompleted ? (
            <motion.div
              key="thumb-completed"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check size={24} strokeWidth={3} className={styles.checkIcon} />
            </motion.div>
          ) : (
            <motion.div
              key="thumb-arrow"
              className={styles.thumbIconWrap}
              animate={isDragging ? { x: 1 } : { x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <ChevronsRight 
                size={22} 
                strokeWidth={2.6} 
                className={`${styles.arrowIcon} ${isOverThreshold ? styles.arrowIconActive : ''}`} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
