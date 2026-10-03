import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2 
} from 'lucide-react';
import styles from './WishlistHeader.module.css';
import { useWishlist } from '@/features/wishlist';
import { useCart } from '@/features/cart';

interface WishlistHeaderProps {
  itemCount: number;
}

export const WishlistHeader: React.FC<WishlistHeaderProps> = ({ itemCount }) => {
  const {
    items,
    filterCategory,
    setFilterCategory,
    categories,
    moveAllToCart,
    clearWishlist,
  } = useWishlist();
  const { addItem: addCartItem } = useCart();

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);

  const handleMoveAll = async () => {
    setIsMovingAll(true);
    try {
      await moveAllToCart(addCartItem);
    } finally {
      setIsMovingAll(false);
    }
  };

  const handleClear = async () => {
    await clearWishlist();
    setIsConfirmingClear(false);
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.titleWithBadge}>
            <h1 className={styles.title}>Wishlist</h1>
          </div>
        </div>

        {itemCount > 0 && (
          <div className={styles.headerPrimaryActions}>
            <button
              type="button"
              className={styles.moveAllBtn}
              onClick={handleMoveAll}
              disabled={isMovingAll}
              aria-label="Move all items to bag"
            >
              <ShoppingBag size={12} strokeWidth={2.2} />
              <span>{isMovingAll ? 'Moving...' : 'Move All to Bag'}</span>
            </button>

            {isConfirmingClear ? (
              <div className={styles.confirmGroup}>
                <span className={styles.confirmText}>Clear all?</span>
                <button
                  type="button"
                  className={styles.confirmYesBtn}
                  onClick={handleClear}
                  aria-label="Confirm clear wishlist"
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={styles.confirmCancelBtn}
                  onClick={() => setIsConfirmingClear(false)}
                  aria-label="Cancel clear wishlist"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setIsConfirmingClear(true)}
                title="Clear all wishlist items"
                aria-label="Clear wishlist"
              >
                <Trash2 size={12} strokeWidth={2.2} />
                <span className={styles.clearBtnText}>Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Pills if more than 1 category exists */}
      {itemCount > 0 && categories.length > 1 && (
        <div className={styles.categoriesRow} role="tablist" aria-label="Filter by category">
          <button
            type="button"
            className={`${styles.categoryPill} ${filterCategory === 'all' ? styles.categoryPillActive : ''}`}
            onClick={() => setFilterCategory('all')}
            role="tab"
            aria-selected={filterCategory === 'all'}
          >
            All Items ({itemCount})
          </button>
          {categories.map((cat) => {
            const catCount = items.filter(
              (i) => (i.categoryName || '').toLowerCase() === cat.toLowerCase()
            ).length;
            return (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryPill} ${
                  filterCategory.toLowerCase() === cat.toLowerCase() ? styles.categoryPillActive : ''
                }`}
                onClick={() => setFilterCategory(cat)}
                role="tab"
                aria-selected={filterCategory.toLowerCase() === cat.toLowerCase()}
              >
                {cat} ({catCount})
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
