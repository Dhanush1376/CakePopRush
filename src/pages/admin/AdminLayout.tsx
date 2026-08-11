import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import styles from './AdminLayout.module.css'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'
import { AdminBottomNav } from './components/AdminBottomNav'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 992)
  const location = useLocation()

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
        <main className={styles.pageContent}>
          <Outlet />
        </main>
        <AdminBottomNav onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  )
}
