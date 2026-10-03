import React, { useRef, useEffect } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator'
import styles from './MascotAssistant.module.css'

let hasMascotAppeared = false;

interface MascotAssistantProps {
  message: string | null
}

export const MascotAssistant = ({ message }: MascotAssistantProps) => {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.5 })
  const { currentReaction, triggerReaction, tapMascot } = useMascotOrchestrator()

  useEffect(() => {
    if (message) {
      triggerReaction('mascot:tapped', message) // fallback for direct messages
    } else if (isInView && !hasMascotAppeared) {
      hasMascotAppeared = true;
      triggerReaction('product:opened')
    }
  }, [message, isInView, triggerReaction])

  return (
    <div className={styles.container} ref={containerRef}>
      <AnimatePresence>
        {message && (
          <motion.div 
            className={styles.bubble}
            initial={{ opacity: 0, scale: 0.8, y: 10, x: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10, x: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.mascotWrapper} onClick={tapMascot}>
        <CakePopMascot size="small" reaction={currentReaction} />
      </div>
    </div>
  )
}
