import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Clock, ArrowLeft, Mic, Camera, Trash2, Bell, SlidersHorizontal, Star, ChevronDown, ChevronRight, CheckCircle2, MapPin, Coins, Tag } from 'lucide-react'
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
import { MobileFilters } from './MobileFilters';
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState';
import { FrostingCorner } from '@/pages/storefront/custom-orders/components/FrostingCorner';

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

const POPULAR_SEARCHES = ['Cake Pops', 'Cookies', 'Brownies', 'Cupcakes', 'Macarons']

const escapeRegex = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <span>{text}</span>;
  const rawTokens = query.trim().split(/\s+/).filter((t) => t.length > 1);
  if (rawTokens.length === 0) return <span>{text}</span>;

  const pattern = rawTokens.map(escapeRegex).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        rawTokens.some(
          (t) =>
            part.toLowerCase() === t.toLowerCase() ||
            part.toLowerCase().startsWith(t.toLowerCase())
        ) ? (
          <span key={i} className={styles.highlightWord}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
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
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setIsInitialLoading(true);
    Promise.all([
      productData.getCategories(),
      productData.getBestSellingProducts(10),
      productData.getProducts()
    ]).then(([cats, bests, prods]) => {
      setCategories(cats || []);
      setBestSelling(bests || []);
      setAllProducts(prods || []);
      setIsInitialLoading(false);
    }).catch(() => {
      setIsInitialLoading(false);
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
    query,
    setQuery,
    isLoading,
    results,
    budgetShortcuts,
    didYouMean,
    matchedCategories,
    fallbackRecommendations,
    fallbackCategories,
    recentSearches,
    setRecentSearches,
    activeIndex,
    setActiveIndex,
    predictions,
    handleResultClick,
    handleSearchSubmit,
    handleBudgetClick,
    handleCategoryClick,
    handleDidYouMeanClick,
    removeRecent,
  } = useSearch(onClose, setIsFocused);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scrollY, setScrollY] = useState(0);
  const [isPushingMascot, setIsPushingMascot] = useState(false);
  const [pushPhrase, setPushPhrase] = useState('Slowly... stop pushing me!');

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop;
    setScrollY(currentY);
    if (currentY > 40) {
      setIsPushingMascot(true);
    } else {
      setIsPushingMascot(false);
    }
  };

  useEffect(() => {
    setSelectedCategory('all');
  }, [query]);

  const pillsToDisplay = React.useMemo(() => {
    if (matchedCategories && matchedCategories.length > 0) {
      return matchedCategories;
    }
    return categories.filter((c) => c.id !== 'all').slice(0, 6);
  }, [matchedCategories, categories]);

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
        setIsDropdownOpen(false)
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
    setIsDropdownOpen(false)
    inputRef.current?.focus()
  }

  const handlePredictionClick = (term: string) => {
    setQuery(term)
    setIsDropdownOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isDropdownOpen) {
        setIsDropdownOpen(false)
        return
      }
      setIsFocused(false)
      inputRef.current?.blur()
      if (isMobile && onClose) onClose()
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && predictions && predictions[activeIndex]) {
        handlePredictionClick(predictions[activeIndex])
      } else {
        setIsDropdownOpen(false)
        inputRef.current?.blur()
      }
      return
    }

    if (!predictions || !predictions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isDropdownOpen) setIsDropdownOpen(true)
      setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1))
    }
  }

  const renderBrowseContent = () => {
    const isQueryEmpty = query.trim().length === 0;
    let baseList = isQueryEmpty
      ? (selectedCategory !== 'all' && allProducts.length > 0 ? allProducts : bestSelling)
      : results;

    let displayResults = baseList;

    if (selectedCategory !== 'all') {
      displayResults = displayResults.filter(
        (p) =>
          p.categoryName?.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase() ||
          p.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categoryId === selectedCategory
      );
    }

    const isBrowseLoading = isLoading || isInitialLoading || (isQueryEmpty && bestSelling.length === 0);

    if (isBrowseLoading) {
      return (
        <div className={styles.resultsWrapper} role="status" aria-label="Loading sweet treats...">
          <div className={styles.resultsHeaderRow}>
            <div className={styles.skeletonBone} style={{ width: '130px', height: '16px', borderRadius: '6px' }} />
            <div className={styles.skeletonBone} style={{ width: '55px', height: '16px', borderRadius: '6px' }} />
          </div>
          <ul className={styles.newResultList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i}>
                <div className={styles.skeletonCard}>
                  <div className={`${styles.skeletonImage} ${styles.skeletonBone}`} />
                  <div className={styles.skeletonInfo}>
                    <div className={`${styles.skeletonTitle} ${styles.skeletonBone}`} style={{ width: i % 2 === 0 ? '70%' : '85%' }} />
                    <div className={`${styles.skeletonSubtitle} ${styles.skeletonBone}`} style={{ width: i % 2 === 0 ? '45%' : '58%' }} />
                    <div className={styles.skeletonTags}>
                      <div className={`${styles.skeletonTag} ${styles.skeletonBone}`} />
                    </div>
                  </div>
                  <div className={styles.skeletonRight}>
                    <div className={`${styles.skeletonArrow} ${styles.skeletonBone}`} />
                    <div className={styles.skeletonPriceCol}>
                      <div className={`${styles.skeletonPrice} ${styles.skeletonBone}`} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (displayResults.length === 0) {
      const fallbacks = fallbackRecommendations || bestSelling.slice(0, 4);
      const activeFallbackIndex = Math.min(
        fallbacks.length - 1,
        Math.max(0, Math.floor(scrollY / 115))
      );

      const currentCategoryObj = categories.find(
        (c) => c.id === selectedCategory || c.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
      const categoryDisplayName = currentCategoryObj?.name || selectedCategory;

      const otherCategories = categories.filter(
        (c) =>
          c.id !== 'all' &&
          c.id !== selectedCategory &&
          c.name?.toLowerCase() !== selectedCategory.toLowerCase()
      );

      const emptyHeading = selectedCategory !== 'all'
        ? `No sweet treats in\n"${categoryDisplayName}"`
        : (query.trim().length > 0
          ? `No sweet treats found\nfor "${query}"`
          : `No treats found\nin this section`);

      return (
        <div className={styles.noResults}>
          <div
            className={styles.mascotPushWrapper}
            style={{
              transform: isPushingMascot
                ? `translateY(-${Math.min(scrollY * 0.35, 36)}px) scaleY(0.92) scaleX(1.05)`
                : 'translateY(0px) scale(1)',
              transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <MascotEmptyState
              message={emptyHeading}
              reaction="sad"
              size="medium"
              overrideMessage={isPushingMascot ? pushPhrase : undefined}
              overrideReaction={isPushingMascot ? 'oops' : undefined}
            />
          </div>

          {otherCategories.length > 0 && (
            <div className={styles.tryCategoriesSection}>
              <div className={styles.tryCategoriesHeading}>TRY THESE CATEGORIES</div>
              <div className={styles.tryCategoriesRow}>
                {otherCategories.slice(0, 5).map((cat) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    className={styles.tryCategoryPill}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {fallbacks.length > 0 && (
            <div className={styles.fallbackSection}>
              <div className={styles.fallbackHeading}>POPULAR SWEET TREATS</div>
              <ul className={styles.newResultList} role="listbox">
                {fallbacks.map((product, index) => {
                  const variant = (['pink', 'yellow', 'turquoise'] as const)[index % 3];
                  return (
                    <motion.li key={product.id}>
                      <button
                        type="button"
                        className={styles.newResultCard}
                        onClick={() => handleResultClick(product)}
                      >
                        <FrostingCorner position="topRight" variant={variant} className={styles.cardFrosting} />
                        <div className={styles.cardImageWrapper}>
                          <img src={product.images[0]?.url} alt={product.name} />
                        </div>
                        <div className={styles.cardInfo}>
                          <h4 className={styles.cardTitle}>{product.name}</h4>
                          <div className={styles.cardTags}>
                            <span className={styles.tagPill}>{product.categoryName}</span>
                          </div>
                        </div>
                        <div className={styles.cardRight}>
                          <ChevronRight size={18} className={styles.cardArrow} />
                          <span className={styles.cardPrice}>₹{product.basePrice / 100}</span>
                        </div>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.resultsWrapper}>
        <div className={styles.discoveryGroupHeader}>
          <span className={styles.discoveryHeading}>
            <CakePopsIcon width={14} height={14} /> {isQueryEmpty ? 'Trending Treats' : 'Browse Treats'}
          </span>
          <span className={styles.resultsCount}>
            {displayResults.length} {displayResults.length === 1 ? 'treat' : 'treats'}
          </span>
        </div>
        <ul className={styles.newResultList} role="listbox">
          {displayResults.map((product, index) => {
            const variant = (['pink', 'yellow', 'turquoise'] as const)[index % 3];
            return (
              <motion.li key={product.id}>
                <button
                  type="button"
                  className={styles.newResultCard}
                  onClick={() => handleResultClick(product)}
                >
                  <FrostingCorner position="topRight" variant={variant} className={styles.cardFrosting} />
                  <div className={styles.cardImageWrapper}>
                    <img src={product.images[0]?.url} alt={product.name} />
                  </div>
                  <div className={styles.cardInfo}>
                    <h4 className={styles.cardTitle}>{product.name}</h4>
                    <div className={styles.cardTags}>
                      <span className={styles.tagPill}>{product.categoryName}</span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <ChevronRight size={18} className={styles.cardArrow} />
                    <span className={styles.cardPrice}>₹{product.basePrice / 100}</span>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Dedicated Floating Dropdown Content anchored directly to the search bar
  // Dedicated Clean Predictive Dropdown Content
  const renderDropdownContent = () => {
    if (!predictions || predictions.length === 0) {
      return (
        <div className={styles.noPredictionsBox}>
          <span className={styles.noPredictionsText}>No suggestions found</span>
        </div>
      );
    }

    return (
      <div className={styles.dropdownContentWrapper}>
        <div className={styles.dropdownSectionHeader}>
          <span>SUGGESTIONS</span>
        </div>
        <div className={styles.predictionsList} role="listbox">
          {predictions.map((term, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={term}
                type="button"
                role="option"
                aria-selected={isActive}
                className={styles.predictionRow}
                data-active={isActive}
                onClick={() => handlePredictionClick(term)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <Search size={14} className={styles.predictionIcon} />
                <span className={styles.predictionText}>
                  <HighlightText text={term} query={query} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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
            <div className={styles.searchBarAnchor}>
              <div className={styles.mobileSearchFieldWrapper}>
                <Search size={20} className={styles.searchIconLeft} />
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.searchInputRedesigned}
                  placeholder="Search for sweet treats..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setIsDropdownOpen(true)
                  }}
                  onFocus={() => {
                    if (query.trim().length > 0) setIsDropdownOpen(true)
                  }}
                  onKeyDown={handleKeyDown}
                  aria-label="Search products"
                />
                <div className={styles.actionWrapper}>
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

              {/* DEDICATED SEARCH DROPDOWN ANCHORED DIRECTLY FROM SEARCHBAR */}
              <AnimatePresence>
                {isDropdownOpen && query.trim().length > 0 && (
                  <motion.div
                    className={styles.searchDropdownCard}
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {renderDropdownContent()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.filterPillsScroll}>
              <button
                type="button"
                className={`${styles.filterPill} ${selectedCategory === 'all' ? styles.filterPillActive : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <Star size={14} fill="currentColor" /> All Results
              </button>
              {(isInitialLoading && categories.length === 0) ? (
                <>
                  <div className={`${styles.skeletonPill} ${styles.skeletonBone}`} style={{ width: '85px' }} />
                  <div className={`${styles.skeletonPill} ${styles.skeletonBone}`} style={{ width: '100px' }} />
                  <div className={`${styles.skeletonPill} ${styles.skeletonBone}`} style={{ width: '75px' }} />
                  <div className={`${styles.skeletonPill} ${styles.skeletonBone}`} style={{ width: '90px' }} />
                </>
              ) : (
                pillsToDisplay.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.filterPill} ${selectedCategory === cat.id ? styles.filterPillActive : ''}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                  >
                    {cat.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div
            className={styles.mobileContentRedesigned}
            onScroll={handleScroll}
            style={isDropdownOpen && query.trim().length > 0 ? { filter: 'blur(2px)', opacity: 0.4, pointerEvents: 'none', transition: 'all 0.2s' } : undefined}
          >
            {renderBrowseContent()}
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
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    onFocus={() => {
                      if (query.trim().length > 0) setIsDropdownOpen(true)
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <div className={styles.modalHeaderActions}>
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
                <div className={styles.modalBodyScroll} onScroll={handleScroll}>
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
                              onClick={() => handlePredictionClick(term)}
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
                                  handlePredictionClick(cat.name);
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
                  ) : isDropdownOpen ? (
                    renderDropdownContent()
                  ) : (
                    renderBrowseContent()
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
