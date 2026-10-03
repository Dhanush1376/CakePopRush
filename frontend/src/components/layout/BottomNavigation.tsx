import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Heart, Store, User, Edit3, LogIn } from 'lucide-react'
import styles from './BottomNavigation.module.css'
import { Badge } from '../ui/Badge'
import { useCart } from '@/features/cart'
import { useWishlist } from '@/features/wishlist'
import { useAuth } from '@/context/AuthContext'

export const BottomNavigation = () => {
  const location = useLocation()
  const { items: cartItems } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { isAuthenticated, openAuthModal } = useAuth()

  // Hide BottomNavigation on cart, checkout, and payment pages
  if (
    (location.pathname === '/cart' && cartItems.length > 0) || 
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/payment')
  ) {
    return null
  }

  const isProfileActive =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/orders') ||
    location.pathname.startsWith('/custom-orders-history')

  const navItems = [
    {
      label: 'Home',
      to: '/',
      icon: <Home size={20} strokeWidth={location.pathname === '/' ? 2.1 : 1.6} />,
      isActive: location.pathname === '/',
    },
    {
      label: 'Shop',
      to: '/shop',
      icon: <Store size={20} strokeWidth={location.pathname.startsWith('/shop') || location.pathname.startsWith('/product') ? 2.1 : 1.6} />,
      isActive: location.pathname.startsWith('/shop') || location.pathname.startsWith('/product'),
    },
    {
      label: 'Wishlist',
      to: '/wishlist',
      icon: <Heart size={20} strokeWidth={location.pathname === '/wishlist' ? 2.1 : 1.6} />,
      badge: wishlistItems.length,
      isActive: location.pathname === '/wishlist',
    },
    {
      label: 'Custom',
      to: '/custom-orders',
      icon: <Edit3 size={20} strokeWidth={location.pathname === '/custom-orders' ? 2.1 : 1.6} />,
      isActive: location.pathname === '/custom-orders',
    },
    isAuthenticated
      ? {
          label: 'Profile',
          to: '/profile',
          icon: <User size={20} strokeWidth={isProfileActive ? 2.1 : 1.6} />,
          isActive: isProfileActive,
        }
      : {
          label: 'Login',
          onClick: openAuthModal,
          icon: <LogIn size={20} strokeWidth={1.6} />,
          isActive: false,
        },
  ]

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
    </div>
  )
}

interface NavItemProps {
  label: string
  to?: string
  onClick?: () => void
  icon: React.ReactNode
  badge?: number
  isActive: boolean
}

const NavItem = ({ label, to, onClick, icon, badge, isActive }: NavItemProps) => {
  const content = (
    <>
      <div className={styles.iconContainer}>
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className={styles.badgeWrapper}>
            <Badge count={badge} variant="pink" />
          </span>
        )}
      </div>
      <span className={styles.label}>{label}</span>
      {isActive && <span className={styles.activeDot} />}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
        aria-label={label}
      >
        {content}
      </button>
    )
  }

  return (
    <NavLink
      to={to || '/'}
      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
      aria-label={label}
    >
      {content}
    </NavLink>
  )
}
