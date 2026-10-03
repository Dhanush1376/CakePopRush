import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ClickHeartEffect = () => {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't spawn hearts if clicking on a button or link (so it doesn't conflict with other interactions)
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) return;

      const newHeart = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      
      setHearts(prev => [...prev, newHeart]);

      // Remove after 2000ms to allow a slower, floatier animation
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 5000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ 
              opacity: [0, 1, 1, 0.8, 0], 
              scale: [0, 1.6, 1.2, 1.4, 1.5],
              rotate: [-20, 15, -15, 10, 0],
              y: [0, -30, -60, -120, -180]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: heart.x - 40, // Centered for size 80
              top: heart.y - 40,
              pointerEvents: 'none',
              color: 'var(--color-brand-pink)',
              filter: 'drop-shadow(0px 8px 16px rgba(230, 48, 102, 0.6))',
              transformOrigin: 'center'
            }}
          >
            <Heart size={80} fill="var(--color-brand-pink)" strokeWidth={1.5} color="white" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
