import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import styles from './WishlistMascot.module.css';
import { CakePopMascot } from '@/components/mascot/CakePopMascot';
import { MascotReaction, MascotRef } from '@/components/mascot/reactions/reactionTypes';
import { useWishlist } from '@/features/wishlist';

import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';

let hasMascotAppeared = false;

export const WishlistMascot: React.FC = () => {
  const { items } = useWishlist();
  const { currentReaction, currentMessage, triggerReaction, tapMascot, prefersReducedMotion } = useMascotOrchestrator();

  const mascotRef = useRef<HTMLDivElement>(null);
  const mascotControlRef = useRef<MascotRef>(null);
  const previousItemCount = useRef<number | null>(null);

  // Eye tracking setup
  const eyeTargetX = useMotionValue(0);
  const eyeTargetY = useMotionValue(0);
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 });
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 });

  // 1. Arrival reaction: handled by MascotOrchestrationProvider or local trigger if needed
  // (Wishlist is a page, so MascotOrchestrationProvider already handles route arrivals if we configured it,
  // but let's just trigger a wishlist arrival here if it hasn't appeared)
  useEffect(() => {
    if (!hasMascotAppeared) {
      hasMascotAppeared = true;
      const arrivalTimer = setTimeout(() => {
        triggerReaction('page:cart-opened'); // using a playful generic arrival
      }, 1000);

      return () => clearTimeout(arrivalTimer);
    }
  }, [triggerReaction]);

  const mascotInitialY = hasMascotAppeared ? 0 : 120;
  const mascotInitialOpacity = hasMascotAppeared ? 1 : 0;
  
  // 2. Event-driven reactions: The MascotOrchestrationProvider ALREADY auto-detects wishlist
  // additions/removals and triggers 'wishlist:item-added' or 'wishlist:item-removed'.
  // We don't need local triggering here anymore!

  // Clean up timer on unmount (no local timer needed anymore)

  // Pointer follower for mascot eyes
  useEffect(() => {
    const handlePointerEvent = (e: PointerEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const x = e.clientX - mascotCenterX;
      const y = e.clientY - mascotCenterY;

      const targetX = Math.max(-8, Math.min(8, (x / 250) * 8));
      const targetY = Math.max(-8, Math.min(8, (y / 250) * 8));

      eyeTargetX.set(targetX);
      eyeTargetY.set(targetY);
    };

    window.addEventListener('pointermove', handlePointerEvent);
    return () => {
      window.removeEventListener('pointermove', handlePointerEvent);
    };
  }, [eyeTargetX, eyeTargetY]);

  // 3. User taps/clicks on mascot -> play reaction
  const handleMascotClick = () => {
    tapMascot();
  };

  return (
    <div className={styles.mascotContainer}>
      {/* Speech Bubble: Only appears during user activity / events */}
      <AnimatePresence>
        {currentMessage && (
          <motion.div
            key={currentMessage}
            className={styles.speechBubble}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span>{currentMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Clipped Container (clips strictly at grid line) */}
      <div className={styles.mascotClip} onClick={handleMascotClick}>
        <motion.div
          ref={mascotRef}
          className={styles.mascotInner}
          initial={{ y: mascotInitialY, opacity: mascotInitialOpacity }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: hasMascotAppeared ? 0 : 0.6 }}
        >
          <CakePopMascot
            ref={mascotControlRef}
            size="large"
            reaction={currentReaction}
            eyeX={eyeSpringX}
            eyeY={eyeSpringY}
            hideArms={true}
            speedMultiplier={prefersReducedMotion ? 1 : 2}
          />
        </motion.div>
      </div>

      {/* Mascot Paws / Hands gripping the top edge */}
      <motion.div 
        className={styles.mascotHandRight}
        initial={{ y: 20, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      />
      <motion.div 
        className={styles.mascotHandLeft}
        initial={{ y: 20, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.45 }}
      />
    </div>
  );
};
