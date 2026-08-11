import React from 'react';
import { motion } from 'framer-motion';
import { LEFT_CHEEK, RIGHT_CHEEK } from '../config/mascotConfig';
import { BLUSH_COLOR } from '../config/mascotConstants';

export const MascotCheeks = () => {
  return (
    <g id="cheeks">
      <g transform={`translate(${LEFT_CHEEK.cx}, ${LEFT_CHEEK.cy})`}>
        <motion.g id="left-cheek" style={{ originX: '0px', originY: '0px' }} initial={{ opacity: 0 }}>
          <ellipse cx="0" cy="0" rx={LEFT_CHEEK.rx} ry={LEFT_CHEEK.ry} fill={BLUSH_COLOR} opacity={0.5} />
        </motion.g>
      </g>
      <g transform={`translate(${RIGHT_CHEEK.cx}, ${RIGHT_CHEEK.cy})`}>
        <motion.g id="right-cheek" style={{ originX: '0px', originY: '0px' }} initial={{ opacity: 0 }}>
          <ellipse cx="0" cy="0" rx={RIGHT_CHEEK.rx} ry={RIGHT_CHEEK.ry} fill={BLUSH_COLOR} opacity={0.5} />
        </motion.g>
      </g>
    </g>
  );
};
