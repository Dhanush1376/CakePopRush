import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import styles from './AdminComponents.module.css'
import { adminDashboardData } from '@/features/admin/api/adminDataProvider';
export function TopSellingProducts() {
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);

  useEffect(() => {
    adminDashboardData.getTopSellingProducts().then(setTopSellingProducts);
  }, []);

  if (topSellingProducts.length === 0) return null;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Top Selling Cake Pops</h2>
        <Link to="/admin/products" className={styles.viewAll}>View All</Link>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {topSellingProducts.map((product) => (
          <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface-hover)'
              }}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '14px', color: 'var(--admin-brown)', fontWeight: 500 }}>
                {product.name}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-brown)' }}>
                {product.sold}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Sold
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
