import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WishlistHeader.module.css';

interface WishlistHeaderProps {
  itemCount: number;
}

export const WishlistHeader = ({ itemCount }: WishlistHeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Wishlist</h1>
        <p className={styles.subtitle}>Your sweetest picks, saved for later.</p>
      </div>
      
      <div className={styles.actions}>
        <div className={styles.countBadge}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'} saved for later
        </div>
      </div>
    </div>
  );
};
