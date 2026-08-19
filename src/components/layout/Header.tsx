import React, { useState, useEffect, useRef } from 'react'
import { Search, ShoppingBag, Menu, Heart, User, ArrowLeft } from 'lucide-react'
import styles from './Header.module.css'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/assets/brand/Logo'
import { SideDrawer } from './SideDrawer'
import { SearchBar } from '@/components/commerce/SearchBar'
import { useCart } from '@/features/cart'
import { Badge } from '@/components/ui/Badge'
import { SideCart } from '@/components/commerce/SideCart'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const lastScrollY = useRef(0)
  const location = useLocation()
  const { totalItems, openCart } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false) // Scrolling down past header height -> hide
      } else {
        setIsVisible(true) // Scrolling up or at top -> show
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`${styles.header} ${!isVisible ? styles.hidden : ''}`}>
      <div className={styles.topBar}>
        {location.pathname === '/cart' ? (
          <div className={styles.cartPageHeader}>
            <Link to="/" className={styles.backButton}>
              <ArrowLeft size={20} strokeWidth={2} />
            </Link>
            <span className={styles.cartTitleText}>Cart</span>
          </div>
        ) : (
          <Logo height={65} className={styles.logoWrapper} />
        )}

        <nav className={styles.desktopNav}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/shop" className={styles.navLink}>Shop</Link>
          <Link to="/custom-orders" className={styles.navLink}>Custom Orders</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
          <Link to="/contact" className={styles.navLink}>Contact</Link>
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconButton} aria-label="Search" onClick={() => setIsSearchOpen(true)}>
            <Search size={20} strokeWidth={1.5} />
          </button>

          {/* Desktop Only Icons */}
          <Link to="/wishlist" className={`${styles.iconButton} ${styles.desktopOnlyIcon}`} aria-label="Wishlist">
            <Heart size={20} strokeWidth={1.5} />
          </Link>

          <button className={styles.iconButton} aria-label="Cart" onClick={() => { if (location.pathname !== '/cart') openCart(); }}>
            <div className={styles.cartIconWrapper}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className={styles.cartBadgeWrapper}>
                  <Badge count={totalItems} variant="yellow" />
                </span>
              )}
            </div>
          </button>

          <Link to="/orders" className={`${styles.iconButton} ${styles.desktopOnlyIcon}`} aria-label="Profile">
            <User size={20} strokeWidth={1.5} />
          </Link>

          <button className={styles.menuButton} aria-label="Menu" onClick={() => setIsMenuOpen(true)}>
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {location.pathname === '/' && (
        <div className={styles.mobileCategories}>
          <Link to="/shop?category=cake-pops" className={styles.category}>Cake Pops</Link>
          <Link to="/shop?category=cupcakes" className={styles.category}>Cupcakes</Link>
          <Link to="/shop?category=cookies" className={styles.category}>Cookies</Link>
          <Link to="/shop?category=brownies" className={styles.category}>Brownies</Link>
          <Link to="/shop?category=desserts" className={styles.category}>Desserts</Link>
          <Link to="/shop?category=cakes" className={styles.category}>Cakes</Link>
        </div>
      )}
    </header>

    <SideDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    {isSearchOpen && <SearchBar isOpen={true} onClose={() => setIsSearchOpen(false)} />}
    <SideCart />
  </>
  )
}
