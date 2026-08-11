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

      // Remove after 300ms as requested
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 300);
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
            initial={{ opacity: 0, scale: 0.2, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            exit={{ opacity: 0, scale: 1.2, y: -40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: heart.x - 16, 
              top: heart.y - 16,
              pointerEvents: 'none',
              color: 'var(--color-brand-pink)'
            }}
          >
            <Heart size={32} fill="var(--color-brand-pink)" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
