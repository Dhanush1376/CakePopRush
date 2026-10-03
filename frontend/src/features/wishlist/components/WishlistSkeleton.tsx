import React from 'react';
import styles from './WishlistSkeleton.module.css';
import { Skeleton } from '@/components/ui/Skeleton';

export const WishlistSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Skeleton variant="rectangular" className={styles.image} />
        <Skeleton variant="circular" className={styles.wishlistBtn} width={36} height={36} />
      </div>
      
      <div className={styles.content}>
        <Skeleton variant="text" width={80} height={12} className={styles.category} />
        
        <Skeleton variant="text" width="90%" height={24} className={styles.title} />
        <Skeleton variant="text" width="60%" height={24} className={styles.title} />
        
        <Skeleton variant="text" width={50} height={14} className={styles.rating} />
        
        <div className={styles.footer}>
          <Skeleton variant="text" width={70} height={28} className={styles.price} />
        </div>

        <Skeleton variant="rounded" width="100%" height={44} className={styles.actionBtn} />
      </div>
    </div>
  );
};
