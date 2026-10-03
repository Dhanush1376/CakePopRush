import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import styles from './ErrorCard.module.css'
interface ErrorCardProps {
  icon?: ReactNode
  title: string
  description: string
  error?: Error
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const ErrorCard = ({
  icon,
  title,
  description,
  error,
  primaryAction,
  secondaryAction,
  className = '',
}: ErrorCardProps) => {
  return (
    <motion.div 
      className={`${styles.card} ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      role="alert"
    >
      {icon && <div className={styles.iconContainer}>{icon}</div>}
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        
        {error && (
          <div className={styles.errorMessage}>
            {import.meta.env.DEV 
              ? error.message || 'An unknown error occurred'
              : 'An unexpected issue occurred. Our team has been notified.'}
          </div>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className={styles.actions}>
          {primaryAction && (
            <button className={styles.primaryAction} onClick={primaryAction.onClick}>
              <span>{primaryAction.label}</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          )}
          {secondaryAction && (
            <button className={styles.secondaryAction} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
