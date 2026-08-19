import React, { useEffect } from 'react';
import { X, Edit2, Box, DollarSign, Eye, TrendingUp } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './ProductDetailsModal.module.css';

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
}

export function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  // Mock additional details
  const mockDescription = `${product.name} is a delightful treat that perfectly balances flavor and texture. Handcrafted with love and premium ingredients.`;
  const mockDietary = product.category === 'Chocolate' ? 'Contains Dairy, Cocoa' : 'Vegetarian, Contains Gluten';
  const mockShelfLife = '5 Days (Refrigerated)';
  const mockAddedOn = '12 Oct, 2023';

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle}></div>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <img src={product.image} alt={product.name} className={styles.image} />
          <div className={styles.titleArea}>
            <h2 className={styles.name}>{product.name}</h2>
            <div className={styles.sku}>SKU: {product.sku}</div>
            <div className={styles.badges}>
              <span className={`${styles.badge} ${product.status === 'Active' ? styles.badgeActive : styles.badgeInactive}`}>
                {product.status}
              </span>
              <span className={`${styles.badge} ${styles.badgeCategory} ${styles['badgeCategory' + product.category] || ''}`}>
                {product.category}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Product Performance</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statLabel}><DollarSign size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}}/>Price</div>
                <div className={styles.statValue}>{product.price}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}><Box size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}}/>Inventory</div>
                <div className={styles.statValue}>{product.stock}</div>
                <div className={`${styles.stockStatus} ${product.stockState === 'In Stock' ? styles.inStock : product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock}`}>
                  {product.stockState}
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}><TrendingUp size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}}/>Sales</div>
                <div className={styles.statValue}>{product.sales}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}><Eye size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: 4}}/>Views</div>
                <div className={styles.statValue}>{product.views}</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Additional Information</h3>
            <div className={styles.descriptionText}>
              {mockDescription}
            </div>
            <div className={styles.infoGrid}>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Category</span>
                 <span className={styles.infoValue}>{product.category}</span>
               </div>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Status</span>
                 <span className={styles.infoValue}>{product.status}</span>
               </div>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Dietary Info</span>
                 <span className={styles.infoValue}>{mockDietary}</span>
               </div>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Shelf Life</span>
                 <span className={styles.infoValue}>{mockShelfLife}</span>
               </div>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Added On</span>
                 <span className={styles.infoValue}>{mockAddedOn}</span>
               </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose}>Close</button>
          <button className={styles.primaryBtn}><Edit2 size={16} /> Edit Product</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
