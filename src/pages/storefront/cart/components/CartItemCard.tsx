import React from 'react';
import { motion } from 'framer-motion';
import { X, Truck, Info, Heart } from 'lucide-react';
import styles from './CartItemCard.module.css';
import { CartItem, useCart } from '@/lib/cartStore';
import { useWishlist } from '@/lib/wishlistStore';
import { ProductImage } from '@/components/commerce/ProductImage';
import { Price } from '@/components/commerce/Price';
import { QuantitySelector } from '@/components/commerce/QuantitySelector';
import { useToast } from '@/components/ui/ToastContext';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard = ({ item }: CartItemCardProps) => {
  const { removeItem, updateQuantity } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const handleRemove = () => {
    removeItem(item.id);
  };

  const handleMoveToWishlist = () => {
    if (!isInWishlist(item.product.id)) {
      addToWishlist(item.product);
      window.dispatchEvent(new Event('show-global-heart'));
    }
    removeItem(item.id);
    toast({
      type: 'success',
      title: 'Moved to wishlist',
      message: `${item.product.name} saved for later.`
    });
  };

  // Calculate dynamic delivery date (e.g., +2 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const deliveryString = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <motion.div 
      className={styles.card}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.imageContainer}>
        <ProductImage 
          src={item.product.images[0]?.url || ''} 
          alt={item.product.images[0]?.alt || item.product.name}
          aspectRatio="square"
        />
      </div>

      <div className={styles.details}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.name}>{item.product.name}</h3>
            {item.variantName && (
              <p className={styles.variant}>Variant: {item.variantName}</p>
            )}
          </div>
          <button className={styles.removeBtn} onClick={handleRemove} aria-label="Remove item">
            <X size={18} strokeWidth={1.5} />
            <span className={styles.removeText}>Remove</span>
          </button>
        </div>

        <div className={styles.priceRow}>
          <Price 
            amount={item.product.basePrice} 
            compareAtAmount={item.product.compareAtPrice || Math.round(item.product.basePrice * 1.25)} 
            size="sm" 
          />
        </div>

        <div className={styles.controlsRow}>
          <QuantitySelector 
            quantity={item.quantity} 
            onChange={(q) => updateQuantity(item.id, q)}
            min={1}
            max={99}
          />
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoBadge}>
            <Info size={14} strokeWidth={1.5} />
            <span>Non-Refundable</span>
          </div>
          <div className={styles.infoBadge}>
            <Truck size={14} strokeWidth={1.5} />
            <span>Delivery by {deliveryString}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.wishlistBtn} onClick={handleMoveToWishlist}>
            <Heart size={15} strokeWidth={1.5} />
            <span>MOVE TO WISHLIST</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
