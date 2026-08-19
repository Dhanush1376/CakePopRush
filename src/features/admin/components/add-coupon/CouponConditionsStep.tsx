import React from 'react';
import { Search, Plus, X, ShoppingBag } from 'lucide-react';
import { CouponFormProps } from './useCouponForm';
import styles from './AdminAddCoupon.module.css';

export function CouponConditionsStep({
  appliesTo, setAppliesTo, selectedProducts, setSelectedProducts,
  selectedCategories, setSelectedCategories, removeItem,
}: CouponFormProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Coupon Conditions</h2>
      <p className={styles.sectionSubtitle}>Choose what customers can use this coupon on.</p>

      <div className={styles.segmentedControl}>
        <button 
          className={`${styles.segmentedBtn} ${appliesTo === 'store' ? styles.segmentedBtnActive : ''}`}
          onClick={() => setAppliesTo('store')}
        >
          Entire Store
        </button>
        <button 
          className={`${styles.segmentedBtn} ${appliesTo === 'products' ? styles.segmentedBtnActive : ''}`}
          onClick={() => setAppliesTo('products')}
        >
          Specific Products
        </button>
        <button 
          className={`${styles.segmentedBtn} ${appliesTo === 'categories' ? styles.segmentedBtnActive : ''}`}
          onClick={() => setAppliesTo('categories')}
        >
          Specific Categories
        </button>
      </div>

      {appliesTo === 'store' && (
        <div className={styles.mediaBox} style={{ marginBottom: 0, textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#FFF0F5', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#F21B5B' }}>
            <ShoppingBag size={24} />
          </div>
          <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '8px' }}>APPLIES TO ENTIRE STORE</h3>
          <p style={{ fontSize: '13px', color: '#666', margin: 0, maxWidth: '300px' }}>This coupon will be valid for all products and categories in your catalog.</p>
        </div>
      )}

      {appliesTo === 'products' && (
        <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
          <h3 className={styles.mediaBoxTitle}>SELECT PRODUCTS</h3>
          <div className={styles.inputWithIcon} style={{ marginBottom: '12px' }}>
            <span className={styles.inputIcon}><Search size={14} /></span>
            <input type="text" placeholder="Search products..." className={styles.urlInput} style={{paddingLeft: '36px'}} />
          </div>
          <div className={styles.chipGroup}>
            {selectedProducts.map((product: string, idx: number) => (
              <div key={idx} className={styles.chip}>
                {product}
                <button type="button" onClick={() => removeItem(setSelectedProducts, idx)}><X size={12} /></button>
              </div>
            ))}
            <button type="button" className={styles.chip} style={{ borderStyle: 'dashed', cursor: 'pointer', background: 'transparent' }}>
              <Plus size={12} /> Add Product
            </button>
          </div>
        </div>
      )}

      {appliesTo === 'categories' && (
        <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
          <h3 className={styles.mediaBoxTitle}>SELECT CATEGORIES</h3>
          <div className={styles.inputWithIcon} style={{ marginBottom: '12px' }}>
            <span className={styles.inputIcon}><Search size={14} /></span>
            <input type="text" placeholder="Search categories..." className={styles.urlInput} style={{paddingLeft: '36px'}} />
          </div>
          <div className={styles.chipGroup}>
            {selectedCategories.map((category: string, idx: number) => (
              <div key={idx} className={styles.chip}>
                {category}
                <button type="button" onClick={() => removeItem(setSelectedCategories, idx)}><X size={12} /></button>
              </div>
            ))}
            <button type="button" className={styles.chip} style={{ borderStyle: 'dashed', cursor: 'pointer', background: 'transparent' }}>
              <Plus size={12} /> Add Category
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}
