import React from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import styles from './QuantitySelector.module.css'

interface QuantitySelectorProps {
  quantity: number
  onChange: (newQuantity: number) => void
  min?: number
  max?: number
  className?: string
}

export const QuantitySelector = ({
  quantity,
  onChange,
  min = 1,
  max = 99,
  className = '',
}: QuantitySelectorProps) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity > min) {
      onChange(quantity - 1)
    } else if (min === 0 && quantity === 1) {
      onChange(0)
    }
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity < max) {
      onChange(quantity + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (isNaN(val)) return
    if (val >= min && val <= max) {
      onChange(val)
    }
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <button
        type="button"
        className={styles.stepBtn}
        onClick={handleDecrement}
        disabled={quantity < min}
        aria-label={min === 0 && quantity === 1 ? "Remove item" : "Decrease quantity"}
      >
        {min === 0 && quantity === 1 ? (
          <Trash2 size={11} strokeWidth={2} />
        ) : (
          <Minus size={11} strokeWidth={2.5} />
        )}
      </button>
      
      <input
        type="number"
        className={styles.input}
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        aria-label="Quantity"
      />
      
      <button
        type="button"
        className={styles.stepBtn}
        onClick={handleIncrement}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}
