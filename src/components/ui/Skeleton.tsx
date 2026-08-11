import React from 'react'
import styles from './Skeleton.module.css'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
}

export const Skeleton = ({
  className = '',
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps) => {
  const combinedClassName = [
    styles.skeleton,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inlineStyles = {
    ...style,
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  }

  return (
    <div
      className={combinedClassName}
      style={inlineStyles}
      aria-hidden="true"
      {...props}
    />
  )
}
