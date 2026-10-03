import React from 'react'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters/currency'
import { Button } from '@/components/ui/Button'
import styles from './BundleSection.module.css'

export const BundleSection = () => {
  // Mock bundle data
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Complete The Moment</h3>
      
      <div className={styles.bundleCard}>
        <div className={styles.itemsList}>
          <div className={styles.item}>Cake Pops</div>
          <Plus size={14} className={styles.plus} />
          <div className={styles.item}>Birthday Card</div>
          <Plus size={14} className={styles.plus} />
          <div className={styles.item}>Gift Packaging</div>
        </div>
        
        <div className={styles.pricing}>
          <div className={styles.priceCol}>
            <span className={styles.oldPrice}>Usually {formatCurrency(89900)}</span>
            <span className={styles.bundlePrice}>Bundle {formatCurrency(74900)}</span>
          </div>
          <Button variant="primary" size="sm">Add Bundle</Button>
        </div>
      </div>
    </div>
  )
}
