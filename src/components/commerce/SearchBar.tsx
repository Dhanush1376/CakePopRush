import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2, ArrowRight, Clock, ArrowLeft, Mic, Camera, Trash2 } from 'lucide-react'
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

const getCategoryIcon = (id: string) => {
  switch(id) {
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


export const SearchBar = ({ isMobile: forcedMobile, isOpen = false, onClose }: SearchBarProps) => {
  const navigate = useNavigate()
  const [isFocused, setIsFocused] = useState(isOpen)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const [categories, setCategories] = useState<any[]>([]);
  const [bestSelling, setBestSelling] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      productData.getCategories(),
      productData.getBestSellingProducts(3)
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
    if (query.trim().length === 0) {
      return (
        <>
          {recentSearches.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderTitle}>
                  Recent Searches
                </div>
                <button className={styles.clearAllBtn} onClick={() => setRecentSearches([])}>
                  Clear all <Trash2 size={14} />
                </button>
              </div>
              <ul className={styles.recentList}>
                {recentSearches.map(term => (
                  <li key={term}>
                    <button className={styles.recentRow} onClick={() => handleSearchSubmit(term)}>
                      <div className={styles.recentIconCircle}>
                        <Clock size={16} />
                      </div>
                      <span className={styles.recentText}>{term}</span>
                      <div className={styles.removeRecent} onClick={(e) => removeRecent(e, term)}>
                        <X size={16} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Explore Categories</div>
              <button 
                className={styles.viewAllBtn}
                onClick={() => {
                  navigate('/shop')
                  setIsFocused(false)
                  if (onClose) onClose()
                }}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className={styles.categoryScroll}>
              {categories.map((cat: any) => {
                const isActive = cat.id === 'all'
                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={`${styles.categoryBtn} ${isActive ? styles.active : ''}`}
                    onClick={() => {
                      if (cat.id !== 'all') {
                        navigate(`/shop?category=${cat.id}`)
                      } else {
                        navigate(`/shop`)
                      }
                      setIsFocused(false)
                      if (onClose) onClose()
                    }}
                  >
                    <div className={styles.iconContainer}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <span className={styles.label}>{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.section} style={{ marginTop: '32px' }}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                Trending Treats
              </div>
              <button 
                className={styles.viewAllBtn}
                onClick={() => {
                  navigate('/shop')
                  setIsFocused(false)
                  if (onClose) onClose()
                }}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className={styles.trendingGrid}>
              {bestSelling.map((product: any) => (
                <button 
                  key={product.id} 
                  className={styles.resultRow}
                  onClick={() => {
                    navigate(`/product/${product.slug}`)
                    setIsFocused(false)
                    if (onClose) onClose()
                  }}
                >
                  <div className={styles.resultImageWrapper}>
                    <img src={product.images[0].url} alt={product.name} className={styles.resultImage} />
                  </div>
                  <div className={styles.resultInfo}>
                    <h4 className={styles.resultName}>{product.name}</h4>
                    <p className={styles.resultCategory}>{product.categoryName}</p>
                  </div>
                  <span className={styles.resultPrice}>₹{product.basePrice / 100}</span>
                  <ArrowRight size={18} className={styles.resultArrow} />
                </button>
              ))}
            </div>
          </div>
        </>
      )
    }

    if (isLoading) {
      return null // Show loading icon in the input field instead of jumping content
    }

    if (results.length === 0) {
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
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Search Results</div>
        <ul className={styles.resultList} role="listbox">
          {results.map((product, index) => (
            <li key={product.id}>
              <button 
                className={styles.resultRow} 
                data-active={index === activeIndex}
                onClick={() => handleResultClick(product)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <div className={styles.resultImageWrapper}>
                  <img src={product.images[0]?.url} alt={product.name} className={styles.resultImage} />
                </div>
                <div className={styles.resultInfo}>
                  <h4 className={styles.resultName}>{product.name}</h4>
                  <p className={styles.resultCategory}>{product.categoryName}</p>
                </div>
                <span className={styles.resultPrice}>₹{product.basePrice / 100}</span>
                <ArrowRight size={18} className={styles.resultArrow} />
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

  // --- MOBILE RENDER ---
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
          <div className={styles.mobileHeader}>
            <button className={styles.backButton} onClick={onClose} aria-label="Close search">
              <ArrowLeft size={24} />
            </button>
            <div className={styles.mobileSearchField}>
              <Search size={20} className={styles.searchIcon} style={{ marginLeft: 12, marginRight: 8 }} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Search your favorite treats..."
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
                ) : (
                  <>
                    <button className={styles.iconButton} aria-label="Voice search">
                      <Mic size={18} strokeWidth={2} />
                    </button>
                    <button className={styles.iconButton} aria-label="Visual search">
                      <Camera size={18} strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={styles.mobileContent}>
            {renderContent()}
          </div>
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
