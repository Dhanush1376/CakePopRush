import React, { useEffect, useState } from 'react'
import { Category } from '@/types/product'
import styles from './ShopCategories.module.css'
import { Container } from '@/components/layout/Container'
import { productData } from '@/features/products'

interface ShopCategoriesProps {
  activeCategory: string
  onSelectCategory: (id: string) => void
  onScrollChange?: (percentage: number) => void
}

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

// Helper to render product cover photos based on category id
const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'all':
      return <AllItemsIcon width={52} height={52} />
    case 'cake-pops':
      return <CakePopsIcon width={52} height={52} />
    case 'cakesicles':
      return <CakesiclesIcon width={52} height={52} />
    case 'cookies':
      return <CookiesIcon width={52} height={52} />
    case 'brownies':
      return <BrowniesIcon width={52} height={52} />
    case 'cupcakes':
      return <CupcakesIcon width={52} height={52} />
    case 'macarons':
      return <MacaronsIcon width={52} height={52} />
    case 'truffles':
      return <TrufflesIcon width={52} height={52} />
    case 'desserts':
      return <TrufflesIcon width={52} height={52} />
    case 'cakes':
    case 'birthday-cakes':
      return <BirthdayCakesIcon width={52} height={52} />
    case 'cake-jars':
      return <CakeJarsIcon width={52} height={52} />
    case 'gift-boxes':
      return <GiftBoxesIcon width={52} height={52} />
    default:
      return null;
  }
}

export const ShopCategories = ({ activeCategory, onSelectCategory, onScrollChange }: ShopCategoriesProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [hasDragged, setHasDragged] = React.useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    productData.getCategories().then(setCategories);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll fast
    if (Math.abs(walk) > 10) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className={styles.categorySection}>
      <Container>
        <h2 className={styles.title}>Categories</h2>
        <div
          className={`${styles.categoryScroll} ${isDragging ? styles.dragging : ''}`}
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll > 0 && onScrollChange) {
              const percentage = el.scrollLeft / maxScroll;
              onScrollChange(percentage);
            }
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                type="button"
                key={cat.id}
                className={`${styles.categoryBtn} ${isActive ? styles.active : ''}`}
                onClick={(e) => {
                  // Prevent click if they were dragging
                  if (hasDragged) {
                    e.preventDefault();
                    e.stopPropagation();
                  } else {
                    onSelectCategory(cat.id);
                  }
                }}
                aria-pressed={isActive}
                aria-label={`Filter by ${cat.name}`}
              >
                <div className={styles.iconContainer}>
                  {getCategoryIcon(cat.id)}
                </div>
                <span className={styles.label}>{cat.name}</span>
                <div className={styles.activeIndicator} aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
