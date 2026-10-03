import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/assets/brand/Logo';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-splash', 'true');
    document.body.setAttribute('data-splash', 'true');
    document.body.style.overflow = 'hidden';

    // Show splash screen for exactly 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      document.documentElement.removeAttribute('data-splash');
      document.body.removeAttribute('data-splash');
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (typeof document === 'undefined') return null;

  return createPortal(
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
    </motion.div>,
    document.body
  );
};

