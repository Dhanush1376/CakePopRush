import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/assets/brand/Logo';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Show splash screen for exactly 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    // Lock scrolling while splash is active
    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <motion.div 
      className={styles.splashContainer}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className={styles.logoWrapper}>
        <Logo height={150} noLink />
      </div>
    </motion.div>
  );
};

