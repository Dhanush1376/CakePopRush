import { useState, useEffect } from 'react'
import styles from './AdminDashboard.module.css'
import { WelcomeSection } from './components/WelcomeSection'
import { StatsGrid } from './components/StatsGrid'
import { SalesOverviewChart } from './components/SalesOverviewChart'
import { OrderStatusChart } from './components/OrderStatusChart'
import { TopSellingProducts } from './components/TopSellingProducts'
import { RecentOrders } from './components/RecentOrders'
import { LowStockAlerts } from './components/LowStockAlerts'
import { AdminDashboardSkeleton } from './components/AdminDashboardSkeleton'

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
