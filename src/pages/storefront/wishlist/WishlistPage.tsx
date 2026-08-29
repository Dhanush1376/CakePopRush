import React from 'react';
import styles from './WishlistPage.module.css';
import { Container } from '@/components/layout/Container';
import { useWishlist } from '@/features/wishlist';

import { 
  WishlistHeader,
  WishlistGrid,
  WishlistSkeleton,
  WishlistEmptyState,
  WishlistErrorState,
  WishlistMascot 
} from '@/features/wishlist';
import { FrostingCorner } from '@/pages/storefront/custom-orders/components/FrostingCorner';

export const WishlistPage = () => {
  const { items, isLoading, error, refresh } = useWishlist();

  React.useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  // Loading state with skeleton grid
  if (isLoading) {
    return (
      <div className={styles.page}>
        <FrostingCorner position="topRight" />
        <Container>
          <WishlistHeader itemCount={0} />
        </Container>
        <div className={styles.gridSection}>
          <WishlistMascot />
          <Container>
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <WishlistSkeleton key={i} />
              ))}
            </div>
          </Container>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.page}>
        <FrostingCorner position="topRight" />
        <Container>
          <WishlistHeader itemCount={0} />
          <div className={styles.errorWrapper}>
            <WishlistErrorState onRetry={refresh} />
          </div>
        </Container>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <FrostingCorner position="topRight" />
        <Container>
          <div className={styles.emptyWrapper}>
            <WishlistEmptyState />
          </div>
        </Container>
      </div>
    );
  }

  // Content state
  return (
    <div className={styles.page}>
      <FrostingCorner position="topRight" />
      <Container>
        <WishlistHeader itemCount={items.length} />
      </Container>
      <div className={styles.gridSection}>
        <WishlistMascot />
        <Container>
          <WishlistGrid />
        </Container>
      </div>
    </div>
  );
};
