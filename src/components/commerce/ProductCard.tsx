import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Heart, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ProductCard.module.css'
import { ProductImage } from './ProductImage'
import { Price } from './Price'
import { WishlistButton } from './WishlistButton'
import { Button } from '../ui/Button'
import { Product } from '@/types/product'
import { useCart } from '@/lib/cartStore'
import { useToast } from '@/components/ui/ToastContext'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onToggleWishlist?: (productId: string) => void
  isWishlisted?: boolean
}

export const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Use store directly for immediate functionality
    addItem({ product, quantity: 1 })
    toast({
      type: 'success',
      title: 'Added to bag'
    })
    
    if (onAddToCart) onAddToCart(product.id)
  }

  const handleToggleWishlist = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!isWishlisted) {
      window.dispatchEvent(new Event('show-global-heart'))
    }
    
    if (onToggleWishlist) onToggleWishlist(product.id)
  }

  const actualCompareAtPrice = product.compareAtPrice || Math.round(product.basePrice * 1.25)
  const hasDiscount = actualCompareAtPrice > product.basePrice
  const discountPercentage = hasDiscount 
    ? Math.round(((actualCompareAtPrice - product.basePrice) / actualCompareAtPrice) * 100)
    : 0

  return (
    <Link 
      to={`/product/${product.slug}`}
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <ProductImage 
          src={product.images[0]?.url || ''} 
          alt={product.images[0]?.alt || product.name} 
          aspectRatio="portrait"
        />
        
        {/* Wishlist Button overlaid on image */}
        <div className={styles.wishlistWrapper}>
          <WishlistButton 
            isActive={isWishlisted} 
            onClick={handleToggleWishlist} 
            size="sm"
          />
        </div>
        
        {/* Badges container - Circular overlapping text badges */}
        <div className={styles.badgesContainer}>
          {hasDiscount && (
            <div className={`${styles.scallopedBadge} ${styles.badgeYellow}`} title={`${discountPercentage}% Off`}>
              <span>{discountPercentage}%</span>
              <span>OFF</span>
            </div>
          )}
          {product.isBestSeller && (
            <div className={`${styles.scallopedBadge} ${styles.badgePink}`} title="Best Seller">
              <span>BEST</span>
              <span>SELLER</span>
            </div>
          )}
          {product.isCustomizable && (
            <div className={`${styles.scallopedBadge} ${styles.badgeWhite}`} title="Customizable">
              <span>CUST...</span>
            </div>
          )}
        </div>
        
        {/* Quick Add button visible on hover for desktop */}
        <div className={`${styles.quickAdd} ${isHovered ? styles.quickAddVisible : ''}`}>
          <Button 
            variant="primary" 
            size="sm" 
            fullWidth 
            onClick={handleAddToCart}
            leftIcon={<Plus size={16} />}
          >
            Add to Bag
          </Button>
        </div>
        {/* Add button overlaid on the bottom right of the image */}
        <button 
          className={styles.mobileAddButton} 
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to bag`}
        >
          <Plus size={18} />
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.category}>{product.categoryName}</p>
          {product.rating > 0 && (
            <div className={styles.ratingContainer}>
              <span className={styles.star}><Star size={12} fill="currentColor" strokeWidth={0} /></span>
              <span className={styles.rating}>{product.rating}</span>
              <span className={styles.reviews}>({product.reviewCount})</span>
            </div>
          )}
        </div>
        <h3 className={styles.title}>{product.name}</h3>
        
        <div className={styles.footer}>
          <Price 
            amount={product.basePrice} 
            compareAtAmount={product.compareAtPrice || Math.round(product.basePrice * 1.25)} 
            size="md"
          />
        </div>
      </div>
    </Link>
  )
}
