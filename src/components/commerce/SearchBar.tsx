import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2, ArrowRight, Clock, ArrowLeft, Mic, Camera, Trash2, Bell, SlidersHorizontal, Star, ChevronDown, ChevronRight, CheckCircle2, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { productData } from '@/features/products'
import { useSearch } from '@/features/search/useSearch'
import {
  AllItemsIcon,
  BirthdayCakesIcon,
  CakePopsIcon,
  CupcakesIcon,
  CookiesIcon,
  CakesiclesIcon,
  BrowniesIcon,
  MacaronsIcon,
  TrufflesIcon,
  CakeJarsIcon,
  GiftBoxesIcon
} from '@/components/icons/DessertIcons'
import { Button } from '../ui/Button'
import styles from './SearchBar.module.css'
import { createPortal } from 'react-dom'
import { FrostingCorner } from '@/pages/storefront/custom-orders/components/FrostingCorner';
import { MobileFilters } from './MobileFilters';

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'all': return <AllItemsIcon width={32} height={32} />
    case 'cake-pops': return <CakePopsIcon width={32} height={32} />
    case 'cakesicles': return <CakesiclesIcon width={32} height={32} />
    case 'cookies': return <CookiesIcon width={32} height={32} />
    case 'brownies': return <BrowniesIcon width={32} height={32} />
    case 'cupcakes': return <CupcakesIcon width={32} height={32} />
    case 'macarons': return <MacaronsIcon width={32} height={32} />
    case 'truffles': return <TrufflesIcon width={32} height={32} />
    case 'desserts': return <TrufflesIcon width={32} height={32} />
    case 'cakes':
    case 'birthday-cakes': return <BirthdayCakesIcon width={32} height={32} />
    case 'cake-jars': return <CakeJarsIcon width={32} height={32} />
    case 'gift-boxes': return <GiftBoxesIcon width={32} height={32} />
    default: return null;
  }
}

