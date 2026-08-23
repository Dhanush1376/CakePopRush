import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './EmptyCart.module.css';
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState';
import { CartRecommendations } from './CartRecommendations';
import { MascotReaction } from '@/components/mascot/reactions/reactionTypes';
import { useCart } from '@/features/cart';
import { productData } from '@/features/products';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';
import { Product } from '@/types/product';

const EMPTY_STATES: { message: string, reaction: MascotReaction }[] = [
  { message: "Your cart is feeling lonely 🥺", reaction: "pleadingCute" },
  { message: "It's a little empty in here...", reaction: "sad" },
  { message: "I'm ready when you are!", reaction: "happy" },
  { message: "Waiting for some treats...", reaction: "tired" },
  { message: "Let's find something delicious.", reaction: "determined" },
];

export const EmptyCart = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { triggerReaction } = useMascotOrchestrator();

  const [emptyState, setEmptyState] = React.useState(EMPTY_STATES[0]);
  
  React.useEffect(() => {
    setEmptyState(EMPTY_STATES[Math.floor(Math.random() * EMPTY_STATES.length)]);
  }, []);

  const handleTreatMe = async () => {
    try {
      // Pick a featured product as the "treat"
      const featured = await productData.getFeaturedProducts(3);
      if (featured && featured.length > 0) {
        const treat = featured[Math.floor(Math.random() * featured.length)];
        addItem({
          product: treat,
          quantity: 1
        });
        triggerReaction('product:treat-me');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <MascotEmptyState 
          message={emptyState.message} 
          reaction={emptyState.reaction} 
        />
        
        <h1 className={styles.title}>Your bag is empty.</h1>
        <p className={styles.subtitle}>Looks like your cart is waiting for some sweet treats! &hearts;</p>
        
        <div className={styles.actionWrap}>
          <button 
            className={styles.exploreLink}
            onClick={() => navigate('/shop')}
          >
            <span>Explore Collections</span>
            <ArrowRight size={22} strokeWidth={2.5} />
          </button>
          
          <button 
            className={styles.treatMeBtn}
            onClick={handleTreatMe}
          >
            <span>Surprise Treat Me! ✨</span>
          </button>
        </div>
      </div>
      
      <div className={styles.recommendationsWrap}>
        <CartRecommendations />
      </div>
    </div>
  );
};
