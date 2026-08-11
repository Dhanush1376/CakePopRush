import React, { useState } from 'react'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import styles from './MobileNav.module.css'
import { Logo } from '@/assets/brand/Logo'
import { IconButton } from '../ui/IconButton'
import { SideDrawer } from './SideDrawer'
import { SearchBar } from '../commerce/SearchBar'

export const MobileNav = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.leftSection}>
          <IconButton 
            icon={<Menu size={32} />} 
            aria-label="Open menu" 
            onClick={() => setIsDrawerOpen(true)}
            className={styles.menuButton}
          />
        </div>
        
        <div className={styles.centerSection}>
          <Logo height={44} />
        </div>
        
        <div className={styles.rightSection}>
          <IconButton 
            icon={<Search size={32} />} 
            aria-label="Search" 
            className={styles.rightIcon} 
            onClick={() => setIsSearchOpen(true)}
          />
          <IconButton icon={<ShoppingBag size={32} />} badgeCount={2} aria-label="Cart" className={styles.rightIcon} />
        </div>
      </nav>

      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
      {isSearchOpen && (
        <SearchBar isMobile={true} onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  )
}
