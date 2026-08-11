import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotAccessoriesProps {
  showSunglasses?: boolean;
  showPartyHat?: boolean;
  showPartyBlower?: boolean;
}

export const MascotAccessories: React.FC<MascotAccessoriesProps> = ({
  showSunglasses = false,
  showPartyHat = false,
  showPartyBlower = false,
}) => {
  return (
    <motion.g id="accessories-group">
      <AnimatePresence>
        {showSunglasses && (
          <motion.g
            key="sunglasses"
            id="sunglasses"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Sunglasses frame (scaled up 1.5x, centered around cx=150) */}
            <path d="M 90 150 Q 150 150 210 150 Q 217.5 150 217.5 157.5 L 210 172.5 Q 202.5 187.5 187.5 187.5 Q 172.5 187.5 157.5 172.5 L 150 165 L 142.5 172.5 Q 127.5 187.5 112.5 187.5 Q 97.5 187.5 90 172.5 L 82.5 157.5 Q 82.5 150 90 150 Z" fill="#222" />
            <path d="M 90 150 Q 150 150 210 150" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
            {/* Reflections */}
            <path d="M 97.5 157.5 L 127.5 157.5 L 112.5 180 Z" fill="#FFF" opacity="0.2" />
            <path d="M 172.5 157.5 L 202.5 157.5 L 187.5 180 Z" fill="#FFF" opacity="0.2" />
          </motion.g>
        )}

        {showPartyHat && (
          <motion.g
            key="party-hat"
            id="party-hat"
            initial={{ y: -20, opacity: 0, scale: 0 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0 }}
          >
            <g transform="translate(175, 35) rotate(20)">
              {/* Yellow base cone */}
              <polygon points="-22,0 0,-55 22,0" fill="#FFE7A3" />
              {/* Purple bottom stripe */}
              <polygon points="-22,0 -16,-15 16,-15 22,0" fill="#79529E" />
              {/* Blue middle stripe */}
              <polygon points="-12,-25 -8,-35 8,-35 12,-25" fill="#4DB9E6" />
              {/* Purple top stripe */}
              <polygon points="-6,-40 -2,-50 2,-50 6,-40" fill="#79529E" />
              {/* Pompom */}
              <circle cx="0" cy="-55" r="9" fill="#FFE7A3" />
            </g>
          </motion.g>
        )}

        {showPartyBlower && (
          <motion.g
            key="party-blower"
            id="party-blower"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            style={{ transformOrigin: '145px 174px' }}
          >
            {/* The straight tube */}
            <path d="M 145 174 L 80 174" stroke="#582A72" strokeWidth="14" strokeLinecap="round" />
            {/* The tightly rolled coil at the end */}
            <circle cx="76" cy="174" r="12" fill="#582A72" />
            {/* Spiral illusion inside the coil */}
            <path d="M 76 182 A 8 8 0 1 1 84 174" fill="none" stroke="#FFE7A3" strokeWidth="3" strokeLinecap="round" />
            <circle cx="76" cy="174" r="2.5" fill="#4DB9E6" />
            {/* Confetti decorations on the tube */}
            <rect x="130" y="169" width="5" height="8" fill="#4DB9E6" rx="1" transform="rotate(-15 132 173)" />
            <rect x="110" y="169" width="6" height="7" fill="#FFE7A3" rx="1" transform="rotate(25 113 172)" />
            <rect x="92" y="170" width="5" height="7" fill="#4DB9E6" rx="1" transform="rotate(-10 94 173)" />
          </motion.g>
        )}
      </AnimatePresence>
    </motion.g>
  );
};
