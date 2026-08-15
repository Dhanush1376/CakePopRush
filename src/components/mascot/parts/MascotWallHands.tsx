import React from 'react';
import { motion } from 'framer-motion';

export const MascotWallHands = () => {
  return (
    <g id="wall-and-hands">
      {/* Wall / Ledge at y=215 to cut off the body exactly halfway */}
      <path 
        d="M 10 230 Q 10 215 30 215 L 270 215 Q 290 215 290 230 L 290 360 L 10 360 Z" 
        fill="#ffffff" 
      />

      {/* Left Paw (Gripping the wall) */}
      <g transform="translate(80, 215)">
        <g>
          <g transform="rotate(15)">
            <rect x="-11" y="-5" width="8" height="13" rx="4" fill="#1c1c1c" />
            <rect x="-4" y="-8" width="8" height="16" rx="4" fill="#1c1c1c" />
            <rect x="3" y="-5" width="8" height="13" rx="4" fill="#1c1c1c" />
          </g>
        </g>
      </g>

      {/* Right Paw (Gripping the wall) */}
      <g transform="translate(220, 215)">
        <g>
          <g transform="rotate(-15)">
            <rect x="-11" y="-5" width="8" height="13" rx="4" fill="#1c1c1c" />
            <rect x="-4" y="-8" width="8" height="16" rx="4" fill="#1c1c1c" />
            <rect x="3" y="-5" width="8" height="13" rx="4" fill="#1c1c1c" />
          </g>
        </g>
      </g>
    </g>
  );
};
