import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BadgeCheck, Star } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { productData } from '@/features/products'
import { reviewData } from '@/features/reviews'
import { ImageModal } from '@/components/ui/ImageModal'
import { Product } from '@/types/product'
import { Review } from '@/types/review'
import styles from './ProductReviewsPage.module.css'

export function ProductReviewsPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!id) return;
    setProduct(null);
    setReviews([]);
    productData.getProducts().then(products => {
      const found = products.find(p => p.slug === id || p.id === id);
      if (found) {
        setProduct(found);
        document.title = `${found.name} Reviews | CakePopRush`;
        reviewData.getReviewsByProductId(found.id).then(setReviews).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load reviews:', err);
      setIsLoading(false);
    });
    window.scrollTo(0, 0)
  }, [id])

  if (isLoading) {
    return (
      <div className={styles.pageContainer} role="status" aria-label="Loading reviews...">
        <Container>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div style={{ width: '180px', height: '32px', borderRadius: '8px', background: 'var(--color-surface-hover)', animation: 'pulse 1.4s infinite' }} />
              <div style={{ width: '120px', height: '16px', borderRadius: '4px', background: 'var(--color-surface-hover)', animation: 'pulse 1.4s infinite', marginTop: '6px' }} />
            </div>
            <div className={styles.headerRight}>
              <div style={{ width: '80px', height: '28px', borderRadius: '16px', background: 'var(--color-surface-hover)', animation: 'pulse 1.4s infinite' }} />
            </div>
          </div>
          <div className={styles.masonryGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={styles.reviewCard} style={{ minHeight: '130px' }}>
                <div style={{ width: '100px', height: '16px', borderRadius: '4px', background: 'var(--color-surface-hover)', animation: 'pulse 1.4s infinite' }} />
                <div style={{ width: '90%', height: '14px', borderRadius: '4px', background: 'var(--color-surface-hover)', animation: 'pulse 1.4s infinite', marginTop: '12px' }} />
                <div style={{ width: '70%', height: '14px', borderRadius: '4px', background: 'var(--color-surface-hover)', animation: 'pulse 1.4s infinite', marginTop: '8px' }} />
                <div style={{ width: '40%', height: '12px', borderRadius: '4px', background: 'var(--color-surface-hover)', animation: 'pulse 1.4s infinite', marginTop: '16px' }} />
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (!product) return null

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
