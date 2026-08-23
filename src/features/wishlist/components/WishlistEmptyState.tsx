import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './WishlistEmptyState.module.css';
import { MascotEmptyState } from '@/components/mascot/MascotEmptyState';
import { WishlistRecommendations } from './WishlistRecommendations';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MascotReaction } from '@/components/mascot/reactions/reactionTypes';

const EMPTY_STATES: { message: string, reaction: MascotReaction }[] = [
  { message: "Your wishlist is empty!\nSave your favorites here.", reaction: "pleadingCute" },
  { message: "Nothing here yet.\nLet's find something sweet!", reaction: "confused" },
  { message: "I'll keep your favorites safe.\nWhenever you find them!", reaction: "happy" },
  { message: "Still looking for the perfect treat?", reaction: "tired" },
];

export const WishlistEmptyState: React.FC = () => {
  const [emptyState, setEmptyState] = React.useState(EMPTY_STATES[0]);
  
  React.useEffect(() => {
    setEmptyState(EMPTY_STATES[Math.floor(Math.random() * EMPTY_STATES.length)]);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.emptyHero}>
        {/* Visual Composition - Pleading Cute Mascot */}
        <motion.div 
          className={styles.illustrationWrapper}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <MascotEmptyState 
            message={emptyState.message} 
            reaction={emptyState.reaction} 
            size="medium"
          />
        </motion.div>
        
        {/* Text Content */}
        <motion.div 
          className={styles.textContent}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
        >
          <h2 className={styles.title}>Your wishlist is empty.</h2>
          <p className={styles.subtitle}>
            Looks like your wishlist is waiting for some sweet treats! &hearts;
          </p>
        </motion.div>
        
        {/* Actions */}
        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
        >
          <Link to="/shop" className={styles.primaryAction}>
            <span>Explore Collections</span> <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>

      {/* Recommendations Section Below */}
      <WishlistRecommendations />
    </div>
  );
};
