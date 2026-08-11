import React from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyWishlistIllustration = ({ className = '' }: { className?: string }) => {
  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Soft Blob/Glow */}
      <motion.svg 
        viewBox="0 0 200 200" 
        style={{ position: 'absolute', width: '140%', height: '140%', zIndex: 0 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4E6" stopOpacity="1" />
            <stop offset="70%" stopColor="#FFF4E6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFF4E6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#glow)" />
        {/* Soft organic blob */}
        <path d="M100 20 C140 20, 180 50, 180 100 C180 150, 130 180, 100 180 C50 180, 20 140, 20 100 C20 60, 60 20, 100 20 Z" fill="#FFF9F3" opacity="0.8" />
      </motion.svg>

      {/* Main Composition Container */}
      <motion.div 
        style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', minWidth: '160px', minHeight: '160px', maxWidth: '240px', maxHeight: '240px' }}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        {/* Floating Heart */}
        <motion.div
          style={{ position: 'absolute', top: '15%', left: '50%', marginLeft: '-28px', color: '#F72585', zIndex: 10 }}
          initial={{ scale: 0.5, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.4
          }}
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart size={56} fill="#F72585" strokeWidth={2} />
          </motion.div>
        </motion.div>

        {/* Gift Box / Container Base */}
        <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', width: '55%', height: '40%', zIndex: 5 }}>
           <svg viewBox="0 0 100 80" width="100%" height="100%">
             {/* Box Inside/Back */}
             <polygon points="10,20 90,20 80,70 20,70" fill="#E8D5C4" />
             {/* Box Front */}
             <polygon points="5,30 95,30 85,75 15,75" fill="#FFF0E3" stroke="#D4A373" strokeWidth="2" strokeLinejoin="round" />
             {/* Box Flaps */}
             <polygon points="5,30 20,10 90,10 95,30" fill="#F4E6D8" stroke="#D4A373" strokeWidth="2" strokeLinejoin="round" />
           </svg>
        </div>

        {/* Small Treats (Cake Pops) */}
        <motion.div 
          style={{ position: 'absolute', bottom: '15%', left: '15%', width: '25%', height: '30%', zIndex: 8 }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.6 }}
        >
           <svg viewBox="0 0 32 40" width="100%" height="100%">
             <line x1="8" y1="36" x2="16" y2="24" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" />
             <circle cx="18" cy="18" r="12" fill="#F72585" />
             {/* Drizzles */}
             <path d="M10 14 Q18 8 26 14" stroke="#FFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
             <path d="M8 20 Q18 14 28 20" stroke="#FFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
           </svg>
        </motion.div>
        
        <motion.div 
          style={{ position: 'absolute', bottom: '25%', right: '12%', width: '28%', height: '32%', zIndex: 4 }}
          initial={{ scale: 0, rotate: 20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.7 }}
        >
           <svg viewBox="0 0 36 40" width="100%" height="100%">
             <line x1="26" y1="38" x2="20" y2="26" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" />
             <circle cx="16" cy="18" r="14" fill="#5B3A29" />
             {/* Sprinkles */}
             <line x1="10" y1="14" x2="14" y2="12" stroke="#F72585" strokeWidth="2" strokeLinecap="round" />
             <line x1="18" y1="10" x2="22" y2="14" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
             <line x1="14" y1="22" x2="18" y2="24" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
           </svg>
        </motion.div>

        {/* Decorative Sparkles & Stars */}
        <motion.div style={{ position: 'absolute', top: '15%', left: '15%', color: '#D4A373', zIndex: 2 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
          <Star size={14} fill="currentColor" />
        </motion.div>
        <motion.div style={{ position: 'absolute', top: '30%', right: '15%', color: '#F72585', zIndex: 2 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}>
          <Sparkles size={18} />
        </motion.div>
        <motion.div style={{ position: 'absolute', bottom: '35%', left: '25%', color: '#4ECDC4', zIndex: 2 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }} />
        </motion.div>
        <motion.div style={{ position: 'absolute', top: '50%', left: '10%', color: '#F72585', zIndex: 2 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
        </motion.div>
        <motion.div style={{ position: 'absolute', bottom: '15%', right: '35%', color: '#F72585', zIndex: 12 }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'currentColor' }} />
        </motion.div>
      </motion.div>
    </div>
  );
};
