import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ResponsiveModal.module.css'

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  allowOverflow?: boolean
}

export const ResponsiveModal = ({ isOpen, onClose, title, children, allowOverflow }: ResponsiveModalProps) => {
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

  // Detect screen size for animation type
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : false;

  const animationProps = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { type: 'spring', bounce: 0, duration: 0.4 }
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { type: 'spring', bounce: 0, duration: 0.4 }
      };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div 
            className={styles.overlay} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute' }}
          />
          <motion.div 
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
            {...(animationProps as any)}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className={styles.content} style={allowOverflow ? { overflow: 'visible' } : undefined}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
