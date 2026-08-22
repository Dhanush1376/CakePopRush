import React, { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, User, ChevronRight, Settings, LogOut } from 'lucide-react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import styles from './AdminHeader.module.css'
import { adminDashboardData } from '@/features/admin/api/adminDataProvider'
import { AdminSearchPalette } from './AdminSearchPalette'

interface AdminHeaderProps {
  onMenuClick: () => void;
  isOpen?: boolean;
}

export function AdminHeader({ onMenuClick, isOpen }: AdminHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter(x => x);

  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'profile' | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminDashboardData.getNotifications().then(setNotifications);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: 'notifications' | 'profile') => {
    if (activeDropdown === dropdown) setActiveDropdown(null);
    else setActiveDropdown(dropdown);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.left}>
        <button 
          className={styles.menuButton} 
          onClick={onMenuClick}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="7" x2="14" y2="7" />
              <line x1="5" y1="17" x2="14" y2="17" />
              <line x1="5" y1="12" x2="10" y2="12" />
              <polyline points="19 17 14 12 19 7" />
            </svg>
          ) : (
            <Menu size={24} />
          )}
        </button>

        <div className={styles.breadcrumbs}>
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);

            return (
              <div key={to} className={styles.breadcrumbItem}>
                {index > 0 && <ChevronRight size={18} className={styles.breadcrumbSeparator} />}
                {isLast ? (
                  <span className={styles.breadcrumbTextActive}>{formattedValue}</span>
                ) : (
                  <Link to={to} className={styles.breadcrumbLink}>{formattedValue}</Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className={styles.right}>
        {/* Search Modal Trigger */}
        <div className={`${styles.dropdownContainer} ${styles.searchContainer}`}>
          {/* Mobile Search Bar */}
          <button 
            className={styles.searchBarMobile}
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={18} strokeWidth={2} className={styles.searchIconMuted} />
            <span className={styles.searchPlaceholder}>Search admin...</span>
          </button>
          
          {/* Desktop / Laptop Extended Search Bar */}
          <button 
            className={styles.searchBarDesktop}
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className={styles.searchLeft}>
              <Search size={18} strokeWidth={2} className={styles.searchIconMuted} />
              <span className={styles.searchPlaceholder}>Search orders, products, customers...</span>
            </div>
            <kbd className={styles.shortcutKey}>Ctrl K</kbd>
          </button>
        </div>
        
        {/* Notifications Dropdown */}
        <div className={styles.dropdownContainer}>
          <button 
            className={`${styles.iconButton} ${activeDropdown === 'notifications' ? styles.active : ''}`} 
            aria-label="Notifications"
            onClick={() => toggleDropdown('notifications')}
          >
            <Bell size={20} strokeWidth={2} />
            {notifications && notifications.count > 0 && (
              <span className={styles.badge}>{notifications.count}</span>
            )}
          </button>
          
          {activeDropdown === 'notifications' && (
            <div className={`${styles.dropdownMenu} ${styles.notificationsDropdown}`}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                <span className={styles.markRead}>Mark all as read</span>
              </div>
              <div className={styles.notificationsList}>
                <div className={styles.notificationItem}>
                  <div className={styles.notificationDot} />
                  <div className={styles.notificationContent}>
                    <p><strong>New Order #1248</strong> placed by Priya Patel.</p>
                    <span>2 mins ago</span>
                  </div>
                </div>
                <div className={styles.notificationItem}>
                  <div className={styles.notificationDot} />
                  <div className={styles.notificationContent}>
                    <p><strong>Custom Request</strong> submitted for Wedding Cake Pops.</p>
                    <span>1 hour ago</span>
                  </div>
                </div>
                <div className={styles.notificationItem}>
                  <div className={styles.notificationDot} style={{ backgroundColor: 'var(--color-text-muted)' }} />
                  <div className={styles.notificationContent}>
                    <p>Stock low for <strong>Strawberry Bliss Pops</strong>.</p>
                    <span>Yesterday</span>
                  </div>
                </div>
              </div>
              <div className={styles.dropdownFooter}>
                <Link to="/admin/notifications" onClick={() => setActiveDropdown(null)}>View all notifications</Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div className={styles.dropdownContainer}>
          <button 
            className={`${styles.profileButton} ${activeDropdown === 'profile' ? styles.activeProfile : ''}`} 
            aria-label="Profile"
            onClick={() => toggleDropdown('profile')}
          >
            <User size={20} strokeWidth={2} />
          </button>
          
          {activeDropdown === 'profile' && (
            <div className={`${styles.dropdownMenu} ${styles.profileDropdown}`}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}><User size={24} color="var(--admin-pink)" /></div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>Priyanka</span>
                  <span className={styles.profileRole}>Super Admin</span>
                </div>
              </div>
              <div className={styles.dropdownDivider} />
              <Link to="/admin/settings" className={styles.dropdownItem} onClick={() => setActiveDropdown(null)}>
                <User size={16} /> My Profile
              </Link>
              <Link to="/admin/settings" className={styles.dropdownItem} onClick={() => setActiveDropdown(null)}>
                <Settings size={16} /> Account Settings
              </Link>
              <div className={styles.dropdownDivider} />
              <button 
                className={styles.dropdownItem} 
                style={{ color: 'var(--color-error)' }}
                onClick={() => { setActiveDropdown(null); navigate('/'); }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
      
      <AdminSearchPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  )
}
