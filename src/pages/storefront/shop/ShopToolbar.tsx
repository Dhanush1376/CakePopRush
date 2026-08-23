import React, { useState, useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import styles from './ShopToolbar.module.css'
import { Container } from '@/components/layout/Container'
import { MobileFilters } from '@/components/commerce/MobileFilters'
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator'
import { productData } from '@/features/products'

interface ShopToolbarProps {
  totalProducts: number
  showingStart: number
  showingEnd: number
}

export const ShopToolbar = ({ totalProducts }: ShopToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { triggerReaction } = useMascotOrchestrator()
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    productData.getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (totalProducts === 0) {
      triggerReaction('filter:zero-results')
    }
  }, [totalProducts, triggerReaction])

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
              onClick={() => {
                setIsFilterOpen(true)
                triggerReaction('filter:applied')
              }}
            >
              <SlidersHorizontal size={16} strokeWidth={2.5} />
              <span>Filters & Sort</span>
            </button>
          </div>

        </div>
      </Container>

      <MobileFilters isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} categories={categories} />
    </section>
  )
}
