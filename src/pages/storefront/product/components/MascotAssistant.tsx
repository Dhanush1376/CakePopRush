import React, { useRef, useEffect, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { MascotReaction } from '@/components/mascot/reactions/reactionTypes'
import styles from './MascotAssistant.module.css'

interface MascotAssistantProps {
  message: string | null
}

export const MascotAssistant = ({ message }: MascotAssistantProps) => {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.5 })
  const [reaction, setReaction] = useState<MascotReaction | null>(null)

  useEffect(() => {
    if (message) {
      setReaction('excited')
    } else if (isInView) {
      setReaction('winking')
      const timer = setTimeout(() => setReaction(null), 2500)
      return () => clearTimeout(timer)
    } else {
      setReaction(null)
    }
  }, [message, isInView])

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
      <div className={styles.mascotWrapper}>
        <CakePopMascot size="small" reaction={reaction} />
      </div>
    </div>
  )
}
