import React, { useState } from 'react'
import styles from './ShopPage.module.css'
import { Container } from '@/components/layout/Container'
import { ProductCard } from '@/components/commerce/ProductCard'
import { ShopHero } from './shop/ShopHero'
import { ShopCategories } from './shop/ShopCategories'
import { ShopToolbar } from './shop/ShopToolbar'
import { mockProducts, getProductsByCategory } from '@/mocks/products'
import { Pagination } from '@/components/ui/Pagination'
import { ProductCardSkeleton } from '@/components/commerce/ProductCardSkeleton'
import { EmptyWishlistIllustration } from '@/assets/illustrations/EmptyWishlistIllustration'
import { motion } from 'framer-motion'
import { useWishlist } from '@/lib/wishlistStore'
import { useSearchParams } from 'react-router-dom'

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [isDocked, setIsDocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Sync state if URL changes
  React.useEffect(() => {
    const cat = searchParams.get('category') || 'all'
    if (cat !== activeCategory) {
      setActiveCategory(cat)
    }
  }, [searchParams])

  // Sync URL if state changes
  React.useEffect(() => {
    if (activeCategory === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', activeCategory)
    }
    setSearchParams(searchParams, { replace: true })
  }, [activeCategory, setSearchParams])

  // Simulate network request on category change
  React.useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600) // 600ms fake loading
    return () => clearTimeout(timer)
  }, [activeCategory])

  React.useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolled down past 100px, hide
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderHidden(true);
      } 
      // If scrolled up, show
      else if (currentScrollY < lastScrollY) {
        setIsHeaderHidden(false);
      }

      lastScrollY = currentScrollY;

      // Check if sticky header is docked (only flatten when reaching absolute top)
      const stickyEl = document.getElementById('shop-sticky-header');
      if (stickyEl) {
        const rect = stickyEl.getBoundingClientRect();
        setIsDocked(rect.top <= 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = getProductsByCategory(activeCategory)

  return (
    <div className={styles.shopPage}>
      <ShopHero isHeaderHidden={isHeaderHidden} />
      
      <div 
        id="shop-sticky-header"
        className={`${styles.stickyHeader} ${isHeaderHidden ? styles.headerHidden : ''} ${isDocked ? styles.docked : ''}`}
      >
        <ShopCategories 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        <ShopToolbar 
          totalProducts={mockProducts.length}
          showingStart={filteredProducts.length > 0 ? 1 : 0}
          showingEnd={filteredProducts.length}
        />
      </div>

      {/* Product Grid */}
      <section className={styles.productSection}>
        <Container>
          <div className={styles.productGrid}>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isWishlisted={isInWishlist(product.id)}
                  onToggleWishlist={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id)
                    } else {
                      addToWishlist(product)
                    }
                  }}
                />
              ))
            )}
          </div>
          {!isLoading && filteredProducts.length === 0 && (
            <motion.div 
              className={styles.emptyState}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <EmptyWishlistIllustration className={styles.emptyIllustration} />
              <p className={styles.emptyText}>No products found in this category.</p>
            </motion.div>
          )}
          
          {!isLoading && filteredProducts.length > 0 && (
            <Pagination />
          )}
        </Container>
      </section>
    </div>
  )
}
