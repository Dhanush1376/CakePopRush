import React, { useRef, useEffect, useState } from 'react'
import { Product } from '@/types/product'
import { Star, Clock, ShieldAlert, ThermometerSun, Leaf, HeartHandshake, Coffee, Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters/currency'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { MascotReaction } from '@/components/mascot/reactions/reactionTypes'
import { useInView, useMotionValue, useSpring } from 'framer-motion'
import styles from './ProductInfo.module.css'

interface ProductInfoProps {
  product: Product
  calculatedTotal: number
  mascotMessage?: string | null
}

export const ProductInfo = ({ product, calculatedTotal, mascotMessage }: ProductInfoProps) => {
  const mascotRef = useRef(null)
  const isInView = useInView(mascotRef, { amount: 0.5 })
  const [reaction, setReaction] = useState<MascotReaction | null>(null)
  
  const eyeTargetX = useMotionValue(0)
  const eyeTargetY = useMotionValue(0)
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 })
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 })

  useEffect(() => {
    const handlePointerEvent = (e: PointerEvent) => {
      if (!mascotRef.current) return
      
      const rect = (mascotRef.current as HTMLElement).getBoundingClientRect()
      const mascotOriginX = rect.left + rect.width / 2
      const mascotOriginY = rect.top + rect.height / 2
      
      const x = e.clientX - mascotOriginX
      const y = e.clientY - mascotOriginY
      
      // Calculate normalized target
      let targetX = (x / (window.innerWidth / 2)) * 12
      let targetY = (y / (window.innerHeight / 2)) * 8
      
      // Clamp to max radius
      const maxR = 8
      const dist = Math.sqrt(targetX * targetX + targetY * targetY)
      if (dist > maxR) {
        targetX = (targetX / dist) * maxR
        targetY = (targetY / dist) * maxR
      }
      
      eyeTargetX.set(targetX)
      eyeTargetY.set(targetY)
    }

    const handlePointerLeave = () => {
      eyeTargetX.set(0)
      eyeTargetY.set(0)
    }

    document.body.addEventListener('pointermove', handlePointerEvent)
    document.body.addEventListener('pointerdown', handlePointerEvent)
    document.body.addEventListener('pointerleave', handlePointerLeave)
    
    return () => {
      document.body.removeEventListener('pointermove', handlePointerEvent)
      document.body.removeEventListener('pointerdown', handlePointerEvent)
      document.body.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [eyeTargetX, eyeTargetY])

  const [activeBubble, setActiveBubble] = useState<string | null>(null)

  useEffect(() => {
    if (mascotMessage) {
      setReaction('blowKiss')
      setActiveBubble(mascotMessage)
    } else if (isInView) {
      const timeout1 = setTimeout(() => {
        setReaction('blowKiss')
      }, 500)
      
      const interval = setInterval(() => {
        setReaction(null)
        setTimeout(() => setReaction('blowKiss'), 50)
      }, 12000)

      return () => {
        clearTimeout(timeout1)
        clearInterval(interval)
      }
    } else {
      setReaction(null)
    }
  }, [mascotMessage, isInView])

  const triggerTapReaction = () => {
    const REACTION_LIST: { reaction: MascotReaction; speech: string }[] = [
      { reaction: 'excited', speech: 'Gimme gimme! 😋' },
      { reaction: 'laughing', speech: 'So sweet! 🍭' },
      { reaction: 'love', speech: 'Handcrafted with love! ❤️' },
      { reaction: 'silly', speech: 'Yummy in my tummy! 🤪' },
      { reaction: 'party', speech: 'Freshly baked daily! ✨' },
      { reaction: 'winking', speech: 'Best choice ever! 😉' }
    ]
    const nextItem = REACTION_LIST[Math.floor(Math.random() * REACTION_LIST.length)]
    setReaction(nextItem.reaction)
    setActiveBubble(nextItem.speech)
    setTimeout(() => {
      setActiveBubble(null)
      setReaction(null)
    }, 2800)
  }

  return (
    <div className={styles.container}>
      {/* Small Product Image */}
      {product.images && product.images.length > 0 && (
        <div className={styles.productIconWrapper}>
          <img src={product.images[0].url} alt={product.name} className={styles.productIcon} />
        </div>
      )}
      
      {/* Title & Price Row */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{product.name}</h1>
        <div className={styles.priceBlock}>
          <div className={styles.currentPrice}>{formatCurrency(calculatedTotal)}</div>
          <div className={styles.originalPriceRow}>
            <span className={styles.originalPrice}>{formatCurrency(calculatedTotal + 20000)}</span>
            <span className={styles.discountPill}>17% OFF</span>
          </div>
          <div className={styles.taxLabel}>Inclusive of all taxes</div>
        </div>
      </div>

      {/* Rating & Social Proof */}
      <div className={styles.ratingRow}>
        <div className={styles.rating}>
          <Star size={14} fill="currentColor" color="var(--color-warning)" />
          <span className={styles.ratingValue}>4.8</span>
          <span className={styles.ratingCount}>(126 reviews)</span>
        </div>
        <div className={styles.divider}>|</div>
        <div className={styles.socialProof}>
          200+ bought in last week
        </div>
      </div>


      {/* Description */}
      <p className={styles.description}>{product.description}</p>

      {/* Features & Mascot Row */}
      <div className={styles.featuresRow}>
        <div className={styles.featureList}>
          {/* Quality Features */}
          <div className={styles.featureItem}>
            <Coffee size={20} strokeWidth={1.5} />
            <span>Freshly Made<br/>After Order</span>
          </div>
          <div className={styles.featureItem}>
            <HeartHandshake size={20} strokeWidth={1.5} />
            <span>Handcrafted<br/>in Small Batches</span>
          </div>
          <div className={styles.featureItem}>
            <Leaf size={20} strokeWidth={1.5} />
            <span>Premium<br/>Ingredients</span>
          </div>
          
          {/* Freshness Features */}
          <div className={styles.featureItem}>
            <Clock size={20} strokeWidth={1.5} />
            <span>Preparation<br/>{product.preparationTime || '4-6 hours'}</span>
          </div>

          <div className={styles.featureItem}>
            <ThermometerSun size={20} strokeWidth={1.5} />
            <span>{product.storage ? product.storage.split('.')[0] : 'Refrigerate'}</span>
          </div>
        </div>
        
        {/* Embedded Mascot */}
        <div className={styles.mascotContainer} ref={mascotRef} onClick={triggerTapReaction}>
          {activeBubble && (
            <div className={styles.speechBubble}>
              <span>{activeBubble}</span>
            </div>
          )}
          <div className={styles.mascotClip}>
            <div className={styles.mascotWrapper}>
              <CakePopMascot size="small" reaction={reaction} eyeX={eyeSpringX} eyeY={eyeSpringY} />
            </div>
          </div>
          
          <div className={styles.mascotHandLeft} />
          <div className={styles.mascotHandRight} />
        </div>
      </div>
    </div>
  )
}
