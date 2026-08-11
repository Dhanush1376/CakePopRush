import { Link } from 'react-router-dom'
import styles from './AdminComponents.module.css'
import { lowStockProducts } from '@/mocks/adminData'

export function LowStockAlerts() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Low Stock Alert</h2>
        <Link to="/admin/products" className={styles.viewAll}>View All</Link>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {lowStockProducts.map((product) => (
          <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '14px', color: 'var(--admin-brown)', fontWeight: 500 }}>
                {product.name}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--admin-pink)', fontWeight: 600 }}>
                Stock: {product.stock}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
