import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import styles from './AdminLayout.module.css'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'
import { AdminHeader } from '@/features/admin/components/AdminHeader'
import { AdminBottomNav } from '@/features/admin/components/AdminBottomNav'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 992)
  const location = useLocation()
  const pageContentRef = useRef<HTMLElement>(null)

  // Scroll page content container and window to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    if (pageContentRef.current) {
      pageContentRef.current.scrollTop = 0
    }
  }, [location.pathname])

  // Apply admin theme class to body globally while AdminLayout is mounted
  // This ensures CSS variables properly cascade to both the layout and body-appended React Portals (modals, popups)
  useEffect(() => {
    document.body.classList.add('admin-theme')
    return () => {
      document.body.classList.remove('admin-theme')
    }
  }, [])

  // Close sidebar on navigation on mobile only
  useEffect(() => {
    if (window.innerWidth < 992) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 992) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [sidebarOpen])

  return (
    <div className={`${styles.adminLayout} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.mainContent}>
        <AdminHeader isOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={styles.pageContent} ref={pageContentRef}>
          <Outlet />
        </main>
        <AdminBottomNav onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  )
}
