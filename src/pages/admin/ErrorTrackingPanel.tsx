import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Clock, Copy, RefreshCw, ChevronDown, ChevronUp, FileText, Bug } from 'lucide-react'
import styles from './ErrorTrackingPanel.module.css'

// Mock Data for Demo
const MOCK_ERRORS = [
  { id: 'ERR-001', type: 'critical', title: 'Payment Gateway Timeout', time: '10:42 AM', page: '/checkout', message: 'Stripe API failed to respond after 10000ms', stack: 'Error: Stripe timeout\n  at Checkout (checkout.tsx:45)\n  at processTicksAndRejections (node:internal/process/task_queues:96:5)' },
  { id: 'ERR-002', type: 'error', title: 'Missing Product Image', time: '09:15 AM', page: '/product/cakepop-1', message: 'Could not load asset /images/cakepop.jpg', stack: 'DOMException: Failed to load image' },
  { id: 'ERR-003', type: 'warning', title: 'Inventory Low', time: 'Yesterday', page: '/admin/inventory', message: 'Vanilla Cupcakes below threshold (2 left)', stack: null },
  { id: 'ERR-004', type: 'info', title: 'User Session Expired', time: 'Yesterday', page: '/profile', message: 'JWT token expired for user usr_123', stack: null }
]

const ErrorCard = ({ error }: { error: any }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div 
      layout
      className={`${styles.card} ${styles[error.type]}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={styles.cardHeader} onClick={() => setExpanded(!expanded)}>
        <div className={styles.iconWrapper}>
          {error.type === 'critical' && <Bug size={20} />}
          {error.type === 'error' && <AlertCircle size={20} />}
          {error.type === 'warning' && <AlertCircle size={20} />}
          {error.type === 'info' && <FileText size={20} />}
        </div>
        
        <div className={styles.cardMain}>
          <h4 className={styles.title}>{error.title}</h4>
          <div className={styles.meta}>
            <span className={styles.metaItem}><Clock size={12} /> {error.time}</span>
            <span className={styles.metaItem}>Page: {error.page}</span>
          </div>
        </div>
        
        <div className={styles.badge}>{error.type}</div>
        
        <button className={styles.expandBtn}>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.expandedContent}
          >
            <div className={styles.messageBox}>
              <strong>Message:</strong> {error.message}
            </div>
            
            {error.stack && (
              <div className={styles.stackTrace}>
                <code>{error.stack}</code>
              </div>
            )}
            
            <div className={styles.actions}>
              <button className={styles.actionBtn}><Copy size={16} /> Copy Log</button>
              <button className={styles.actionBtn}><RefreshCw size={16} /> Retry</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const ErrorTrackingPanel = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Bakery Health</h1>
        <p className={styles.subheading}>Premium Error Tracking Dashboard</p>
      </header>
      
      <div className={styles.timeline}>
        {MOCK_ERRORS.map((error, idx) => (
          <div key={error.id} className={styles.timelineItem}>
            <div className={styles.timelineLine} />
            <div className={styles.timelineDot} />
            <ErrorCard error={error} />
          </div>
        ))}
      </div>
    </div>
  )
}
