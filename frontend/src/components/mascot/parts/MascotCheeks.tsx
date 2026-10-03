import React from 'react';
import { motion } from 'framer-motion';
import { LEFT_CHEEK, RIGHT_CHEEK } from '../config/mascotConfig';
import { BLUSH_COLOR } from '../config/mascotConstants';

export const MascotCheeks = () => {
  return (
    <g id="cheeks">
      <defs>
        <radialGradient id="blush-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BLUSH_COLOR} stopOpacity="1" />
          <stop offset="70%" stopColor={BLUSH_COLOR} stopOpacity="0.5" />
          <stop offset="100%" stopColor={BLUSH_COLOR} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(${LEFT_CHEEK.cx}, ${LEFT_CHEEK.cy})`}>
        <motion.g id="left-cheek" style={{ originX: '0px', originY: '0px' }} initial={{ opacity: 0 }}>
          <ellipse cx="0" cy="0" rx={LEFT_CHEEK.rx} ry={LEFT_CHEEK.ry} fill="url(#blush-grad)" />
        </motion.g>
      </g>
      <g transform={`translate(${RIGHT_CHEEK.cx}, ${RIGHT_CHEEK.cy})`}>
        <motion.g id="right-cheek" style={{ originX: '0px', originY: '0px' }} initial={{ opacity: 0 }}>
          <ellipse cx="0" cy="0" rx={RIGHT_CHEEK.rx} ry={RIGHT_CHEEK.ry} fill="url(#blush-grad)" />
        </motion.g>
      </g>
    </g>
  );
};
