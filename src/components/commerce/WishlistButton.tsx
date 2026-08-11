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
        animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
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
