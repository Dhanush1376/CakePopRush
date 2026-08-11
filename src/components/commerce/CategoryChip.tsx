import React from 'react'
import styles from './CategoryChip.module.css'

interface CategoryChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  isActive?: boolean
  icon?: React.ReactNode
}

export const CategoryChip = React.forwardRef<HTMLButtonElement, CategoryChipProps>(
  (
    {
      label,
      isActive = false,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const combinedClassName = [
      styles.chip,
      isActive ? styles.active : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={combinedClassName}
        aria-pressed={isActive}
        {...props}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{label}</span>
      </button>
    )
  }
)

CategoryChip.displayName = 'CategoryChip'
