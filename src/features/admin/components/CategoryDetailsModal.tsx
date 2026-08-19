import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './CategoryDetailsModal.module.css';

// Using exact mock data structure for demo purposes
interface Product {
  sku: string;
  name: string;
  image: string;
  category: string;
  price: string;
  stock: number;
  stockState: string;
  status: string;
  sales: number;
  views: string;
}

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any;
  products: Product[];
}

export const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  category,
  products
}) => {
  if (!isOpen || !category) return null;

  // Filter products by category name, or show all if "All Items"
  const categoryProducts = category.name === 'All Items' 
    ? products 
    : products.filter(p => p.category === category.name);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{category.name} Details</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.categoryInfo}>
            <p>{category.description}</p>
            <p style={{marginTop: '8px', fontWeight: 500}}>Status: <span style={{color: category.status === 'Active' ? 'var(--admin-green)' : '#DC2626'}}>{category.status}</span></p>
          </div>
          
          <h3 style={{fontSize: '16px', fontWeight: 600, color: 'var(--admin-brown)', marginBottom: '16px'}}>
            Products in this Category ({categoryProducts.length})
          </h3>
          
          <div className={styles.productsList}>
            {categoryProducts.length > 0 ? (
              categoryProducts.map(product => (
                <div key={product.sku} className={styles.productItem}>
                  <img src={product.image} alt={product.name} className={styles.productImage} />
                  <div className={styles.productDetails}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productSku}>SKU: {product.sku}</div>
                    <div className={styles.productStock}>
                      Stock: <span className={
                        product.stockState === 'In Stock' ? styles.inStock : 
                        product.stockState === 'Low Stock' ? styles.lowStock : styles.outOfStock
                      }>{product.stock} ({product.stockState})</span>
                    </div>
                  </div>
                  <div className={styles.productPrice}>{product.price}</div>
                </div>
              ))
            ) : (
              <p style={{color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '20px 0', textAlign: 'center'}}>
                No products found in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
