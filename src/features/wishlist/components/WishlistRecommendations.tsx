import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './WishlistRecommendations.module.css';
import { ProductCard } from '@/components/commerce/ProductCard';
import { productData } from '@/features/products';
import { useWishlist } from '@/features/wishlist';

export const WishlistRecommendations: React.FC = () => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Pick 4 popular / bestselling products
  const recommendedProducts = productData.getProducts().slice(0, 4);

  const handleToggleWishlist = (product: ReturnType<typeof productData.getProducts>[0]) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <section className={styles.container} aria-label="Recommended Treats">
      <div className={styles.header}>
        <h3 className={styles.title}>YOU MAY ALSO LIKE</h3>
        <Link to="/shop" className={styles.viewAllLink}>
          <span>VIEW ALL</span> <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      <div className={styles.grid}>
        {recommendedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={isInWishlist(product.id)}
            onToggleWishlist={() => handleToggleWishlist(product)}
          />
        ))}
      </div>
    </section>
  );
};
