import React from 'react'
import { Check } from 'lucide-react'
import { InlineOption } from '../config/configurationTypes'
import { formatCurrency } from '@/lib/formatters/currency'
import styles from './InlineOptionSelector.module.css'

interface InlineOptionSelectorProps {
  options?: InlineOption[]
  selectedIds: string | Set<string>
  onChange: (id: string) => void
  multiSelect?: boolean
}

export const InlineOptionSelector = ({ options, selectedIds, onChange, multiSelect = false }: InlineOptionSelectorProps) => {
  if (!options || options.length === 0) return null

  return (
    <div className={styles.container}>
      <div className={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = multiSelect 
            ? (selectedIds as Set<string>).has(option.id)
            : selectedIds === option.id
          
          return (
            <button
              key={option.id}
              className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => onChange(option.id)}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className={styles.checkBadge}>
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
              {option.colorHex && (
                <div 
                  className={styles.colorSwatch} 
                  style={{ backgroundColor: option.colorHex }} 
                />
              )}
              <div className={styles.cardContent}>
                <span className={styles.optionName}>{option.label}</span>
                <span className={styles.optionPrice}>
                  {option.priceDelta > 0 ? `+ ${formatCurrency(option.priceDelta)}` : '+ ₹0'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
