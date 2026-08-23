import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, Cookie, CakeSlice, IceCream, MapPin, RotateCcw, Gift, Heart, PartyPopper, Star, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Check } from 'lucide-react'
import styles from './MobileFilters.module.css'
import { createPortal } from 'react-dom'

interface MobileFiltersProps {
  isOpen: boolean
  onClose: () => void
  categories: any[]
}

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended', subtitle: 'Our top picks for you', icon: Star },
  { id: 'price_asc', label: 'Price: Low to High', subtitle: 'Most affordable first', icon: TrendingDown },
  { id: 'price_desc', label: 'Price: High to Low', subtitle: 'Premium treats first', icon: TrendingUp },
]

const getCategoryIcon = (id: string, name: string) => {
  const lower = (id + ' ' + name).toLowerCase();
  if (lower.includes('cookie')) return Cookie;
  if (lower.includes('pop') || lower.includes('macaron') || lower.includes('dessert')) return IceCream;
  if (lower.includes('cake') || lower.includes('brownie')) return CakeSlice;
  return Layers;
}

const OCCASIONS = [
  { id: 'birthday', label: 'Birthdays', subtitle: 'Perfect for celebrations', icon: Gift },
  { id: 'wedding', label: 'Weddings', subtitle: 'Elegant & tiered options', icon: Heart },
  { id: 'anniversary', label: 'Anniversaries', subtitle: 'Romantic & sweet', icon: PartyPopper },
]

export const MobileFilters = ({ isOpen, onClose, categories }: MobileFiltersProps) => {
  const [activeSort, setActiveSort] = useState('recommended')
  const [activeCategories, setActiveCategories] = useState<string[]>(['all'])
  const [maxPrice, setMaxPrice] = useState(250)
  const [activeOccasion, setActiveOccasion] = useState('birthday')

  const toggleCategory = (id: string) => {
    if (id === 'all') {
      setActiveCategories(['all'])
      return
    }
    setActiveCategories(prev => {
      const isSelected = prev.includes(id)
      const newSelection = isSelected ? prev.filter(c => c !== id) : [...prev.filter(c => c !== 'all'), id]
      return newSelection.length === 0 ? ['all'] : newSelection
    })
  }

  const [expanded, setExpanded] = useState({
    sort: true,
    category: true,
    price: true,
    occasion: true
  })

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.drawer}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.dragHandle} />
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Filters</h2>
            <div className={styles.headerRight}>
              <button className={styles.resetIconBtn} onClick={() => {
              setActiveSort('recommended')
              setActiveCategories(['all'])
              setMaxPrice(250)
              setActiveOccasion('birthday')
            }} aria-label="Reset filters">
                <RotateCcw size={18} strokeWidth={2.5} />
                <span>Reset</span>
              </button>
              <button className={styles.closeButton} onClick={onClose} aria-label="Close filters">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className={styles.scrollArea}>
            {/* Sort By */}
            <div className={styles.section}>
              <button className={styles.sectionTitleRow} onClick={() => toggleSection('sort')}>
                <span className={styles.sectionTitle}>Sort By</span>
                <div className={styles.caretBox}>
                  {expanded.sort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
              {expanded.sort && (
                <div className={styles.listContainer}>
                  {SORT_OPTIONS.map((sortOpt) => {
                    const Icon = sortOpt.icon
                    const isActive = activeSort === sortOpt.id
                    return (
                      <div
                        key={sortOpt.id}
                        className={`${styles.listItem} ${isActive ? styles.listItemActive : ''}`}
                        onClick={() => setActiveSort(sortOpt.id)}
                      >
                        <div className={`${styles.radioOuter} ${isActive ? styles.radioOuterActive : ''}`}>
                          {isActive && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.listTitle}>{sortOpt.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Price Range Slider */}
            <div className={styles.section}>
              <button className={styles.sectionTitleRow} onClick={() => toggleSection('price')}>
                <span className={styles.sectionTitle}>Max Price</span>
                <span className={styles.sectionValue}>₹{maxPrice}</span>
              </button>
              {expanded.price && (
                <div className={styles.sliderWrapper}>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="1"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className={styles.rangeInput}
                  style={{
                    background: `linear-gradient(to right, var(--color-brand-pink) ${((maxPrice - 50) / 950) * 100}%, rgba(91, 58, 41, 0.1) ${((maxPrice - 50) / 950) * 100}%)`
                  }}
                />
                <div className={styles.sliderLabels}>
                  <span>₹50</span>
                  <span>₹1000+</span>
                </div>
              </div>
              )}
            </div>

            {/* Category Radio List */}
            <div className={styles.section}>
              <button className={styles.sectionTitleRow} onClick={() => toggleSection('category')}>
                <span className={styles.sectionTitle}>Category</span>
                <div className={styles.caretBox}>
                  {expanded.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
              {expanded.category && (
                <div className={`${styles.listContainer} ${styles.scrollableList}`}>
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.id, cat.name)
                    const isActive = activeCategories.includes(cat.id)
                    return (
                      <div
                        key={cat.id}
                        className={`${styles.listItem} ${isActive ? styles.listItemActive : ''}`}
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <div className={`${styles.checkboxOuter} ${isActive ? styles.checkboxOuterActive : ''}`}>
                          {isActive && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className={styles.listTitle}>{cat.name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Occasion */}
            <div className={styles.section}>
              <button className={styles.sectionTitleRow} onClick={() => toggleSection('occasion')}>
                <span className={styles.sectionTitle}>Occasion</span>
                <div className={styles.caretBox}>
                  {expanded.occasion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
              {expanded.occasion && (
                <div className={styles.listContainer}>
                  {OCCASIONS.map((occasion) => {
                    const Icon = occasion.icon
                    const isActive = activeOccasion === occasion.id
                    return (
                      <div
                        key={occasion.id}
                        className={`${styles.listItem} ${isActive ? styles.listItemActive : ''}`}
                        onClick={() => setActiveOccasion(occasion.id)}
                      >
                        <div className={`${styles.radioOuter} ${isActive ? styles.radioOuterActive : ''}`}>
                          {isActive && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.listTitle}>{occasion.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>


          </div>

          {/* Sticky Footer */}
          <div className={styles.footer}>
            <button className={styles.applyButton} onClick={onClose}>
              Apply Filters
              <span className={styles.resultsBadge}>128 Results</span>
            </button>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
