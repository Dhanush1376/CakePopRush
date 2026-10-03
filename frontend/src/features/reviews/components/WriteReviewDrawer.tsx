import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Star, Camera } from 'lucide-react'
import styles from './WriteReviewDrawer.module.css'

interface WriteReviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, review: string) => void
}

export const WriteReviewDrawer = ({ isOpen, onClose, onSubmit }: WriteReviewDrawerProps) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Reset form on close
      setTimeout(() => {
        setRating(0)
        setHoverRating(0)
        setReview('')
      }, 300)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review)
    }
  }

  return createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Write a Review">
        <div className={styles.header}>
          <h3>Write a Review</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close review form">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.ratingSection}>
            <span className={styles.ratingLabel}>Tap to Rate</span>
            <div className={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={styles.starBtn}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star 
                    size={36} 
                    fill="currentColor"
                    strokeWidth={1}
                    className={(hoverRating || rating) >= star ? styles.starFilled : styles.starEmpty} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputSection}>
            <textarea
              className={styles.textarea}
              placeholder="Tell us what you loved about it..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <div className={styles.imageUploadSection}>
            <label className={styles.uploadLabel}>Add Photos</label>
            <div className={styles.uploadBox}>
              <Camera size={24} strokeWidth={1.5} />
              <span>Upload pictures</span>
            </div>
          </div>

          <div className={styles.footerActions}>
            <button 
              className={styles.submitBtn} 
              disabled={rating === 0}
              onClick={handleSubmit}
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
