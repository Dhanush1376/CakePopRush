import React, { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import styles from './ShopPage.module.css'
import { Container } from '@/components/layout/Container'
import { ProductCard } from '@/components/commerce/ProductCard'
import { ShopHero } from './shop/ShopHero'
import { ShopCategories } from './shop/ShopCategories'
import { ShopToolbar } from './shop/ShopToolbar'
import { productData } from '@/features/products'
import { Pagination } from '@/components/ui/Pagination'
import { ProductCardSkeleton } from '@/components/commerce/ProductCardSkeleton'
import { EmptyWishlistIllustration } from '@/assets/illustrations/EmptyWishlistIllustration'
import { motion } from 'framer-motion'
import { useWishlist } from '@/features/wishlist'
import { useSearchParams } from 'react-router-dom'
import { useMotionValue, useSpring } from 'framer-motion'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { MascotReaction, MascotRef } from '@/components/mascot/reactions/reactionTypes'
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator'

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [isDocked, setIsDocked] = useState(false)
  
  const { currentReaction, tapMascot, prefersReducedMotion } = useMascotOrchestrator()
  
  const [products, setProducts] = useState<Product[]>([])
  const [totalProductsCount, setTotalProductsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      productData.getProductsByCategory(activeCategory),
      productData.getProducts()
    ]).then(([filtered, all]) => {
      setProducts(filtered);
      setTotalProductsCount(all.length);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [activeCategory]);

  const mascotRef = React.useRef<HTMLDivElement>(null);
  const mascotControlRef = React.useRef<MascotRef>(null);
  
  const eyeTargetX = useMotionValue(0);
  const eyeTargetY = useMotionValue(0);
  const eyeSpringX = useSpring(eyeTargetX, { stiffness: 200, damping: 25 });
  const eyeSpringY = useSpring(eyeTargetY, { stiffness: 200, damping: 25 });

  React.useEffect(() => {
    const handlePointerEvent = (e: PointerEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const x = e.clientX - mascotCenterX;
      const y = e.clientY - mascotCenterY;

      let targetX = (x / 200) * 8;
      let targetY = (y / 200) * 8;

      const maxR = 8;
      const dist = Math.sqrt(targetX * targetX + targetY * targetY);
      if (dist > maxR) {
        targetX = (targetX / dist) * maxR;
        targetY = (targetY / dist) * maxR;
      }

      eyeTargetX.set(targetX);
      eyeTargetY.set(targetY);
    };

    document.body.addEventListener('pointermove', handlePointerEvent);
    document.body.addEventListener('pointerdown', handlePointerEvent);
    return () => {
      document.body.removeEventListener('pointermove', handlePointerEvent);
      document.body.removeEventListener('pointerdown', handlePointerEvent);
    };
  }, [eyeTargetX, eyeTargetY]);

  const handleMascotClick = () => {
    tapMascot();
  };

  // Smooth scroll to categories section past hero
  const scrollToCategories = React.useCallback(() => {
    setTimeout(() => {
      const targetEl = document.getElementById('shop-sticky-header')
      if (targetEl) {
        const isDesktop = window.innerWidth >= 1024;
        const navHeight = isDesktop ? 80 : 64;
        const mascotHeight = 84;
        const breathingRoom = 16; // Add a little gap below navbar
        const headerOffset = navHeight + mascotHeight + breathingRoom;
        
        const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        })
      }
    }, 100)
  }, [])

  // Sync state if URL changes and auto-scroll to categories
  React.useEffect(() => {
    const cat = searchParams.get('category') || 'all'
    if (cat !== activeCategory) {
      setActiveCategory(cat)
    }
    if (searchParams.has('category')) {
      scrollToCategories()
    }
  }, [searchParams, scrollToCategories])

  // Sync URL if state changes
  React.useEffect(() => {
    if (activeCategory === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', activeCategory)
    }
    setSearchParams(searchParams, { replace: true })
  }, [activeCategory, setSearchParams])

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId)
    scrollToCategories()
  }

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
        setIsDocked(rect.top <= 85);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className={styles.shopPage}>
      <ShopHero />
      
      <div 
        id="shop-sticky-header"
        className={`${styles.stickyHeader} ${isHeaderHidden ? styles.headerHidden : ''} ${isDocked ? styles.docked : ''}`}
      >
        <div className={styles.mascotStickyContainer} onClick={handleMascotClick} ref={mascotRef}>
          <div className={styles.mascotHandLeft} />
          <div className={styles.mascotHandRight} />
          <CakePopMascot
            ref={mascotControlRef}
            size="small"
            hideArms={true}
            eyeX={eyeSpringX}
            eyeY={eyeSpringY}
            reaction={currentReaction}
            speedMultiplier={prefersReducedMotion ? 1 : 2}
          />
        </div>

        <ShopCategories 
          activeCategory={activeCategory} 
          onSelectCategory={handleSelectCategory} 
        />
        
        <ShopToolbar 
          totalProducts={totalProductsCount}
          showingStart={products.length > 0 ? 1 : 0}
          showingEnd={products.length}
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
            ) : products.length > 0 ? (
              products.map(product => (
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
            ) : null}
          </div>
          {!isLoading && products.length === 0 && (
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
          
          {!isLoading && products.length > 0 && (
            <Pagination />
          )}
        </Container>
      </section>
    </div>
  )
}
