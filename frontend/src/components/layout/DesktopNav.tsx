import React from 'react'
import { NavLink } from 'react-router-dom'
import { User, ShoppingBag } from 'lucide-react'
import styles from './DesktopNav.module.css'
import { Logo } from '@/assets/brand/Logo'
import { IconButton } from '../ui/IconButton'
import { SearchBar } from '../commerce/SearchBar'

export const DesktopNav = () => {
  const navLinks = [
    { label: 'HOME', to: '/' },
    { label: 'SHOP', to: '/shop' },
    { label: 'CUSTOM ORDERS', to: '/custom-orders' },
    { label: 'ABOUT', to: '/about' },
  ]

  return (
    <nav className={styles.nav}>
      <div className={styles.logoSection}>
        <Logo height={56} />
      </div>
      
      <ul className={styles.linksSection}>
        {navLinks.map((link) => (
          <li key={link.label}>
            <NavLink 
              to={link.to} 
              className={({ isActive }) => 
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      
      <div className={styles.actionsSection}>
        <div className={styles.searchWrapper}>
          <SearchBar />
        </div>
        <IconButton icon={<User />} aria-label="Account" />
        <IconButton icon={<ShoppingBag />} badgeCount={2} aria-label="Cart" />
      </div>
    </nav>
  )
}
