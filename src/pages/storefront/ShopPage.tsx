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
import { AnimatePresence } from 'framer-motion'
import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { getRandomThought } from '@/utils/mascotThoughts'
import { MascotReaction, MascotRef } from '@/components/mascot/reactions/reactionTypes'
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator'
import { ShopFilters } from '@/components/commerce/MobileFilters'

const PAGE_SIZE = 8;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [isDocked, setIsDocked] = useState(false)
  const [thoughtMessage, setThoughtMessage] = useState<string | null>(null);
  const thoughtTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { currentReaction, tapMascot, prefersReducedMotion } = useMascotOrchestrator()
  
  const [products, setProducts] = useState<Product[]>([])
  const [totalProductsCount, setTotalProductsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [shopFilters, setShopFilters] = useState<ShopFilters | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    productData.getProductsByCategory(activeCategory)
      .then((filtered) => {
        setProducts(filtered);
        // We do not set totalProductsCount here directly anymore, we will derive it from displayedProducts.
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeCategory]);

  const displayedProducts = React.useMemo(() => {
    let result = [...products];

    if (shopFilters) {
      // Category filter (from MobileFilters)
      if (shopFilters.categories.length > 0 && !shopFilters.categories.includes('all')) {
        result = result.filter(p => shopFilters.categories.includes(p.categoryName.toLowerCase().replace(' ', '-')));
      }

      // Max price filter
      if (shopFilters.maxPrice) {
        result = result.filter(p => {
          return p.basePrice <= shopFilters.maxPrice!;
        });
      }

      // Occasion filter (mock - assuming we map it if available, else ignored)
      // For a mock, we might just filter arbitrarily or if the seed has occasion
      // In this demo, we'll skip strict occasion filtering unless the product has an occasion tag.

      // Sorting
      if (shopFilters.sort === 'price_asc') {
        result.sort((a, b) => {
          return a.basePrice - b.basePrice;
        });
      } else if (shopFilters.sort === 'price_desc') {
        result.sort((a, b) => {
          return b.basePrice - a.basePrice;
        });
      } else if (shopFilters.sort === 'recommended') {
        // Assume bestsellers/new are recommended
        result.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
      }
    }

    return result;
  }, [products, shopFilters]);

  // Pagination disabled: show all products at once
  // const totalPages = Math.ceil(displayedProducts.length / PAGE_SIZE);
  // const paginatedProducts = displayedProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 on filter or category change
  useEffect(() => {
    setCurrentPage(1);
  }, [shopFilters, activeCategory]);

  const handleApplyFilters = (filters: ShopFilters) => {
    setShopFilters(filters);
  };

  const handleResetFilters = () => {
    setShopFilters(undefined);
  };

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

    const formattedName = catId === 'all' ? 'sweets' : catId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const thought = getRandomThought(formattedName);
    
    setThoughtMessage(thought.text);
    if (mascotControlRef.current) {
      mascotControlRef.current.play(thought.reaction);
    }

    if (thoughtTimeoutRef.current) {
      clearTimeout(thoughtTimeoutRef.current);
    }
    
    thoughtTimeoutRef.current = setTimeout(() => {
      setThoughtMessage(null);
    }, 6000);
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
            reaction={currentReaction || 'happy'}
            speedMultiplier={prefersReducedMotion ? 1 : 2}
          />
        </div>
        
        <div className={styles.thoughtBubbleWrapper}>
          <AnimatePresence>
            {thoughtMessage && (
              <motion.div 
                className={styles.thoughtBubble}
                initial={{ opacity: 0, scale: 0.8, y: 10, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {thoughtMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ShopCategories 
          activeCategory={activeCategory} 
          onSelectCategory={handleSelectCategory} 
          onScrollChange={(percentage) => {
            eyeTargetX.set((percentage - 0.5) * 16);
            eyeTargetY.set(6);
          }}
        />
        
        <ShopToolbar 
          totalProducts={products.length} 
          showingStart={displayedProducts.length > 0 ? 1 : 0}
          showingEnd={displayedProducts.length}
          initialFilters={shopFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          resultCount={displayedProducts.length}
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
            ) : displayedProducts.length > 0 ? (
              displayedProducts.map(product => (
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
          {!isLoading && displayedProducts.length === 0 && (
            <motion.div 
              className={styles.emptyState}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <EmptyWishlistIllustration className={styles.emptyIllustration} />
              <p className={styles.emptyText}>No products found matching your filters.</p>
              {shopFilters && (
                <button 
                  className={styles.resetBtn} 
                  onClick={handleResetFilters}
                  style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'white' }}
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
          
          {/* Pagination disabled as per request */}
          {/* {!isLoading && displayedProducts.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )} */}
        </Container>
      </section>
    </div>
  )
}
