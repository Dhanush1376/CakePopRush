import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Accordion.module.css'

interface AccordionProps {
  title: string
  icon?: React.ReactNode
  isRequired?: boolean
  isDefaultOpen?: boolean
  hideStatus?: boolean
  children: React.ReactNode
}

export const Accordion = ({ title, icon, isRequired, isDefaultOpen = false, hideStatus = false, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen)

  return (
    <div className={styles.accordionContainer}>
      <button 
        className={styles.accordionHeader} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.headerLeft}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.headerRight}>
          {!hideStatus && (
            <span className={isRequired ? styles.requiredLabel : styles.optionalLabel}>
              {isRequired ? 'Required' : 'Optional'}
            </span>
          )}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={styles.accordionContent}
          >
            <div className={styles.contentInner}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
