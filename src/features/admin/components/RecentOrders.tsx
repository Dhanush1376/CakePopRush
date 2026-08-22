import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import styles from './AdminComponents.module.css'
import { adminDashboardData } from '@/features/admin/api/adminDataProvider';
export function RecentOrders() {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    adminDashboardData.getRecentOrders().then(setRecentOrders);
  }, []);

  if (recentOrders.length === 0) return null;
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: 'rgba(247, 37, 133, 0.1)', color: 'var(--admin-pink)' }
      case 'Processing':
        return { bg: 'rgba(255, 194, 26, 0.15)', color: '#D49E00' } // darker yellow for text
      case 'Shipped':
        return { bg: 'rgba(24, 199, 206, 0.15)', color: '#0F9AA0' } // darker cyan for text
      case 'Delivered':
        return { bg: 'rgba(39, 174, 96, 0.15)', color: 'var(--admin-green)' }
      default:
        return { bg: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Recent Orders</h2>
        <Link to="/admin/orders" className={styles.viewAll}>View All</Link>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowX: 'auto' }}>
        {recentOrders.map((order, index) => {
          const badgeStyle = getBadgeStyle(order.status)
          
          return (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingBottom: index !== recentOrders.length - 1 ? '12px' : '0',
              borderBottom: index !== recentOrders.length - 1 ? '1px solid var(--color-border)' : 'none',
              minWidth: '300px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{order.id}</span>
                <span style={{ fontSize: '14px', color: 'var(--admin-brown)', fontWeight: 500 }}>{order.customer}</span>
              </div>
              
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-brown)', flex: 1, textAlign: 'center' }}>
                {order.amount}
              </div>
              
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: badgeStyle.bg,
                  color: badgeStyle.color
                }}>
                  {order.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
