import React, {} from 'react'
import { ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import styles from './PurchaseActions.module.css'

interface PurchaseActionsProps {
  onAddToCart: () => void
  isOutOfStock?: boolean
  isSaved?: boolean
  onToggleSave?: () => void
}

export const PurchaseActions = ({ onAddToCart, isOutOfStock, isSaved = false, onToggleSave }: PurchaseActionsProps) => {

  if (isOutOfStock) {
    return (
      <div className={styles.container}>
        <Button variant="secondary" fullWidth disabled>
          OUT OF STOCK
        </Button>
        <p className={styles.notifyText}>Notify me when available</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Button 
        variant="outline" 
        className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
        onClick={onToggleSave}
        leftIcon={<Heart size={18} fill={isSaved ? "currentColor" : "none"} color={isSaved ? "var(--color-brand-pink)" : "currentColor"} />}
      >
        {isSaved ? 'Saved' : 'Save'}
      </Button>
      
      <Button 
        variant="secondary" 
        className={styles.addBtn}
        onClick={onAddToCart}
        leftIcon={<ShoppingBag size={18} />}
      >
        Add to Cart
      </Button>
    </div>
  )
}
