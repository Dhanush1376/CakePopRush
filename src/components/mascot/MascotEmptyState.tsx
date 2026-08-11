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

export const MascotEmptyState = ({ 
  message, 
  reaction = 'confused',
  size = 'medium'
}: MascotEmptyStateProps) => {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let index = 0;
    // Reset typing text when message changes
    setTypedText("");
    
    // Delay typing slightly so it starts after pop-up
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index <= message.length) {
          setTypedText(message.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 40); // speed of typing
      
      return () => clearInterval(interval);
    }, 400);

    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div className={styles.mascotArea}>
      <motion.div 
        className={styles.thoughtBubbleWrapper}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className={styles.thoughtBubble}>
          {typedText.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i !== typedText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
      <div className={styles.mascotWallContainer}>
        <motion.div
          initial={{ y: 150 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className={styles.mascotWrapper}>
            <CakePopMascot size={size} reaction={reaction} loop={true} />
          </div>
        </motion.div>
      </div>
      <motion.div 
        className={styles.mascotHandLeft}
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />
      <motion.div 
        className={styles.mascotHandRight}
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />
      <div className={styles.wallTexture}></div>
    </div>
  );
};
