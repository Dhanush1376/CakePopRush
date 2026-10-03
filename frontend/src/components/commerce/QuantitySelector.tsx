import React, { useState, useEffect } from 'react'
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
  const [localValue, setLocalValue] = useState<string>(String(quantity))

  useEffect(() => {
    setLocalValue(String(quantity))
  }, [quantity])

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
    const text = e.target.value.replace(/\D/g, '')
    setLocalValue(text)
    if (text === '') return
    const val = parseInt(text, 10)
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val)
    }
  }

  const handleBlur = () => {
    const val = parseInt(localValue, 10)
    if (isNaN(val) || val < min) {
      setLocalValue(String(min))
      onChange(min)
    } else if (val > max) {
      setLocalValue(String(max))
      onChange(max)
    } else {
      setLocalValue(String(val))
      onChange(val)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
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
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        className={styles.input}
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
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
