import { useState, useEffect } from 'react'
import styles from './AdminDashboard.module.css'
import { WelcomeSection } from '@/features/admin/components/WelcomeSection'
import { StatsGrid } from '@/features/admin/components/StatsGrid'
import { SalesOverviewChart } from '@/features/admin/components/SalesOverviewChart'
import { OrderStatusChart } from '@/features/admin/components/OrderStatusChart'
import { TopSellingProducts } from '@/features/admin/components/TopSellingProducts'
import { RecentOrders } from '@/features/admin/components/RecentOrders'
import { LowStockAlerts } from '@/features/admin/components/LowStockAlerts'
import { AdminDashboardSkeleton } from '@/features/admin/components/AdminDashboardSkeleton'

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading to demonstrate the skeleton
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className={styles.dashboard}>
      <WelcomeSection />
      
      <StatsGrid />
      
      <div className={styles.chartsGrid}>
        <SalesOverviewChart />
        <OrderStatusChart />
      </div>
      
      <div className={styles.bottomGrid}>
        <TopSellingProducts />
        <RecentOrders />
        <LowStockAlerts />
      </div>

    </div>
  )
}
