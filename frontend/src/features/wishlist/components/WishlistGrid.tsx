import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import styles from './WishlistGrid.module.css';
import { ProductCard } from '@/components/commerce/ProductCard';
import { useWishlist, WishlistProduct } from '@/features/wishlist';
import { useCart } from '@/features/cart';
import { useToast } from '@/components/ui/ToastContext';

export const WishlistGrid: React.FC = () => {
  const {
    items,
    filteredItems,
    removeFromWishlist,
    undoRemove,
    moveToCart,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
  } = useWishlist();
  const { addItem: addCartItem } = useCart();
  const { toast } = useToast();

  const handleRemove = (product: WishlistProduct) => {
    removeFromWishlist(product.id);
    toast({
      type: 'info',
      title: 'Removed from Wishlist',
      message: product.name,
      action: {
        label: 'Undo',
        onClick: () => undoRemove(),
      },
    });
  };

  const handleMoveToCart = async (product: WishlistProduct) => {
    await moveToCart(product, addCartItem);
  };

  // If items exist in wishlist, but the current filter / search matched 0 items
  if (items.length > 0 && filteredItems.length === 0) {
    return (
      <div className={styles.noFilterResults}>
        <SearchX size={44} className={styles.noResultsIcon} />
        <h3 className={styles.noResultsTitle}>No Matching Treats Found</h3>
        <p className={styles.noResultsSubtitle}>
          We couldn&apos;t find anything matching &ldquo;{searchQuery || filterCategory}&rdquo; in your saved list.
        </p>
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setFilterCategory('all');
          }}
          className={styles.resetFiltersBtn}
        >
          Show All Saved Treats ({items.length})
        </button>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <AnimatePresence mode="popLayout">
        {filteredItems.map((product) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
            key={product.id}
          >
            <div className={styles.gridCardWrapper}>
              <ProductCard
                product={product}
                isWishlisted={true}
                inWishlist={true}
                onMoveToCart={() => handleMoveToCart(product)}
                onToggleWishlist={() => handleRemove(product)}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
