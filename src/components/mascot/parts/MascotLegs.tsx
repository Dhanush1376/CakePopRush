import React from 'react';
import { motion } from 'framer-motion';
import { LEFT_HIP, RIGHT_HIP, LEG } from '../config/mascotConfig';
import { LIMB_BLACK } from '../config/mascotConstants';

export const MascotLegs = () => {
  return (
    <g id="legs">
      {/* Left Leg */}
      <g transform={`translate(${LEFT_HIP.x}, ${LEFT_HIP.y})`}>
        <motion.g id="left-leg" style={{ originX: '50%', originY: '50%' }}>
          {/* Transparent bounding box for perfect center origin at 0,0 */}
          <circle cx="0" cy="0" r="60" fill="none" pointerEvents="none" />
          <path
            d="M 0 0 L -7 52"
            fill="none"
            stroke={LIMB_BLACK}
            strokeWidth={LEG.strokeWidth}
            strokeLinecap="round"
          />
          <ellipse cx="-9" cy="55" rx="11" ry="7" fill={LIMB_BLACK} />
        </motion.g>
      </g>

      {/* Right Leg */}
      <g transform={`translate(${RIGHT_HIP.x}, ${RIGHT_HIP.y})`}>
        <motion.g id="right-leg" style={{ originX: '50%', originY: '50%' }}>
          {/* Transparent bounding box for perfect center origin at 0,0 */}
          <circle cx="0" cy="0" r="60" fill="none" pointerEvents="none" />
          <path
            d="M 0 0 L 7 52"
            fill="none"
            stroke={LIMB_BLACK}
            strokeWidth={LEG.strokeWidth}
            strokeLinecap="round"
          />
          <ellipse cx="9" cy="55" rx="11" ry="7" fill={LIMB_BLACK} />
        </motion.g>
      </g>
    </g>
  );
};
