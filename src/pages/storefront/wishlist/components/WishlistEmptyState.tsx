import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WishlistEmptyState.module.css';
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState';
import { ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const WishlistEmptyState = () => {
  return (
    <div className={styles.container}>
      {/* Visual Composition */}
      <motion.div 
        className={styles.illustrationWrapper}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <MascotEmptyState 
          message="Your wishlist is empty...&#10;Time to find your favorites!" 
          reaction="surprised" 
        />
      </motion.div>
      
      {/* Text Content */}
      <motion.div 
        className={styles.textContent}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        <h2 className={styles.title}>Your wishlist is waiting for something sweet</h2>
      </motion.div>
      
      {/* Actions */}
      <motion.div 
        className={styles.actions}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
      >
        <Link to="/shop" className={styles.primaryAction}>
          <span>Explore Collections</span> <ArrowRight className={styles.arrowIcon} size={18} strokeWidth={2.5} />
        </Link>
        <Link to="/" className={styles.secondaryAction}>
          Go Home
        </Link>
      </motion.div>
    </div>
  );
};
