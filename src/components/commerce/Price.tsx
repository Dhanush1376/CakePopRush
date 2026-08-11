import React from 'react'
import styles from './Price.module.css'
import { formatCurrency } from '@/lib/formatters/currency'

interface PriceProps {
  amount: number // in smallest currency unit (paise)
  compareAtAmount?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Price = ({ amount, compareAtAmount, className = '', size = 'md' }: PriceProps) => {
  const isDiscounted = compareAtAmount !== undefined && compareAtAmount > amount

  return (
    <div className={`${styles.container} ${styles[size]} ${className}`}>
      <span className={styles.currentPrice}>
        {formatCurrency(amount)}
      </span>
      {isDiscounted && (
        <span className={styles.compareAtPrice}>
          {formatCurrency(compareAtAmount)}
        </span>
      )}
    </div>
  )
}
