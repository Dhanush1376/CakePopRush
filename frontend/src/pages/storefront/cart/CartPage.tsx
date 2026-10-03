import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CartPage.module.css';
import { Container } from '@/components/layout/Container';
import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { useToast } from '@/components/ui/ToastContext';
import { Trash2, Heart, Check } from 'lucide-react';
import { 
  CheckoutProgress,
  DeliveryAddressBar,
  CartItemCard,
  CartRecommendations,
  CouponSection,
  OrderSummary,
  MobileCheckoutBar,
  EmptyCart,
  CartPageSkeleton,
  getItemUnitPrice
} from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';

export const CartPage = () => {
  const { items, isLoading, subtotal, clearCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const location = useLocation();

  // Selected items state for matching reference design checkboxes
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => items.map(i => i.id));

  // Sync selected IDs when cart items change
  useEffect(() => {
    setSelectedItemIds(prev => {
      const currentValidIds = new Set(items.map(i => i.id));
      const next = prev.filter(id => currentValidIds.has(id));
      items.forEach(i => {
        if (!prev.includes(i.id)) next.push(i.id);
      });
      return next;
    });
  }, [items]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Container>
          <CartPageSkeleton />
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <Container>
          <EmptyCart />
        </Container>
      </div>
    );
  }

  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(i => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMoveAllToWishlist = () => {
    items.forEach(item => {
      if (!isInWishlist(item.product.id)) {
        addToWishlist(item.product);
      }
    });
    clearCart();
    toast({
      type: 'success',
      title: 'Moved to Wishlist',
      message: 'All items saved to your wishlist.',
    });
  };

  const selectedSubtotal = items
    .filter(i => selectedItemIds.includes(i.id))
    .reduce((sum, i) => sum + (getItemUnitPrice(i) * i.quantity), 0);

  return (
    <div className={styles.page}>
      <DeliveryAddressBar />
      <CheckoutProgress currentStep="cart" />
      <Container>
        
        <div className={styles.layout}>
          {/* LEFT SIDE: Cart Content */}
          <div className={styles.mainContent}>
            
            {/* Header: Checkbox 2/2 Items Selected (₹X,XXX) + Trash/Heart */}
            <div className={styles.itemsHeader}>
              <div 
                className={styles.itemsHeaderLeft} 
                onClick={toggleSelectAll}
                role="button"
                tabIndex={0}
                aria-label="Toggle select all items"
              >
                <div className={`${styles.pinkCheckbox} ${isAllSelected ? styles.checked : ''}`}>
                  {isAllSelected && <Check size={11} strokeWidth={3} color="#FFFFFF" />}
                </div>
                <span className={styles.itemsCountText}>
                  {selectedItemIds.length}/{items.length} Items Selected
                </span>
                <span className={styles.itemsSubtotalText}>
                  ({formatCurrency(selectedSubtotal)})
                </span>
              </div>

              <div className={styles.itemsHeaderRight}>
                <button className={styles.actionIconButton} onClick={clearCart} aria-label="Clear Cart">
                  <Trash2 size={17} strokeWidth={1.7} />
                </button>
                <button className={styles.actionIconButton} onClick={handleMoveAllToWishlist} aria-label="Move All to Wishlist">
                  <Heart size={17} strokeWidth={1.7} />
                </button>
              </div>
            </div>

            {/* Unified Card Container for all items, separated by dashed dividers */}
            <div className={styles.unifiedItemsCard}>
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <div className={styles.itemDivider} />}
                  <CartItemCard 
                    item={item} 
                    isSelected={selectedItemIds.includes(item.id)}
                    onToggleSelect={() => toggleSelectItem(item.id)}
                  />
                </React.Fragment>
              ))}
            </div>

            <CartRecommendations />
            
          </div>

          {/* RIGHT SIDE: Sticky Summary (Desktop) */}
          <div className={styles.sidebar}>
            <div className={styles.stickyWrapper}>
              <CouponSection />
              <OrderSummary />
            </div>
          </div>
        </div>
      </Container>

      {/* Sticky Bottom Bar (Mobile) */}
      <MobileCheckoutBar variant="yellow" />
    </div>
  );
};