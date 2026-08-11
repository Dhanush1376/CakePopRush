import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState'
import { motion } from 'framer-motion'

export const ServerErrorPage = ({ error }: { error?: Error }) => {
  const navigate = useNavigate()

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
              message="Uh oh, something went wrong!&#10;We're fixing the ovens." 
              reaction="oops" 
            />
          </motion.div>
        }
        title="Our kitchen is having a little accident."
        description="We're experiencing some technical difficulties right now. We're already baking a fix!"
        error={error}
        primaryAction={{
          label: 'Try again',
          onClick: () => window.location.reload()
        }}
        secondaryAction={{
          label: 'Go Home',
          onClick: () => navigate('/')
        }}
      />
    </div>
  )
}
