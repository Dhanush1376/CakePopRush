import React from 'react'
import { AlertTriangle, Leaf } from 'lucide-react'
import { NutritionInfo } from '@/types/product'
import styles from './IngredientsAndNutrition.module.css'

interface IngredientsAndNutritionProps {
  ingredients?: string
  allergens?: string[]
  dietaryInfo?: string[]
  nutrition?: NutritionInfo
}

export const IngredientsAndNutrition = ({ 
  ingredients, 
  allergens, 
  dietaryInfo,
  nutrition
}: IngredientsAndNutritionProps) => {
  if (!ingredients && (!allergens || allergens.length === 0) && !nutrition) return null

  return (
    <div className={styles.container}>
      
      {ingredients && (
        <div className={styles.section}>
          <p className={styles.text}>{ingredients}</p>
        </div>
      )}

      {(allergens?.length || dietaryInfo?.length) && (
        <div className={styles.tagsContainer}>
          {allergens && allergens.length > 0 && (
            <div className={styles.tagGroup}>
              <div className={styles.sectionHeader}>
                <AlertTriangle size={16} className={styles.iconWarning} />
                <h4 className={styles.subtitle}>Contains Allergens</h4>
              </div>
              <div className={styles.tagList}>
                {allergens.map(a => (
                  <span key={a} className={styles.tagWarning}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {dietaryInfo && dietaryInfo.length > 0 && (
            <div className={styles.tagGroup}>
              <div className={styles.sectionHeader}>
                <Leaf size={16} className={styles.iconSuccess} />
                <h4 className={styles.subtitle}>Dietary Friendly</h4>
              </div>
              <div className={styles.tagList}>
                {dietaryInfo.map(d => (
                  <span key={d} className={styles.tagSuccess}>{d}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {nutrition && (
        <div className={styles.nutritionSection}>
          <h4 className={styles.subtitle}>Nutrition Facts</h4>
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
