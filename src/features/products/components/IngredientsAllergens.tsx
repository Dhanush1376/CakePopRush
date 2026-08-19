import React from 'react'
import { Info, AlertTriangle, Leaf } from 'lucide-react'
import styles from './IngredientsAllergens.module.css'

interface IngredientsAllergensProps {
  ingredients?: string
  allergens?: string[]
  dietaryInfo?: string[]
}

export const IngredientsAllergens = ({ ingredients, allergens, dietaryInfo }: IngredientsAllergensProps) => {
  if (!ingredients && (!allergens || allergens.length === 0)) return null

  return (
    <div className={styles.container}>
      <h3 className={styles.mainTitle}>What's inside</h3>
      
      {ingredients && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Info size={16} className={styles.iconInfo} />
            <h4 className={styles.subtitle}>Ingredients</h4>
          </div>
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
    </div>
  )
}
