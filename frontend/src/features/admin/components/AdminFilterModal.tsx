import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminFilterModal.module.css';

export interface AdminFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
}

export function AdminFilterModal({
  isOpen,
  onClose,
  title = 'Advanced Filters',
  children,
  onApply,
  onReset,
}: AdminFilterModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
        <div 
          className={styles.overlay} 
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-filter-modal-title"
        >
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
            <div className={styles.dragHandleContainer}>
              <div className={styles.dragHandle} />
            </div>
            <div className={styles.header}>
              <h2 id="admin-filter-modal-title" className={styles.title}>{title}</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className={styles.content}>
              {children}
            </div>
            <div className={styles.footer}>
              <button className={styles.resetBtn} onClick={onReset}>
                Reset
              </button>
              <button className={styles.applyBtn} onClick={onApply}>
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
