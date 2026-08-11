import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, BadgeCheck, Star, ArrowLeft } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { mockProducts } from '@/mocks/products'
import { mockReviews } from '@/mocks/reviews'
import { Product } from '@/types/product'
import { ImageModal } from '@/components/ui/ImageModal'
import styles from './ProductReviewsPage.module.css'

export function ProductReviewsPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  
  useEffect(() => {
    const found = mockProducts.find(p => p.slug === id || p.id === id)
    if (found) {
      setProduct(found)
      document.title = `${found.name} Reviews | CakePopRush`
    }
    window.scrollTo(0, 0)
  }, [id])

  if (!product) return null

  const reviews = mockReviews.filter(r => r.productId === product.id)
  
  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.floor(r.rating) === stars).length
    return { stars, count, percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0 }
  })

  const reviewPhotos = reviews.filter(r => !!r.photoUrl).map(r => r.photoUrl!)

  return (
    <div className={styles.pageContainer}>
      <Container>
        <Link to={`/product/${product?.slug || ''}`} className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Product
        </Link>
        
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Reviews</h1>
            <div className={styles.ratingGroup}>
              <span className={styles.ratingNumber}>{product.rating}</span>
              <span className={styles.starFilled}><Star size={16} fill="currentColor" strokeWidth={0} /></span>
            </div>
          </div>
          <div className={styles.subtitleRow}>
            <span className={styles.productName}>for {product.name}</span>
            <span className={styles.dot}>•</span>
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
