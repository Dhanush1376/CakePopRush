import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import styles from './FilterDrawer.module.css'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const FilterDrawer = ({ isOpen, onClose }: FilterDrawerProps) => {
  const [activeDietary, setActiveDietary] = useState<string[]>([])
  const [activeOccasion, setActiveOccasion] = useState<string[]>([])
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [price, setPrice] = useState(250)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleDietary = (item: string) => {
    setActiveDietary(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  const toggleOccasion = (item: string) => {
    setActiveOccasion(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  return createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Filter Options">
        <div className={styles.header}>
          <h3>Filters</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close filters">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.filterGroup}>
            <h4>Dietary</h4>
            <div className={styles.chipGroup}>
              {['Gluten Free', 'Vegan', 'Nut Free'].map(item => (
                <button 
                  key={item}
                  className={`${styles.chip} ${activeDietary.includes(item) ? styles.activeChip : ''}`}
                  onClick={() => toggleDietary(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <h4>Occasion</h4>
            <div className={styles.chipGroup}>
              {['Birthday', 'Wedding', 'Corporate', 'Anniversary'].map(item => (
                <button 
                  key={item}
                  className={`${styles.chip} ${activeOccasion.includes(item) ? styles.activeChip : ''}`}
                  onClick={() => toggleOccasion(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.priceHeader}>
              <h4>Price Range</h4>
              <span className={styles.priceValue}>Up to ₹{price}</span>
            </div>
            <div className={styles.priceSliderContainer}>
              <input 
                type="range" 
                min="0" 
                max="500" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={styles.priceSlider} 
                style={{ '--val': `${(price / 500) * 100}%` } as React.CSSProperties}
              />
              <div className={styles.priceLabels}>
                <span>₹0</span>
                <span>₹500</span>
              </div>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4>Color</h4>
            <div className={styles.colorOptions}>
              {['pink', 'blue', 'yellow', 'chocolate', 'white'].map(color => (
                <button 
                  key={color}
                  className={`${styles.colorSwatch} ${styles[color]} ${activeColor === color ? styles.activeColor : ''}`}
                  onClick={() => setActiveColor(activeColor === color ? null : color)}
                  aria-label={color}
                  title={color}
                >
                  {activeColor === color && <Check size={16} className={color === 'white' || color === 'yellow' ? styles.iconDark : styles.iconLight} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.applyButton} onClick={onClose}>
            Show Results
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
