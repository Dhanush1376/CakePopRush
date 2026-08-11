import React from 'react';
import { motion } from 'framer-motion';
import { BROW } from '../config/mascotConfig';
import { LIMB_BLACK } from '../config/mascotConstants';

export const MascotEyebrows = () => {
  return (
    <g id="eyebrows">
      <motion.g id="left-eyebrow" style={{ originX: '50%', originY: '50%' }}>
        <path
          d="M 95.8 113 C 102 103 112 102 118.7 108.3"
          fill="none"
          stroke={LIMB_BLACK}
          strokeWidth={BROW.strokeWidth}
          strokeLinecap="round"
        />
      </motion.g>

      <motion.g id="right-eyebrow" style={{ originX: '50%', originY: '50%' }}>
        <path
          d="M 204.2 113 C 198 103 188 102 181.3 108.3"
          fill="none"
          stroke={LIMB_BLACK}
          strokeWidth={BROW.strokeWidth}
          strokeLinecap="round"
        />
      </motion.g>
    </g>
  );
};
