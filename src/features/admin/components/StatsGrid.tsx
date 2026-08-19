import { StatCard } from './StatCard'
import { adminDashboardData } from '@/features/admin/api/mockAdminDataProvider';
import { ShoppingBag, IndianRupee, Users, Heart } from 'lucide-react'
import styles from './AdminComponents.module.css'

export function StatsGrid() {
  const adminStats = adminDashboardData.getStats();
  return (
    <div className={styles.statsGrid}>
      <StatCard 
        title="Total Orders" 
        data={adminStats.totalOrders} 
        icon={<ShoppingBag size={24} color="var(--admin-pink)" />}
        iconBg="var(--admin-nav-active-bg)"
      />
      <StatCard 
        title="Total Revenue" 
        data={adminStats.totalRevenue} 
        icon={<IndianRupee size={24} color="var(--admin-yellow)" />}
        iconBg="rgba(255, 194, 26, 0.15)"
      />
      <StatCard 
        title="Total Customers" 
        data={adminStats.totalCustomers} 
        icon={<Users size={24} color="var(--admin-cyan)" />}
        iconBg="rgba(24, 199, 206, 0.15)"
      />
      <StatCard 
        title="Wishlist Adds" 
        data={adminStats.wishlistAdds} 
        icon={<Heart size={24} color="var(--admin-pink)" />}
        iconBg="rgba(255, 117, 150, 0.1)"
      />
    </div>
  )
}
