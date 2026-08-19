import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import styles from './WishlistMascot.module.css';
import { CakePopMascot } from '@/components/mascot/CakePopMascot';
import { MascotReaction, MascotRef } from '@/components/mascot/reactions/reactionTypes';
import { useWishlist } from '@/features/wishlist';

const tapPhrases = [
  'Hi there!',
  'Saved your favorites?',
  'Treat yourself!',
  'Sweet choices!',
  "Can't wait for these!",
  'Life is sweet!',
  'Sweet tooth approved!',
];

let hasMascotAppeared = false;

export const WishlistMascot: React.FC = () => {
  const { items } = useWishlist();
  const [speechText, setSpeechText] = useState<string | null>(null);

  const mascotRef = useRef<HTMLDivElement>(null);
  const mascotControlRef = useRef<MascotRef>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousItemCount = useRef<number | null>(null);
  const initialMountDone = useRef(false);

  // Eye tracking setup
  const eyeTargetX = useMotionValue(0);
  const eyeTargetY = useMotionValue(0);
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 });
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 });

  // Show a temporary message that automatically hides
  const showTemporaryMessage = useCallback((msg: string, durationMs: number = 3500) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setSpeechText(msg);
    hideTimerRef.current = setTimeout(() => {
      setSpeechText(null);
    }, durationMs);
  }, []);

  // 1. Arrival reaction: Blow a kiss and briefly greet, then hide
  useEffect(() => {
    if (!hasMascotAppeared) {
      hasMascotAppeared = true;
      const arrivalTimer = setTimeout(() => {
        const GREETINGS = ['winking', 'cool', 'silly', 'love', 'blushing', 'party', 'emotionalCute'] as const;
        mascotControlRef.current?.play(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
        showTemporaryMessage('Hi there!', 3500);
      }, 1000);

      return () => clearTimeout(arrivalTimer);
    }
  }, [showTemporaryMessage]);

  const mascotInitialY = hasMascotAppeared ? 0 : 120;
  const mascotInitialOpacity = hasMascotAppeared ? 1 : 0;
  
  // 2. Event-driven reactions: removal or restoring items
  useEffect(() => {
    if (previousItemCount.current !== null) {
      if (items.length < previousItemCount.current) {
        // An item was removed -> cry and show temporary sad message
        mascotControlRef.current?.play('cryingFountain');
        showTemporaryMessage('Aww... removed!', 4000);
      } else if (items.length > previousItemCount.current) {
        // An item was added/restored -> celebrate!
        mascotControlRef.current?.play('excited');
        showTemporaryMessage('Yay, sweet treat back!', 3200);
      }
    }
    previousItemCount.current = items.length;
  }, [items.length, showTemporaryMessage]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

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

  // 3. User taps/clicks on mascot -> play reaction and briefly speak
  const handleMascotClick = () => {
    const TAP_REACTIONS: MascotReaction[] = [
      'love',
      'blowKiss',
      'excited',
      'party',
      'laughing',
      'winking',
      'silly',
      'cool',
    ];
    const randomReaction = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    const randomPhrase = tapPhrases[Math.floor(Math.random() * tapPhrases.length)];

    mascotControlRef.current?.play(randomReaction);
    showTemporaryMessage(randomPhrase, 3000);
  };

  return (
    <div className={styles.mascotContainer}>
      {/* Speech Bubble: Only appears during user activity / events */}
      <AnimatePresence>
        {speechText && (
          <motion.div
            key={speechText}
            className={styles.speechBubble}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span>{speechText}</span>
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
            eyeX={eyeSpringX}
            eyeY={eyeSpringY}
            hideArms={true}
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
