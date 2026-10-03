import React from 'react'
import styles from './IconButton.module.css'
import { Badge } from './Badge'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
  badgeCount?: number
  icon: React.ReactNode
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className = '',
      variant = 'ghost',
      size = 'md',
      badgeCount,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const combinedClassName = [
      styles.iconButton,
      styles[variant],
      styles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} className={combinedClassName} disabled={disabled} {...props}>
        <span className={styles.iconWrapper}>{icon}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className={styles.badgeWrapper}>
            <Badge count={badgeCount} variant="yellow" />
          </span>
        )}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
