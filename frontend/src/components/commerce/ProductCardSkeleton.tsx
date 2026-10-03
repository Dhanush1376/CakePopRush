import React from 'react'
import { Skeleton } from '../ui/Skeleton'
import styles from './ProductCardSkeleton.module.css'

export const ProductCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Skeleton variant="rectangular" className={styles.image} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <Skeleton variant="text" width={60} height={14} />
        </div>
        
        <Skeleton variant="text" width="80%" height={24} className={styles.title} />
        
        <div className={styles.footer}>
          <Skeleton variant="text" width={50} height={20} />
        </div>
      </div>
    </div>
  )
}
