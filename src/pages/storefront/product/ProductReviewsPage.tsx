import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BadgeCheck, Star } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { productData } from '@/features/products'
import { reviewData } from '@/features/reviews'
import { ImageModal } from '@/components/ui/ImageModal'
import styles from './ProductReviewsPage.module.css'

export function ProductReviewsPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const product = productData.getProducts().find(p => p.slug === id || p.id === id) || null
  
  useEffect(() => {
    if (product) {
      document.title = `${product.name} Reviews | CakePopRush`
    }
    window.scrollTo(0, 0)
  }, [product])

  if (!product) return null

  const reviews = reviewData.getReviewsByProductId(product.id)
  
  

  const reviewPhotos = reviews.filter(r => !!r.photoUrl).map(r => r.photoUrl!)

  return (
    <div className={styles.pageContainer}>
      <Container>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Reviews</h1>
            <span className={styles.productName}>for {product.name}</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.ratingGroup}>
              <span className={styles.ratingNumber}>
                {product.rating} <Star size={14} fill="currentColor" strokeWidth={0} />
              </span>
            </div>
            <span className={styles.count}>{product.reviewCount} reviews</span>
          </div>
        </div>

        <div className={styles.masonryGrid}>
          {reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(review.rating) ? styles.starFilled : styles.starEmpty}>
                    <Star size={14} fill="currentColor" strokeWidth={0} />
                  </span>
                ))}
              </div>
              <p className={styles.reviewText}>"{review.text}"</p>
              {review.photoUrl && (
                <div 
                  className={styles.reviewImageContainer}
                  onClick={() => {
                    const index = reviewPhotos.indexOf(review.photoUrl!)
                    setSelectedImageIndex(index)
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img src={review.photoUrl} alt="Customer photo" className={styles.reviewImage} loading="lazy" />
                </div>
              )}
              <div className={styles.reviewFooter}>
                <span className={styles.name}>{review.customerName}</span>
                {review.isVerified && <BadgeCheck size={12} className={styles.verifiedIcon} />}
              </div>
            </div>
          ))}
        </div>
      </Container>

      <ImageModal 
        isOpen={selectedImageIndex !== null} 
        images={reviewPhotos}
        initialIndex={selectedImageIndex || 0}
        onClose={() => setSelectedImageIndex(null)} 
      />
    </div>
  )
}
