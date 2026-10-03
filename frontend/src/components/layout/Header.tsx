import React, { useState, useEffect, useRef } from 'react'
import { Search, ShoppingBag, Menu, Heart, User, ArrowLeft, ShieldCheck, Truck } from 'lucide-react'
import styles from './Header.module.css'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/assets/brand/Logo'
import { SideDrawer } from './SideDrawer'
import { SearchBar } from '@/components/commerce/SearchBar'
import { useCart } from '@/features/cart'
import { useWishlist } from '@/features/wishlist'
import { Badge } from '@/components/ui/Badge'
import { SideCart } from '@/components/commerce/SideCart'
import { useAuth } from '@/context/AuthContext'

const ADMIN_ALLOWED_ROLES = [
  'owner',
  'super_admin',
  'main_admin',
  'admin',
  'editor',
  'viewer',
];

export const Header = () => {
  const { isAuthenticated, openAuthModal, user } = useAuth()
  const userRole = user?.role?.toLowerCase() || ''
  const isAdmin = Boolean(isAuthenticated && user && ADMIN_ALLOWED_ROLES.includes(userRole))
  const isDelivery = Boolean(
    isAuthenticated &&
    user &&
    !isAdmin &&
    (userRole === 'delivery_agent' || userRole === 'delivery')
  )
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const lastScrollY = useRef(0)
  const location = useLocation()
  const { totalItems, openCart } = useCart()
  const { itemCount: wishlistCount } = useWishlist()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (document.documentElement.getAttribute('data-hide-header') === 'true') {
        lastScrollY.current = currentScrollY
        return
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false) // Scrolling down past header height -> hide
        document.documentElement.style.setProperty('--header-offset', '0px')
      } else {
        setIsVisible(true) // Scrolling up or at top -> show
        document.documentElement.style.setProperty('--header-offset', 'var(--header-height-desktop, 80px)')
      }

      lastScrollY.current = currentScrollY
    }

    const handleForceVisibility = (e: any) => {
      if (e.detail?.hide) {
        setIsVisible(false)
        document.documentElement.style.setProperty('--header-offset', '0px')
      } else {
        setIsVisible(true)
        document.documentElement.style.setProperty('--header-offset', 'var(--header-height-desktop, 80px)')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('app:set-header-visibility', handleForceVisibility)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('app:set-header-visibility', handleForceVisibility)
    }
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
          {/* Mobile Search Icon */}
          <button className={`${styles.iconButton} ${styles.mobileOnlyIcon}`} aria-label="Search" onClick={() => setIsSearchOpen(true)}>
            <Search size={20} strokeWidth={1.5} />
          </button>

          {/* Desktop Expanded Search Bar */}
          <button className={styles.searchBarDesktop} onClick={() => setIsSearchOpen(true)}>
            <div className={styles.searchLeft}>
              <Search size={16} className={styles.searchIconMuted} />
              <span className={styles.searchPlaceholder}>Search...</span>
            </div>
            <span className={styles.shortcutKey}>⌘K</span>
          </button>

          {/* Desktop Only Icons */}
          <Link to="/wishlist" className={`${styles.iconButton} ${styles.desktopOnlyIcon}`} aria-label="Wishlist">
            <div className={styles.cartIconWrapper}>
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className={styles.cartBadgeWrapper}>
                  <Badge count={wishlistCount} variant="pink" />
                </span>
              )}
            </div>
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

          <Link 
            to="/profile" 
            className={`${styles.iconButton} ${styles.desktopOnlyIcon}`} 
            aria-label={isAuthenticated ? "Profile" : "Sign In"}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                openAuthModal();
              }
            }}
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          {isDelivery && (
            <Link
              to="/delivery"
              className={styles.adminHeaderButton}
              aria-label="Delivery Portal"
              title="Delivery Portal"
            >
              <Truck size={16} strokeWidth={1.8} className={styles.adminHeaderIcon} />
              <span>Delivery Portal</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={styles.adminHeaderButton}
              aria-label="Admin Portal"
              title="Admin Portal"
            >
              <ShieldCheck size={16} strokeWidth={1.8} className={styles.adminHeaderIcon} />
              <span>Admin Portal</span>
            </Link>
          )}

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
