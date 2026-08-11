import React, { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import styles from './ShopToolbar.module.css'
import { Container } from '@/components/layout/Container'
import { FilterDrawer } from './FilterDrawer'

interface ShopToolbarProps {
  totalProducts: number
  showingStart: number
  showingEnd: number
}

export const ShopToolbar = ({ totalProducts, showingStart, showingEnd }: ShopToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [activeSort, setActiveSort] = useState('Best Selling')
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom')
  
  const sortBtnRef = useRef<HTMLButtonElement>(null)
  const sortOptions = ['Best Selling', 'Newest', 'Price: Low to High', 'Price: High to Low']

  useEffect(() => {
    if (isSortOpen && sortBtnRef.current) {
      const rect = sortBtnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      // Require at least 250px of space below (menu height + bottom nav buffer)
      if (spaceBelow < 250) {
        setMenuPosition('top')
      } else {
        setMenuPosition('bottom')
      }
    }
  }, [isSortOpen])

  return (
    <section className={styles.toolbarSection}>
      <Container>
        <div className={styles.toolbar}>
          
          <div className={styles.productCount}>
            <strong>{totalProducts}</strong> sweet treats
          </div>

          <div className={styles.actionsBox}>
            <button 
              className={styles.filterButton} 
              aria-label="Open Filters"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal size={16} strokeWidth={2.5} />
              <span>Filters</span>
            </button>
            
            <div className={styles.divider} />
            
            <div className={styles.sortWrapper}>
              <button 
                ref={sortBtnRef}
                className={styles.sortDropdown} 
                aria-expanded={isSortOpen}
                aria-label="Sort options"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <span>Sort: <strong>{activeSort}</strong></span>
                <ChevronDown size={16} strokeWidth={2.5} style={{ transform: isSortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {isSortOpen && (
                <div className={`${styles.sortMenu} ${menuPosition === 'top' ? styles.sortMenuTop : styles.sortMenuBottom}`}>
                  {sortOptions.map(option => (
                    <button 
                      key={option}
                      className={`${styles.sortOption} ${activeSort === option ? styles.activeOption : ''}`}
                      onClick={() => {
                        setActiveSort(option)
                        setIsSortOpen(false)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </Container>

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </section>
  )
}
