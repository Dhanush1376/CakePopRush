import { NavLink, Link } from 'react-router-dom'
import { 
  Home, ShoppingBag, Box, Grid, Users, Edit3, 
  Star, Tag, BarChart2, Image, Settings, Shield, Bell,
  ChevronDown, User, ExternalLink, Monitor, PanelLeftClose,
  Smile
} from 'lucide-react'
import styles from './AdminSidebar.module.css'
import { WavyDivider } from '@/components/decorative/WavyDivider'
import { adminUser } from '@/mocks/adminData'

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Home, end: true },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Box },
    { name: 'Categories', path: '/admin/categories', icon: Grid },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Custom Orders', path: '/admin/custom-orders', icon: Edit3 },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Coupons & Offers', path: '/admin/coupons', icon: Tag },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Storefront CMS', path: '/admin/storefront-cms', icon: Monitor },
    { name: 'Mascot Lab', path: '/admin/mascot', icon: Smile },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Users & Roles', path: '/admin/users', icon: Shield },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ]

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`} 
        onClick={onClose}
      />
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="7" x2="14" y2="7" />
            <line x1="5" y1="17" x2="14" y2="17" />
            <line x1="5" y1="12" x2="10" y2="12" />
            <polyline points="19 17 14 12 19 7" />
          </svg>
        </button>

        <div className={styles.logoContainer}>
          <img src="/images/logo.png" alt="CakePopRush Logo" className={styles.logoImage} />
          {/* Subtle dots decoration based on reference */}
          <div style={{position: 'absolute', top: 60, right: 20, width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--admin-cyan)'}}></div>
          <div style={{position: 'absolute', top: 80, left: 20, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--admin-pink)'}}></div>
          <div style={{position: 'absolute', top: 30, left: 15, width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--admin-yellow)'}}></div>
        </div>

        <nav className={styles.navContainer}>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => 
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className={styles.activeIndicator} />}
                    <Icon strokeWidth={2.2} />
                    <span className={styles.navItemText}>{item.name}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <NavLink to="/" className={styles.userSection} style={{ textDecoration: 'none' }}>
          <div className={styles.decorativeTop}>
            <WavyDivider fill="var(--admin-yellow)" position="top" />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <Monitor size={18} strokeWidth={2.5} />
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>View Storefront</span>
              <span className={styles.userRole}>Exit Admin Panel</span>
            </div>
          </div>
        </NavLink>
      </aside>
    </>
  )
}
