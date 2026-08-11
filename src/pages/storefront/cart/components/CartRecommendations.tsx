import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './CartRecommendations.module.css';
import sharedStyles from './CartComponents.module.css';
import { ProductCard } from '@/components/commerce/ProductCard';
import { getRelatedProducts } from '@/mocks/products';
import { useCart } from '@/lib/cartStore';
import { useToast } from '@/components/ui/ToastContext';

export const CartRecommendations = () => {
  const { items, addItem } = useCart();
  const { toast } = useToast();
  
  // Get some recommendations based on the first item in cart, or just random/bestsellers if empty
  const baseProductId = items.length > 0 ? items[0].product.id : 'prod_1';
  const recommendedProducts = getRelatedProducts(baseProductId, 4);

  if (recommendedProducts.length === 0) return null;

  const handleAddToCart = (productId: string) => {
    const product = recommendedProducts.find(p => p.id === productId);
    if (product) {
      addItem({ product, quantity: 1 });
      toast({
        type: 'success',
        title: 'Added to bag'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={sharedStyles.sectionHeader}>
        <h2 className={sharedStyles.sectionTitle}>YOU MAY ALSO LIKE</h2>
        <Link to="/shop" className={sharedStyles.actionLink}>
          VIEW ALL <ArrowRight size={16} />
        </Link>
      </div>

      <div className={styles.scrollContainer}>
        <div className={styles.productGrid}>
          {recommendedProducts.map((product) => (
            <div key={product.id} className={styles.productWrapper}>
              <ProductCard 
                product={product} 
                onAddToCart={handleAddToCart}
                // isWishlisted logic would go here if connected to wishlist store per-item
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
