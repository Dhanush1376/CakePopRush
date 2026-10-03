import React from 'react'
import { Container } from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/Skeleton'
import styles from './PDPSkeleton.module.css'

export const PDPSkeleton = () => {
  return (
    <div className={styles.page}>
      <Container>
        <Skeleton variant="text" width={200} height={16} className={styles.breadcrumb} />
        
        <div className={styles.grid}>
          {/* Gallery Skeleton */}
          <div className={styles.gallery}>
            <Skeleton variant="rectangular" className={styles.mainImage} />
          </div>
          
          {/* Info Skeleton */}
          <div className={styles.info}>
            <Skeleton variant="rounded" width={64} height={64} className={styles.smallThumb} />
            <div className={styles.headerRow}>
              <Skeleton variant="text" height={40} width="60%" className={styles.title} />
              <Skeleton variant="text" height={40} width="25%" className={styles.price} />
            </div>
            <Skeleton variant="text" width={150} height={20} className={styles.rating} />
            
            <div className={styles.desc}>
              <Skeleton variant="text" height={16} />
              <Skeleton variant="text" height={16} />
              <Skeleton variant="text" height={16} width="80%" />
            </div>
            
            <div className={styles.accordions}>
              <Skeleton variant="rounded" height={56} className={styles.accordionRow} />
              <Skeleton variant="rounded" height={56} className={styles.accordionRow} />
              <Skeleton variant="rounded" height={56} className={styles.accordionRow} />
              <Skeleton variant="rounded" height={56} className={styles.accordionRow} />
            </div>

            <Skeleton variant="rounded" height={140} className={styles.customThemeCta} />
            
            <Skeleton variant="rounded" height={80} className={styles.deliveryBlock} />
            <Skeleton variant="rounded" height={60} className={styles.couponsBlock} />
            <Skeleton variant="rounded" height={120} className={styles.orderSummaryBlock} />
          </div>
        </div>
      </Container>
    </div>
  )
}
