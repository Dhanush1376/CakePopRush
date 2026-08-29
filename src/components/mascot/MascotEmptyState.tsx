import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './MascotEmptyState.module.css';
import { CakePopMascot } from './CakePopMascot';
import { MascotReaction } from './reactions/reactionTypes';

export interface MascotEmptyStateProps {
  message: string;
  reaction?: MascotReaction;
  size?: 'small' | 'medium' | 'large';
}

export const MascotEmptyState: React.FC<MascotEmptyStateProps> = ({ 
  message, 
  reaction = 'sad',
  size = 'small'
}) => {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let index = 0;
    setTypedText('');
    let interval: ReturnType<typeof setInterval>;
    
    // Start typing right as the mascot and bubble finish their entrance
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (index <= message.length) {
          setTypedText(message.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 35);
    }, 850);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [message]);

  return (
    <div className={styles.mascotArea}>
      {/* Speech / Thought Bubble (appears after body pops up) */}
      <motion.div 
        className={styles.speechBubble}
        initial={{ scale: 0, opacity: 0, y: 10, x: 0, rotate: 8, originX: 0.1, originY: 1 }}
        animate={{ scale: 1, opacity: 1, y: 0, x: 0, rotate: 4 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 220, damping: 18 }}
      >
        {typedText.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i !== typedText.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Mascot Clipped Peeking Container: Pops up from behind the line */}
      <div className={styles.mascotClip}>
        <motion.div 
          className={styles.mascotInner}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.6 }}
        >
          <CakePopMascot size={size} reaction={reaction} loop={true} hideArms={true} />
        </motion.div>
      </div>

      {/* Hands Gripping the Line: 1st hand at 0.3s, 2nd hand at 0.45s */}
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

      {/* Horizontal Divider Line */}
      <div className={styles.wallTexture} />
    </div>
  );
};
