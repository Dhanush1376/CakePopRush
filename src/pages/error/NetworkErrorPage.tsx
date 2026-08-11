import React from 'react'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState'
import { motion } from 'framer-motion'

export const NetworkErrorPage = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: 'var(--space-4)' }}>
      <ErrorCard 
        icon={
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ margin: '0 auto', marginBottom: '20px' }}
          >
            <MascotEmptyState 
              message="No internet connection!&#10;Please check your wifi." 
              reaction="confused" 
            />
          </motion.div>
        }
        title="Network connection lost."
        description="We couldn't deliver this request. Please check your connection and try again."
        primaryAction={{
          label: 'Retry Connection',
          onClick: onRetry || (() => window.location.reload())
        }}
      />
    </div>
  )
}
