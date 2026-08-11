import { NavLink } from 'react-router-dom'
import { Home, ShoppingBag, Box, Users, Edit3 } from 'lucide-react'
import styles from './AdminBottomNav.module.css'

interface AdminBottomNavProps {
  onMenuClick: () => void;
}

export function AdminBottomNav({ onMenuClick }: AdminBottomNavProps) {
  return (
    <nav className={styles.bottomNav}>
      <NavLink 
        to="/admin" 
        end
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
      >
        <div className={styles.iconContainer}>
          <Home size={20} />
        </div>
        <span className={styles.navLabel}>Home</span>
      </NavLink>
      
      <NavLink 
        to="/admin/orders" 
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
      >
        <div className={styles.iconContainer}>
          <ShoppingBag size={20} />
        </div>
        <span className={styles.navLabel}>Orders</span>
      </NavLink>

      <NavLink 
        to="/admin/products" 
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
      >
        <div className={styles.iconContainer}>
          <Box size={20} />
        </div>
        <span className={styles.navLabel}>Products</span>
      </NavLink>

      <NavLink 
        to="/admin/customers" 
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
      >
        <div className={styles.iconContainer}>
          <Users size={20} />
        </div>
        <span className={styles.navLabel}>Customers</span>
      </NavLink>

      <NavLink 
        to="/admin/storefront-cms" 
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
      >
        <div className={styles.iconContainer}>
          <Edit3 size={20} />
        </div>
        <span className={styles.navLabel}>CMS</span>
      </NavLink>
    </nav>
  )
}
