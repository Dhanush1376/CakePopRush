import React from 'react';
import { X, Info, Check } from 'lucide-react';
import styles from './CartItemCard.module.css';
import { CartItem, useCart, getItemUnitPrice, getItemCompareAtPrice } from '@/features/cart';
import { ProductImage } from '@/components/commerce/ProductImage';
import { QuantitySelector } from '@/components/commerce/QuantitySelector';
import { formatCurrency } from '@/lib/formatters/currency';

interface CartItemCardProps {
  item: CartItem;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isFirst?: boolean;
}

export const CartItemCard = ({ 
  item, 
  isSelected = true, 
  onToggleSelect,
  isFirst = false 
}: CartItemCardProps) => {
  const { removeItem, updateQuantity } = useCart();

  const handleRemove = () => {
    removeItem(item.id);
  };

  const price = getItemUnitPrice(item);
  const compareAt = getItemCompareAtPrice(item);
  const discount = compareAt > price ? compareAt - price : 0;

  return (
    <div className={styles.itemRow}>
      {/* LEFT: Image with overlaid pink checkbox */}
      <div className={styles.imageCol}>
        <div 
          className={`${styles.imageCheckbox} ${isSelected ? styles.checked : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          role="checkbox"
          aria-checked={isSelected}
          tabIndex={0}
        >
          {isSelected && <Check size={11} strokeWidth={3} color="#FFFFFF" />}
        </div>
        <div className={styles.imageContainer}>
          <ProductImage 
            src={item.product.images[0]?.url || ''} 
            alt={item.product.images[0]?.alt || item.product.name}
            aspectRatio="portrait"
          />
        </div>
      </div>

      {/* RIGHT: Content info */}
      <div className={styles.detailsCol}>
        {/* Header row with Product Title & Close button */}
        <div className={styles.brandRow}>
          <div>
            <h3 className={styles.productTitle}>{item.product.name}</h3>
            {(item.variantName || item.customization?.quantityName) && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #7A685D)', marginTop: '2px', fontWeight: 500 }}>
                {item.variantName}
                {item.customization?.quantityName && item.customization.quantityName !== item.variantName
                  ? ` • ${item.customization.quantityName}`
                  : ''}
              </p>
            )}
          </div>
          <button className={styles.closeBtn} onClick={handleRemove} aria-label="Remove item">
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Quantity Stepper (previous design) */}
        <div className={styles.controlsRow}>
          <QuantitySelector 
            quantity={item.quantity} 
            onChange={(q) => updateQuantity(item.id, q)}
            min={1}
            max={99}
          />
        </div>

        {/* Price Row: Current, Original, Discount */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>{formatCurrency(price)}</span>
          {compareAt > price && (
            <>
              <span className={styles.comparePrice}>{formatCurrency(compareAt)}</span>
              <span className={styles.discountText}>{formatCurrency(discount)} Off</span>
            </>
          )}
        </div>

        {/* Return policy line */}
        <div className={styles.policyRow}>
          <Info size={13} strokeWidth={1.8} className={styles.policyIcon} />
          <span>Non-returnable</span>
        </div>
      </div>
    </div>
  );
};
