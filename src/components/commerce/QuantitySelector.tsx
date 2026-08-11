import React from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './QuantitySelector.module.css'
import { IconButton } from '../ui/IconButton'

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
      <IconButton
        icon={
          <AnimatePresence mode="wait" initial={false}>
            {min === 0 && quantity === 1 ? (
              <motion.div
                key="trash"
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex' }}
              >
                <Trash2 size={12} />
              </motion.div>
            ) : (
              <motion.div
                key="minus"
                initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex' }}
              >
                <Minus size={12} />
              </motion.div>
            )}
          </AnimatePresence>
        }
        size="sm"
        variant="ghost"
        onClick={handleDecrement}
        disabled={quantity <= min}
        aria-label={min === 0 && quantity === 1 ? "Remove item" : "Decrease quantity"}
      />
      
      <input
        type="number"
        className={styles.input}
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        aria-label="Quantity"
      />
      
      <IconButton
        icon={<Plus size={12} />}
        size="sm"
        variant="ghost"
        onClick={handleIncrement}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      />
    </div>
  )
}
