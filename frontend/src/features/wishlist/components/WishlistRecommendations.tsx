import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './WishlistRecommendations.module.css';
import { ProductCard } from '@/components/commerce/ProductCard';
import { productData } from '@/features/products';
import { useWishlist } from '@/features/wishlist';
import { useToast } from '@/components/ui/ToastContext';

export const WishlistRecommendations: React.FC = () => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const [allProducts, setAllProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    productData.getProducts().then((products: any) => {
      setAllProducts(products || []);
    });
  }, []);

  const recommendedProducts = React.useMemo(() => {
    const unselected = allProducts.filter((p) => !isInWishlist(p.id));
    return (unselected.length >= 4 ? unselected : allProducts).slice(0, 4);
  }, [allProducts, isInWishlist]);

  const handleToggleWishlist = async (product: any) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      toast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: product.name,
      });
    } else {
      await addToWishlist(product);
      toast({
        type: 'success',
        title: 'Saved to Wishlist! 💖',
        message: product.name,
      });
    }
  };

  if (recommendedProducts.length === 0) return null;

  return (
    <section className={styles.container} aria-label="Recommended Treats">
      <div className={styles.header}>
        <h3 className={styles.title}>You May Also Like</h3>
        <Link to="/shop" className={styles.viewAllLink}>
          <span>VIEW ALL</span> <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      <div className={styles.grid}>
        {recommendedProducts.map((product: any) => (
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
