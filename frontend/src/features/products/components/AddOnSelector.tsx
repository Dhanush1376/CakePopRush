import React from 'react'
import { AddOn } from '@/types/product'
import { formatCurrency } from '@/lib/formatters/currency'
import { Plus, Check } from 'lucide-react'
import styles from './AddOnSelector.module.css'

interface AddOnSelectorProps {
  addOns?: AddOn[]
  selectedAddOns: Set<string>
  onToggle: (id: string) => void
}

export const AddOnSelector = ({ addOns, selectedAddOns, onToggle }: AddOnSelectorProps) => {
  if (!addOns || addOns.length === 0) return null

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Make It Extra Special</h3>
      <div className={styles.optionsGrid}>
        {addOns.map((addon) => {
          const isSelected = selectedAddOns.has(addon.id)
          
          return (
            <button
              key={addon.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => onToggle(addon.id)}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className={styles.checkBadge}>
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
              <div className={styles.textStack}>
                <span className={styles.name}>{addon.name}</span>
                <div className={styles.priceTag}>
                  <Plus size={12} className={styles.plusIcon} />
                  <span className={styles.price}>{formatCurrency(addon.price)}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
