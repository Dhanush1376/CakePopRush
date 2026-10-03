import React from 'react'
import styles from './Badge.module.css'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'pink' | 'yellow' | 'turquoise' | 'neutral'
  count?: number
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'pink', count, children, ...props }, ref) => {
    const isCountMode = count !== undefined
    const displayValue = isCountMode ? (count > 99 ? '99+' : count) : children
    
    // Don't render empty count badges
    if (isCountMode && count === 0) return null

    const combinedClassName = [
      styles.badge,
      styles[variant],
      isCountMode ? styles.countMode : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <span ref={ref} className={combinedClassName} {...props}>
        {displayValue}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
