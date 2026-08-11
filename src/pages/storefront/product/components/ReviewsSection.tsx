import React, { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Link } from 'react-router-dom'
import { Review } from '../types/pdpTypes'
import { BadgeCheck, ArrowRight, Star } from 'lucide-react'
import { ImageModal } from '@/components/ui/ImageModal'
import styles from './ReviewsSection.module.css'

interface ReviewsSectionProps {
  rating?: number
  reviewCount?: number
  reviews: Review[]
  productSlug: string
}

export const ReviewsSection = ({ rating, reviewCount, reviews, productSlug }: ReviewsSectionProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  if (!rating || !reviewCount || reviews.length === 0) return null

  const reviewPhotos = reviews.filter(r => !!r.photoUrl).map(r => r.photoUrl!)

  return (
    <div id="reviews" className={styles.section}>
      <Container>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Customer Reviews</h2>
            <div className={styles.summaryInfo}>
              <span className={styles.ratingNumber}>{rating} <Star size={14} fill="currentColor" strokeWidth={0} /></span>
              <span className={styles.count}>{reviewCount} reviews</span>
            </div>
          </div>
          <Link to={`/product/${productSlug}/reviews`} className={styles.seeAllBtn}>
            See all <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.horizontalScroll}>
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
