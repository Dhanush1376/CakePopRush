import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import styles from './ValidationBubble.module.css'

interface ValidationBubbleProps {
  error?: string
  visible?: boolean
}

export const ValidationBubble = ({ error, visible = !!error }: ValidationBubbleProps) => {
  return (
    <AnimatePresence>
      {visible && error && (
        <motion.div 
          className={styles.bubble}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          role="alert"
        >
          <AlertCircle size={14} strokeWidth={2.5} className={styles.icon} />
          <span className={styles.text}>{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
