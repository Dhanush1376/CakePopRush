import React from 'react';
import { motion } from 'framer-motion';
import { LEFT_SHOULDER, RIGHT_SHOULDER, ARM } from '../config/mascotConfig';
import { LIMB_BLACK } from '../config/mascotConstants';

export const MascotFrontArms = () => {
  return (
    <g id="front-arms">
      {/* Left Front Arm (For poses where hands cross the body) */}
      <g transform={`translate(${LEFT_SHOULDER.x}, ${LEFT_SHOULDER.y})`}>
        <motion.g id="left-arm-front" style={{ originX: '50%', originY: '50%', opacity: 0 }}>
          <circle cx="0" cy="0" r="80" fill="none" pointerEvents="none" />
          <path
            id="left-arm-front-path"
            d="M 0 0 C -5 25 -10 50 -15 75"
            fill="none"
            stroke={LIMB_BLACK}
            strokeWidth={ARM.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </g>

      {/* Right Front Arm */}
      <g transform={`translate(${RIGHT_SHOULDER.x}, ${RIGHT_SHOULDER.y})`}>
        <motion.g id="right-arm-front" style={{ originX: '50%', originY: '50%', opacity: 0 }}>
          <circle cx="0" cy="0" r="80" fill="none" pointerEvents="none" />
          <path
            id="right-arm-front-path"
            d="M 0 0 C 5 25 10 50 15 75"
            fill="none"
            stroke={LIMB_BLACK}
            strokeWidth={ARM.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </g>
    </g>
  );
};
