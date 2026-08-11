import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useToast, ToastMessage } from './ToastContext'
import styles from './Toast.module.css'

const ToastItem = ({ toast, onRemove }: { toast: ToastMessage, onRemove: (id: string) => void }) => {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      drag="y"
      dragConstraints={{ top: -100, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y < -30 || velocity.y < -300) {
          onRemove(toast.id)
        }
      }}
      className={`${styles.toast} ${styles[toast.type]}`}
      role="alert"
    >
      <div className={styles.iconContainer}>
        {(toast.type === 'info' || toast.type === 'success') && (
          <div className={styles.circleSuccess}>
            <Check size={14} strokeWidth={3.5} />
          </div>
        )}
        {(toast.type === 'error' || toast.type === 'warning') && (
          <div className={styles.circleError}>
            <X size={14} strokeWidth={3.5} />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.title}>{toast.title}</span>
        {toast.message && <span className={styles.message}> - {toast.message}</span>}
      </div>
      
      {toast.action && (
        <button 
          className={styles.actionBtn} 
          onClick={() => {
            toast.action!.onClick()
            onRemove(toast.id)
          }}
        >
          {toast.action.label}
        </button>
      )}
    </motion.div>
  )
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()
  
  return (
    <div className={styles.container}>
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
