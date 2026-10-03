import React, { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Link } from 'react-router-dom'
import { Review } from '@/types/review'
import { BadgeCheck, ArrowRight, Star, PencilLine } from 'lucide-react'
import { ImageModal } from '@/components/ui/ImageModal'
import { WriteReviewDrawer } from './WriteReviewDrawer'
import styles from './ReviewsSection.module.css'

interface ReviewsSectionProps {
  rating?: number
  reviewCount?: number
  reviews: Review[]
  productSlug: string
}

export const ReviewsSection = ({ rating, reviewCount, reviews, productSlug }: ReviewsSectionProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false)

  const hasReviews = reviews && reviews.length > 0;
  const reviewPhotos = hasReviews ? reviews.filter(r => !!r.photoUrl).map(r => r.photoUrl!) : []

  const handleReviewSubmit = (submittedRating: number, reviewText: string) => {
    // Mock submission handling
    setIsWriteReviewOpen(false)
    // Could add a toast notification here
  }

  return (
    <div id="reviews" className={styles.section}>
      <Container>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              <h2 className={styles.title}>Customer Reviews</h2>
            </div>
            {hasReviews && (
              <div className={styles.summaryInfo}>
                <span className={styles.ratingNumber}>{rating} <Star size={14} fill="currentColor" strokeWidth={0} /></span>
                <span className={styles.count}>{reviewCount} reviews</span>
              </div>
            )}
          </div>
          <div className={styles.headerRight}>
            <button 
              className={styles.writeReviewBtn} 
              onClick={() => setIsWriteReviewOpen(true)}
              aria-label="Write a review"
            >
              <PencilLine size={20} strokeWidth={2} />
            </button>
            {hasReviews && (
              <Link to={`/product/${productSlug}/reviews`} className={styles.seeAllBtn}>
                See all <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {hasReviews ? (
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
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Star size={32} fill="currentColor" strokeWidth={0} />
            </div>
            <h3 className={styles.emptyStateTitle}>No reviews yet</h3>
            <p className={styles.emptyStateText}>
              Be the first to share your experience with this product! Your feedback helps others make great choices.
            </p>
            <button 
              className={styles.emptyStateBtn}
              onClick={() => setIsWriteReviewOpen(true)}
            >
              <PencilLine size={16} />
              Write the First Review
            </button>
          </div>
        )}
      </Container>

      <ImageModal 
        isOpen={selectedImageIndex !== null} 
        images={reviewPhotos}
        initialIndex={selectedImageIndex || 0}
        onClose={() => setSelectedImageIndex(null)} 
      />

      <WriteReviewDrawer
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  )
}
