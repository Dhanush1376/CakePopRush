import React from 'react'
import { Heart } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { motion } from 'framer-motion'

interface WishlistButtonProps {
  isActive?: boolean
  onClick?: (e?: React.MouseEvent) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const WishlistButton = ({ 
  isActive = false, 
  onClick, 
  className,
  size = 'md' 
}: WishlistButtonProps) => {
  return (
    <div className={className}>
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        animate={isActive ? { 
          scale: [1, 1.5, 0.9, 1.2, 1],
          rotate: [0, -15, 15, -15, 0] 
        } : { scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 400, damping: 15 }}
        style={{ borderRadius: '50%', display: 'inline-flex' }}
      >
        <IconButton
          icon={
            <Heart 
              fill={isActive ? 'var(--color-brand-pink)' : 'none'} 
              color={isActive ? 'var(--color-brand-pink)' : 'currentColor'}
            />
          }
          variant="ghost"
          size={size}
          onClick={onClick}
          aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isActive}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(4px)',
          }}
        />
      </motion.div>
    </div>
  )
}
