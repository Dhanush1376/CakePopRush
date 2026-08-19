import React from 'react'
import { Clock, ThermometerSun, ShieldAlert } from 'lucide-react'
import styles from './FreshnessInfo.module.css'

interface FreshnessInfoProps {
  preparationTime?: string
  shelfLife?: string
  storage?: string
}

export const FreshnessInfo = ({ preparationTime, shelfLife, storage }: FreshnessInfoProps) => {
  if (!preparationTime && !shelfLife && !storage) return null

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Made Fresh For You</h3>
      <div className={styles.card}>
        {preparationTime && (
          <div className={styles.row}>
            <Clock size={18} className={styles.icon} />
            <div className={styles.textGroup}>
              <span className={styles.title}>Preparation</span>
              <span className={styles.value}>{preparationTime}</span>
            </div>
          </div>
        )}
        
        {shelfLife && (
          <div className={styles.row}>
            <ShieldAlert size={18} className={styles.icon} />
            <div className={styles.textGroup}>
              <span className={styles.title}>Best Consumed</span>
              <span className={styles.value}>Within {shelfLife}</span>
            </div>
          </div>
        )}
        
        {storage && (
          <div className={styles.row}>
            <ThermometerSun size={18} className={styles.icon} />
            <div className={styles.textGroup}>
              <span className={styles.title}>Storage</span>
              <span className={styles.value}>{storage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