interface SearchBarProps {
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

const POPULAR_SEARCHES = ['Cake Pops', 'Cookies', 'Cookie Dough', 'Truffles', 'Desserts']

const HighlightText = ({ text, query }: { text: string, query: string }) => {
  if (!query.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <span key={i} className={styles.highlightWord}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};


export const SearchBar = ({ isMobile: forcedMobile, isOpen = false, onClose }: SearchBarProps) => {
  const navigate = useNavigate()
  const [isFocused, setIsFocused] = useState(isOpen)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const [categories, setCategories] = useState<any[]>([]);
  const [bestSelling, setBestSelling] = useState<any[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      productData.getCategories(),
      productData.getBestSellingProducts(10)
    ]).then(([cats, bests]) => {
      setCategories(cats);
      setBestSelling(bests);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mobile layout only applies if screen width < 768px
  const isMobile = forcedMobile !== undefined ? (forcedMobile && windowWidth < 768) : windowWidth < 768

  useEffect(() => {
    if (isOpen) {
      setIsFocused(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsFocused(false)
    if (onClose) onClose()
  }

  const {
    query, setQuery, isLoading, results, recentSearches, setRecentSearches,
    activeIndex, setActiveIndex, handleResultClick, handleSearchSubmit, removeRecent
  } = useSearch(onClose, setIsFocused);

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus input automatically when opened
  useEffect(() => {
    if (isFocused && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isFocused])

  // Handle click outside to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    if (!isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile])

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
      if (isMobile && onClose) onClose()
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        handleResultClick(results[activeIndex])
      } else {
        handleSearchSubmit(query)
      }
      return
    }

    if (!results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > -1 ? prev - 1 : -1))
    }
  }

  const renderContent = () => {
    const isQueryEmpty = query.trim().length === 0;
    const displayResults = isQueryEmpty ? bestSelling : results;

    if (isLoading) {
      return null // Show loading icon in the input field instead of jumping content
    }

    if (displayResults.length === 0) {
      if (isQueryEmpty) return null;
      return (
        <div className={styles.noResults}>
          <h4 className={styles.noResultsTitle}>No treats found</h4>
          <p className={styles.noResultsText}>Try searching for something sweeter.</p>
          <Button variant="outline" onClick={() => handleSearchSubmit('')}>
            Browse All Treats
          </Button>
        </div>
      )
    }

    return (
      <div className={styles.resultsWrapper}>
        {isMobile && (
          <div className={styles.resultsHeaderRow}>
            <span className={styles.resultsCount}>{displayResults.length} {isQueryEmpty ? 'trending treats' : 'results found'}</span>
            <button className={styles.relevanceDropdown}>RELEVANCE <ChevronDown size={14} /></button>
          </div>
        )}
        {!isMobile && <div className={styles.sectionTitle}>{isQueryEmpty ? 'Trending Treats' : 'Search Results'}</div>}
        <ul className={styles.newResultList} role="listbox">
          {displayResults.map((product, index) => (
            <li key={product.id}>
              <button
                className={styles.newResultCard}
                data-active={index === activeIndex}
                onClick={() => handleResultClick(product)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <div className={styles.cardImageWrapper}>
                  {index === 0 && <div className={styles.bestsellerCheck}><CheckCircle2 size={12} /></div>}
                  <img src={product.images[0]?.url} alt={product.name} />
                </div>
                <div className={styles.cardInfo}>
                  <h4 className={styles.cardTitle}>
                    <HighlightText text={product.name} query={query} />
                  </h4>


                  <div className={styles.cardTags}>
                    {index === 0 && <span className={`${styles.tagPill} ${styles.tagBestseller}`}>BESTSELLER</span>}
                    <span className={styles.tagPill}>{product.categoryName}</span>

                  </div>
                </div>
                <div className={styles.cardRight}>
                  <ChevronRight size={18} className={styles.cardArrow} />
                  <div className={styles.priceWrapper}>
                    <span className={styles.strikedPrice}>₹{Math.round(product.basePrice * 1.2) / 100}</span>
                    <span className={styles.cardPrice}>₹{product.basePrice / 100}</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Global Cmd+K / Ctrl+K keyboard shortcut to open search modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsFocused(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (isMobile) {
    return createPortal(
      <AnimatePresence>
        <motion.div
          className={styles.mobileOverlay}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          role="search"
        >
          <div className={styles.mobileTopBar}>
            <h1 className={styles.mobileTitle}>Search</h1>
            <div className={styles.mobileTopRight}>
              <button className={styles.headerIconButton} onClick={onClose} aria-label="Close search">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className={styles.mobileSearchContainer}>
            <div className={styles.mobileSearchFieldWrapper}>
              <Search size={20} className={styles.searchIconLeft} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInputRedesigned}
                placeholder="Search for sweet treats..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search products"
              />
              <div className={styles.actionWrapper}>
                {isLoading && <Loader2 size={16} className={styles.loadingIcon} />}
                {query.length > 0 && !isLoading ? (
                  <button className={styles.clearButton} onClick={handleClear} aria-label="Clear search">
                    <X size={14} strokeWidth={2.5} />
                  </button>
                ) : null}
                <button className={styles.filterButton} aria-label="Filters" onClick={() => setIsFiltersOpen(true)}>
                  <SlidersHorizontal size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className={styles.filterPillsScroll}>
              <button className={`${styles.filterPill} ${styles.filterPillActive}`}>
                <Star size={14} fill="currentColor" /> All Results
              </button>
              <button className={styles.filterPill}>Cake Pops</button>
              <button className={styles.filterPill}>Cupcakes</button>
              <button className={styles.filterPill}>Macarons</button>
              <button className={styles.filterPill}>Cookies</button>
            </div>
          </div>

          <div className={styles.mobileContentRedesigned}>
            {renderContent()}
          </div>
          <MobileFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} categories={categories} />
        </motion.div>
      </AnimatePresence>,
      document.body
    )
  }

  // --- DESKTOP SPOTLIGHT MODAL RENDER ---
  return (
    <div className={styles.searchContainer} ref={containerRef} role="search">
      {/* Header Compact Trigger Bar */}
      <div
        className={styles.compactSearchTrigger}
        onClick={() => setIsFocused(true)}
      >
        <Search size={16} className={styles.triggerSearchIcon} />
        <span className={styles.triggerPlaceholder}>Search cake pops, cookies...</span>
        <span className={styles.cmdKBadge}>⌘K</span>
      </div>

      {/* Floating Desktop Search Modal */}
      {createPortal(
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className={styles.desktopModalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsFocused(false)}
            >
              <motion.div
                className={styles.desktopModalCard}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Input Bar */}
                <div className={styles.modalHeaderRow}>
                  <Search size={22} className={styles.modalSearchIcon} />
                  <input
                    ref={inputRef}
                    type="text"
                    className={styles.modalSearchInput}
                    placeholder="Search cake pops, cookies & more..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <div className={styles.modalHeaderActions}>
                    {isLoading && <Loader2 size={18} className={styles.loadingIcon} />}
                    {query.length > 0 && !isLoading ? (
                      <button className={styles.clearButton} onClick={handleClear} aria-label="Clear search">
                        <X size={16} />
                      </button>
                    ) : (
                      <>
                        <button className={styles.modalIconButton} title="Voice Search">
                          <Mic size={18} />
                        </button>
                        <button className={styles.modalIconButton} title="Visual Search">
                          <Camera size={18} />
                        </button>
                        <button className={styles.escBadge} onClick={() => setIsFocused(false)}>
                          ESC
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Modal Content Scroll Area */}
                <div className={styles.modalBodyScroll}>
                  {query.trim().length === 0 ? (
                    <>
                      {/* POPULAR SEARCHES */}
                      <div className={styles.popularSection}>
                        <div className={styles.popularTitleRow}>
                          <span className={styles.popularHeading}>POPULAR SEARCHES</span>
                        </div>
                        <div className={styles.popularChipsGrid}>
                          {POPULAR_SEARCHES.map((term) => (
                            <button
                              key={term}
                              className={styles.popularPillChip}
                              onClick={() => handleSearchSubmit(term)}
                            >
                              <Search size={14} />
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* DUAL COLUMN SECTION */}
                      <div className={styles.dualColumnGrid}>
                        {/* Left: Explore Collections */}
                        <div className={styles.columnLeft}>
                          <div className={styles.columnHeader}>
                            <span className={styles.columnTitle}>EXPLORE COLLECTIONS</span>
                          </div>
                          <div className={styles.collectionsList}>
                            {categories.slice(0, 5).map((cat: any) => (
                              <button
                                key={cat.id}
                                className={styles.collectionItemRow}
                                onClick={() => {
                                  navigate(cat.id === 'all' ? '/shop' : `/shop?category=${cat.id}`);
                                  setIsFocused(false);
                                }}
                              >
                                <div className={styles.collectionIconBox}>
                                  {getCategoryIcon(cat.id)}
                                </div>
                                <span className={styles.collectionName}>{cat.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Right: New Arrivals */}
                        <div className={styles.columnRight}>
                          <div className={styles.columnHeader}>
                            <span className={styles.columnTitle}>NEW ARRIVALS</span>
                          </div>
                          <div className={styles.trendingCardsList}>
                            {bestSelling.map((product: any) => (
                              <button
                                key={product.id}
                                className={styles.trendingCardRow}
                                onClick={() => {
                                  navigate(`/product/${product.slug}`);
                                  setIsFocused(false);
                                }}
                              >
                                <div className={styles.trendingThumbBox}>
                                  <span className={styles.newTag}>NEW</span>
                                  <img src={product.images[0]?.url} alt={product.name} />
                                </div>
                                <div className={styles.trendingCardDetails}>
                                  <span className={styles.trendingCardTitle}>{product.name}</span>
                                  <span className={styles.trendingCardPrice}>₹{product.basePrice / 100}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    renderContent()
                  )}
                </div>

                {/* Modal Footer Hotkeys */}
                <div className={styles.modalFooterBar}>
                  <span className={styles.footerHotkey}><kbd>↑↓</kbd> NAVIGATE</span>
                  <span className={styles.footerHotkey}><kbd>↵</kbd> SELECT</span>
                  <span className={styles.footerHotkey}><kbd>ESC</kbd> CLOSE</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
