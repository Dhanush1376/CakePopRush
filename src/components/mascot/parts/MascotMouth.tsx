import React from 'react';
import { motion, Variants } from 'framer-motion';
import { MOUTH } from '../config/mascotConfig';
import { LIMB_BLACK, MASCOT_PINK, MASCOT_TONGUE } from '../config/mascotConstants';

export type MascotMouthShape =
  | 'neutral' | 'smallSmile' | 'happy' | 'openSmile'
  | 'laugh' | 'oMouth' | 'tinyOops' | 'frown' | 'tiredFrown' | 'uncertain'
  | 'tongue' | 'yawn' | 'confident' | 'sleepySmile' | 'kiss' | 'blowMouth';

interface MascotMouthProps {
  shape?: MascotMouthShape;
}

const v: Variants = {
  on: { opacity: 1 },
  off: { opacity: 0 },
};
const t = { duration: 0.15 };

export const MascotMouth: React.FC<MascotMouthProps> = ({ shape = 'neutral' }) => {
  return (
    <motion.g id="mouth">

      {/* Happy — The canonical SVG path */}
      <motion.g id="mouth-happy" variants={v} initial="off" animate={shape === 'happy' ? 'on' : 'off'} transition={t}>
        <path
          d="M 129.2 178.4 C 131 170, 142 176, 149.5 176 C 157 176, 168 170, 169.8 178.4 C 169 192, 160 201.6, 149.5 201.6 C 139 201.6, 130 192, 129.2 178.4 Z"
          fill={LIMB_BLACK}
        />
        <ellipse cx="149.5" cy="193.5" rx="11.5" ry="6.5" fill={MASCOT_TONGUE} />
      </motion.g>

      <g transform={`translate(${MOUTH.cx}, ${MOUTH.cy})`}>
        {/* Morphing Smile/Frown */}
        <motion.path
          animate={{
            d: shape === 'frown' ? "M -7 4 Q 0 -2 7 4" :
               shape === 'tiredFrown' ? "M -9 4 Q 0 -4 9 4" :
               shape === 'smallSmile' ? "M -10 -1 Q 0 8 10 -1" :
               "M -16 -4 Q 0 14 16 -4",
            strokeWidth: shape === 'frown' ? 3.5 : 
                         shape === 'tiredFrown' ? 4.5 : 
                         shape === 'smallSmile' ? 3.5 : 5,
            opacity: ['neutral', 'frown', 'tiredFrown', 'smallSmile'].includes(shape) ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          fill="none" stroke={LIMB_BLACK} strokeLinecap="round"
        />

        {/* Open Smile — filled crescent */}
        <motion.path
          d="M -14 -2 Q 0 12 14 -2 Z"
          fill={LIMB_BLACK} stroke={LIMB_BLACK} strokeWidth="1.5" strokeLinejoin="round"
          variants={v} initial="off" animate={shape === 'openSmile' ? 'on' : 'off'} transition={t}
        />

        {/* Laugh — very wide open */}
        <motion.path
          d="M -18 -5 Q 0 18 18 -5 Z"
          fill={LIMB_BLACK} stroke={LIMB_BLACK} strokeWidth="1.5" strokeLinejoin="round"
          variants={v} initial="off" animate={shape === 'laugh' ? 'on' : 'off'} transition={t}
        />

        {/* O-Mouth (Surprised) */}
        <motion.circle
          cx="0" cy="2" r="6"
          fill={LIMB_BLACK}
          variants={v} initial="off" animate={shape === 'oMouth' ? 'on' : 'off'} transition={t}
        />

        {/* Tiny Oops */}
        <motion.ellipse
          cx="0" cy="2" rx="4" ry="3"
          fill={LIMB_BLACK}
          variants={v} initial="off" animate={shape === 'tinyOops' ? 'on' : 'off'} transition={t}
        />

        {/* Uncertain — wiggly */}
        <motion.path
          d="M -10 1 Q -5 -4 0 1 T 10 1"
          fill="none" stroke={LIMB_BLACK} strokeWidth="3" strokeLinecap="round"
          variants={v} initial="off" animate={shape === 'uncertain' ? 'on' : 'off'} transition={t}
        />

        {/* Tongue */}
        <motion.g variants={v} initial="off" animate={shape === 'tongue' ? 'on' : 'off'} transition={t}>
          <path d="M -10 0 L 10 0" stroke={LIMB_BLACK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -4 0 v 5 a 4 4 0 0 0 8 0 v -5" fill={MASCOT_PINK} stroke={LIMB_BLACK} strokeWidth="1.5" />
        </motion.g>

        {/* Yawn */}
        <motion.ellipse
          cx="0" cy="3" rx="8" ry="12"
          fill={LIMB_BLACK}
          variants={v} initial="off" animate={shape === 'yawn' ? 'on' : 'off'} transition={t}
        />

        {/* Confident smirk */}
        <motion.path
          d="M -10 1 Q 0 3 10 -4"
          fill="none" stroke={LIMB_BLACK} strokeWidth="3.5" strokeLinecap="round"
          variants={v} initial="off" animate={shape === 'confident' ? 'on' : 'off'} transition={t}
        />

        {/* Sleepy smile */}
        <motion.path
          d="M -6 0 Q 0 4 6 0"
          fill="none" stroke={LIMB_BLACK} strokeWidth="4" strokeLinecap="round"
          variants={v} initial="off" animate={shape === 'sleepySmile' ? 'on' : 'off'} transition={t}
        />

        {/* Kiss */}
        <motion.path
          d="M -3 -4 Q 0 0 -3 4 M 3 -4 Q 0 0 3 4"
          fill="none" stroke={LIMB_BLACK} strokeWidth="3" strokeLinecap="round"
          variants={v} initial="off" animate={shape === 'kiss' ? 'on' : 'off'} transition={t}
        />
        {/* Blow Mouth (Party blower) */}
        <motion.path
          d="M 4 -6 A 6 6 0 1 0 4 6"
          fill="none" stroke={LIMB_BLACK} strokeWidth="4" strokeLinecap="round"
          variants={v} initial="off" animate={shape === 'blowMouth' ? 'on' : 'off'} transition={t}
        />
      </g>
    </motion.g>
  );
};
