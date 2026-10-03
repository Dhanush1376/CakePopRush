import React, { useState } from 'react'
import styles from './ProductImage.module.css'
import { Skeleton } from '../ui/Skeleton'
import { CakeSlice } from 'lucide-react'

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  aspectRatio?: 'square' | 'portrait' | 'landscape'
  priority?: boolean // If true, eager loads (for LCP)
}

export const ProductImage = ({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
  priority = false,
  ...props
}: ProductImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => setIsLoaded(true)
  const handleError = () => {
    setIsLoaded(true) // Stop showing skeleton
    setHasError(true)
  }

  const containerClassName = [
    styles.container,
    styles[aspectRatio],
    className,
  ].join(' ')

  return (
    <div className={containerClassName}>
      {!isLoaded && !hasError && (
        <Skeleton variant="rectangular" className={styles.skeleton} />
      )}
      
      {hasError ? (
        <div className={styles.fallbackContainer}>
          <CakeSlice size={48} className={styles.fallbackIcon} />
          <span className={styles.fallbackText}>Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  )
}
