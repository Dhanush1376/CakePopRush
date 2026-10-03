import React from 'react'
import styles from './Container.module.css'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  fluid?: boolean
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = '', children, fluid = false, ...props }, ref) => {
    const combinedClassName = [
      styles.container,
      fluid ? styles.fluid : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
