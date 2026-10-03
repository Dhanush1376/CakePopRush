import React, {} from 'react'
import { ShoppingBag, Heart, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import styles from './PurchaseActions.module.css'

interface PurchaseActionsProps {
  onAddToCart: () => void
  isOutOfStock?: boolean
  isSaved?: boolean
  onToggleSave?: () => void
  onCustomize?: () => void
}

export const PurchaseActions = ({ onAddToCart, isOutOfStock, isSaved = false, onToggleSave, onCustomize }: PurchaseActionsProps) => {

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
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Button 
          variant="outline" 
          className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
          onClick={onToggleSave}
          leftIcon={<Heart size={18} fill={isSaved ? "var(--color-brand-pink)" : "none"} color={isSaved ? "var(--color-brand-pink)" : "currentColor"} />}
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

      {onCustomize && (
        <Button
          variant="outline"
          className={styles.customizeBtn}
          onClick={onCustomize}
          leftIcon={<Pencil size={18} color="var(--color-brand-turquoise, #06B6D4)" />}
        >
          Customize This Product
        </Button>
      )}
    </div>
  )
}
