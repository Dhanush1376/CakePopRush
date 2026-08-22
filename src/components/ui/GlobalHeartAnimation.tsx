import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalHeartAnimation = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleShowHeart = () => {
      setShow(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShow(false), 2000); 
    };

    window.addEventListener('show-global-heart', handleShowHeart);
    return () => {
      window.removeEventListener('show-global-heart', handleShowHeart);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence>
        {show && (
          <motion.div
            key="global-heart"
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.1, 1], 
              y: [0, -40, -120]
            }}
            exit={{ opacity: 0, scale: 0.8, y: -150 }}
            transition={{ 
              duration: 1.5, 
              ease: 'easeOut',
              times: [0, 0.08, 1] // Pops up very fast (8%), then fades slowly (92%)
            }}
            style={{
              color: 'var(--color-brand-pink)',
              pointerEvents: 'none',
              transformOrigin: 'center'
            }}
          >
            <Heart size={80} fill="var(--color-brand-pink)" stroke="none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
