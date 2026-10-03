import React from 'react'
import { formatCurrency } from '@/lib/formatters/currency'
import { Info, ChevronDown, ShoppingBag, Zap } from 'lucide-react'
import styles from './StickyMobileCTA.module.css'

interface StickyMobileCTAProps {
  totalPrice: number
  onAddToCart: () => void
  onBuyNow: () => void
}

export const StickyMobileCTA = ({ totalPrice, onAddToCart, onBuyNow }: StickyMobileCTAProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.priceColumn}>
        <div className={styles.totalLabel}>
          Total <Info size={10} color="#999" />
        </div>
        <div className={styles.price}>{formatCurrency(totalPrice)}</div>
        <button className={styles.viewDetailsBtn}>
          View Details <ChevronDown size={10} />
        </button>
      </div>
      
      <div className={styles.actionsColumn}>
        <button className={styles.addToCartBtn} onClick={onAddToCart}>
          <ShoppingBag size={14} /> Add to Cart
        </button>
        <button className={styles.buyNowBtn} onClick={onBuyNow}>
          <Zap size={14} /> Buy Now
        </button>
      </div>
    </div>
  )
}
