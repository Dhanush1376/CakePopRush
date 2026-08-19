import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './EmptyCart.module.css';
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState';
import { CartRecommendations } from './CartRecommendations';

export const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <MascotEmptyState 
          message="Your cart is feeling lonely 🥺" 
          reaction="pleadingCute" 
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
        </div>
      </div>
      
      <div className={styles.recommendationsWrap}>
        <CartRecommendations />
      </div>
    </div>
  );
};
