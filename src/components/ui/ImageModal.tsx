import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ImageModal.module.css'

interface ImageModalProps {
  isOpen: boolean
  images: string[]
  initialIndex?: number
  onClose: () => void
}

import { createPortal } from 'react-dom'

export function ImageModal({ isOpen, images, initialIndex = 0, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  // Reset index when opened with a new initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0
      }
    }
  }

  if (!isOpen || images.length === 0) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topBar}>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close image">
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.imageWrapper}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.img 
              key={currentIndex} 
              src={images[currentIndex]} 
              alt="Full size" 
              className={styles.image}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag={images.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  handleNext();
                } else if (swipe > swipeConfidenceThreshold) {
                  handlePrev();
                }
              }}
            />
          </AnimatePresence>
        </div>
        
        {images.length > 1 && (
          <div className={styles.thumbnailSection}>
            <hr className={styles.divider} />
            <div className={styles.thumbnailStrip}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnailBtn} ${idx === currentIndex ? styles.thumbnailActive : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (idx !== currentIndex) {
                      setDirection(idx > currentIndex ? 1 : -1)
                      setCurrentIndex(idx)
                    }
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  , document.body)
}
