import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Heart, Store, User, Edit3 } from 'lucide-react'
import styles from './BottomNavigation.module.css'
import { Badge } from '../ui/Badge'
import { useCart } from '@/features/cart'

export const BottomNavigation = () => {
  const location = useLocation()
  const { items } = useCart()

  // Hide BottomNavigation on cart (if not empty) and checkout pages
  if ((location.pathname === '/cart' && items.length > 0) || location.pathname.startsWith('/checkout')) {
    return null;
  }

  const navItems = [
    { label: 'Home', to: '/', icon: <Home size={20} strokeWidth={1.5} /> },
    { label: 'Shop', to: '/shop', icon: <Store size={20} strokeWidth={1.5} /> },
    { label: 'Wishlist', to: '/wishlist', icon: <Heart size={20} strokeWidth={1.5} /> },
    { label: 'Custom', to: '/custom-orders', icon: <Edit3 size={20} strokeWidth={1.5} /> },
    { label: 'Profile', to: '/profile', icon: <User size={20} strokeWidth={1.5} /> },
  ]

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} isActive={location.pathname === item.to} />
        ))}
      </nav>
    </div>
  )
}

interface NavItemProps {
  label: string
  to: string
  icon: React.ReactNode
  badge?: number
  isActive: boolean
}

const NavItem = ({ label, to, icon, badge, isActive }: NavItemProps) => {
  return (
    <NavLink to={to} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
      <div className={styles.iconContainer}>
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className={styles.badgeWrapper}>
            <Badge count={badge} variant="pink" />
          </span>
        )}
      </div>
      <span className={styles.label}>{label}</span>
    </NavLink>
  )
}
