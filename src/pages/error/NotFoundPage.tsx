import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState'
import { motion } from 'framer-motion'

export const NotFoundPage = () => {
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
              message="404! Page not found.&#10;We lost this cake pop." 
              reaction="oops" 
            />
          </motion.div>
        }
        title="Page Not Found"
        description="Sorry, we couldn't find the page you were looking for. Please check the URL or return to the homepage."
        primaryAction={{
          label: 'Go to Homepage',
          onClick: () => navigate('/')
        }}
      />
    </div>
  )
}
