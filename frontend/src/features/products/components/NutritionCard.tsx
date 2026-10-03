import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { NutritionInfo } from '@/types/product'
import styles from './NutritionCard.module.css'

interface NutritionCardProps {
  nutrition?: NutritionInfo
}

export const NutritionCard = ({ nutrition }: NutritionCardProps) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!nutrition) return null

  return (
    <div className={styles.container}>
      <button 
        className={styles.header} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.title}>Nutrition Facts</span>
        {isOpen ? <ChevronUp size={20} className={styles.icon} /> : <ChevronDown size={20} className={styles.icon} />}
      </button>

      {isOpen && (
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.item}>
              <span className={styles.value}>{nutrition.calories}</span>
              <span className={styles.label}>kcal</span>
            </div>
            <div className={styles.item}>
              <span className={styles.value}>{nutrition.protein}g</span>
              <span className={styles.label}>Protein</span>
            </div>
            <div className={styles.item}>
              <span className={styles.value}>{nutrition.carbs}g</span>
              <span className={styles.label}>Carbs</span>
            </div>
            <div className={styles.item}>
              <span className={styles.value}>{nutrition.fat}g</span>
              <span className={styles.label}>Fat</span>
            </div>
          </div>
          <p className={styles.disclaimer}>* Approximate values per serving.</p>
        </div>
      )}
    </div>
  )
}
