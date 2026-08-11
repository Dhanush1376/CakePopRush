import React from 'react'
import { QuantityOption } from '@/types/product'
import { formatCurrency } from '@/lib/formatters/currency'
import { Check } from 'lucide-react'
import styles from './QuantitySelector.module.css'

interface QuantitySelectorProps {
  quantities?: QuantityOption[]
  selectedId: string | null
  onChange: (id: string | null) => void
  basePrice: number
}

export const QuantitySelector = ({ quantities, selectedId, onChange, basePrice }: QuantitySelectorProps) => {
  if (!quantities || quantities.length === 0) return null

  return (
    <div className={styles.container}>
      <div className={styles.optionsGrid}>
        {quantities.map((q) => {
          const isSelected = selectedId === q.id
          const totalPrice = basePrice + q.priceModifier
          
          return (
            <button
              key={q.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => onChange(isSelected ? null : q.id)}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className={styles.checkBadge}>
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
              <div className={styles.textStack}>
                <span className={styles.pieces}>{q.pieces} <span className={styles.piecesText}>pieces</span></span>
                <span className={styles.boxLabel}>{q.label}</span>
              </div>
              <span className={styles.price}>{formatCurrency(totalPrice)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
