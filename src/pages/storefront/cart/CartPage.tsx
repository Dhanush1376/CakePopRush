import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CartPage.module.css';
import { Container } from '@/components/layout/Container';
import { useCart } from '@/features/cart';

import { Trash2, Heart } from 'lucide-react';
import { 
  CheckoutProgress,
  DeliveryAddressBar,
  CartItemCard,
  CartRecommendations,
  CouponSection,
  OrderSummary,
  TrustBadges,
  MobileCheckoutBar,
  EmptyCart,
  CartPageSkeleton
} from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';

export const CartPage = () => {
  const { items, isLoading, subtotal, totalDiscount, clearCart } = useCart();
  const location = useLocation();

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

  return (
    <div className={styles.page}>
      <DeliveryAddressBar />
      <CheckoutProgress currentStep="cart" />
      <Container>
        
        <div className={styles.layout}>
          {/* LEFT SIDE: Cart Content */}
          <div className={styles.mainContent}>
            
            <div className={styles.itemsHeader}>
              <div className={styles.itemsHeaderLeft}>
                <h2 className={styles.itemsCountText}>{items.length} ITEM{items.length > 1 ? 'S' : ''} IN BAG</h2>
                <span className={styles.itemsSubtotalText}>({formatCurrency(subtotal - totalDiscount)})</span>
              </div>
              <div className={styles.itemsHeaderRight}>
                <button className={styles.actionIconButton} onClick={clearCart} aria-label="Clear Cart">
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
                <button className={styles.actionIconButton} aria-label="Move to Wishlist">
                  <Heart size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className={styles.itemsList}>
              {items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>

            <CartRecommendations />
            <CouponSection />
            
            <div className={styles.mobileTrustWrap}>
               <TrustBadges />
            </div>

          </div>

          {/* RIGHT SIDE: Sticky Summary (Desktop) */}
          <div className={styles.sidebar}>
            <div className={styles.stickyWrapper}>
              <OrderSummary />
              <div className={styles.desktopTrustWrap}>
                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Sticky Bottom Bar (Mobile) */}
      <MobileCheckoutBar variant="yellow" />
    </div>
  );
};