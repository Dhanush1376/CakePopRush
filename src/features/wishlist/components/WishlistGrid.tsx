import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WishlistGrid.module.css';
import { ProductCard } from '@/components/commerce/ProductCard';
import { useWishlist } from '@/features/wishlist';
import { useToast } from '@/components/ui/ToastContext';

export const WishlistGrid = () => {
  const { items, viewMode, sortBy, removeFromWishlist, undoRemove } = useWishlist();
  const { toast } = useToast();

  // Sorting logic
  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.basePrice - b.basePrice;
      case 'price-desc':
        return b.basePrice - a.basePrice;
      case 'popular':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'recent':
      default:
        // We'd normally sort by addedDate, but using ID string comparison for mockup
        return b.id.localeCompare(a.id);
    }
  });

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    toast({
      type: 'info',
      title: 'Removed from wishlist'
    });
  };

  return (
    <div className={`${styles.grid} ${styles[viewMode]}`}>
      <AnimatePresence mode="popLayout">
        {sortedItems.map((product) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            key={product.id}
          >
            <ProductCard 
              product={product} 
              isWishlisted={true}
              onToggleWishlist={() => handleRemove(product.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
