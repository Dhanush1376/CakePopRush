import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductImage } from '@/types/product'
import { useNavigate } from 'react-router-dom'
import { Flame, Leaf, Play, ArrowLeft, Share2, Heart, Maximize2 } from 'lucide-react'
import { ImageModal } from '@/components/ui/ImageModal'
import styles from './ProductGallery.module.css'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
  isBestseller?: boolean
  isEggless?: boolean
}

export const ProductGallery = ({
  images,
  productName,
  isBestseller,
  isEggless
}: ProductGalleryProps) => {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  // Fallback if no images
  if (!images || images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImageWrapper}>
          <div className={styles.placeholder}>No image available</div>
        </div>
      </div>
    )
  }

  const activeImage = images[activeIndex]

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setActiveIndex((prev) => {
      let next = prev + newDirection
      if (next < 0) next = images.length - 1
      if (next >= images.length) next = 0
      return next
    })
  }

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? '100%' : '-100%',
      }
    },
    center: {
      zIndex: 1,
      x: 0,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
      }
    }
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageWrapper}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={activeImage.id}
            src={activeImage.url}
            alt={activeImage.alt || productName}
            className={styles.mainImage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            whileHover={{ scale: 1.05 }}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              scale: { duration: 0.5, ease: "easeOut" }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            onClick={() => setModalOpen(true)}
            loading="eager"
          />
        </AnimatePresence>

        <button className={styles.expandButton} onClick={() => setModalOpen(true)} aria-label="View full screen">
          <Maximize2 size={20} />
        </button>

        {/* Top Action Bar */}
        <div className={styles.topActionBar}>
          <button className={styles.iconButton} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>

          <div className={styles.topActionRight}>
            <button className={styles.iconButton} aria-label="Share product">
              <Share2 size={18} />
            </button>
            <button className={styles.iconButton} aria-label="Add to favorites">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Center Pagination Dots */}
        {images.length > 1 && (
          <div className={styles.paginationDots}>
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`${styles.dot} ${idx === activeIndex ? styles.dotActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (idx !== activeIndex) {
                    setDirection(idx > activeIndex ? 1 : -1);
                    setActiveIndex(idx);
                  }
                }}
              />
            ))}
          </div>
        )}

      </div>

      {/* Styled Thumbnails */}
      {images.length > 1 && (
        <div className={styles.thumbnailSection}>
          <div className={styles.thumbnails}>
            {images.map((img, idx) => {
              const isVideo = img.url.endsWith('.mp4') || img.url.includes('video');
              return (
                <button
                  key={img.id}
                  className={`${styles.thumbnail} ${idx === activeIndex ? styles.thumbnailActive : ''}`}
                  onClick={() => {
                    if (idx !== activeIndex) {
                      setDirection(idx > activeIndex ? 1 : -1);
                      setActiveIndex(idx);
                    }
                  }}
                  aria-label={`View image ${idx + 1}`}
                  aria-current={idx === activeIndex}
                >
                  <img src={img.url} alt={img.alt || `${productName} thumbnail ${idx + 1}`} />
                  {isVideo && (
                    <div className={styles.videoOverlay}>
                      <div className={styles.playIconWrapper}>
                        <Play size={14} fill="currentColor" />
                      </div>
                      <span>Video</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <ImageModal
        isOpen={modalOpen}
        images={images.map(img => img.url)}
        initialIndex={activeIndex}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
