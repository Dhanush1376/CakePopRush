import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalHeartAnimation = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleShowHeart = () => {
      setShow(true);
      setTimeout(() => setShow(false), 300); // 0.3 seconds as requested
    };

    window.addEventListener('show-global-heart', handleShowHeart);
    return () => window.removeEventListener('show-global-heart', handleShowHeart);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            exit={{ opacity: 0, scale: 1.1, y: -80 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              color: 'var(--color-brand-pink)',
              pointerEvents: 'none',
              filter: 'drop-shadow(0px 8px 16px rgba(230, 48, 102, 0.4))'
            }}
          >
            <Heart size={100} fill="var(--color-brand-pink)" stroke="none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
