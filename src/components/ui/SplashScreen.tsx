import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/assets/brand/Logo';
import styles from './SplashScreen.module.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Show splash for 2.5 seconds as requested
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    
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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div>
        <Logo height={150} />
      </div>
    </motion.div>
  );
};
