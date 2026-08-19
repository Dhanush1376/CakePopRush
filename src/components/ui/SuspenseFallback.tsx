import React from 'react'
import { CircularRingSpinner } from './CircularRingSpinner'
import styles from './SuspenseFallback.module.css'

export function SuspenseFallback() {
  return (
    <div className={styles.container}>
      <CircularRingSpinner size="lg" />
      <div className={styles.text}>Loading...</div>
    </div>
  )
}
