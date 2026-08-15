import React from 'react';
import { motion, Variants } from 'framer-motion';
import { MOUTH } from '../config/mascotConfig';
import { LIMB_BLACK, MASCOT_PINK, MASCOT_TONGUE } from '../config/mascotConstants';

export type MascotMouthShape =
  | 'neutral' | 'smallSmile' | 'happy' | 'openSmile'
  | 'laugh' | 'oMouth' | 'tinyOops' | 'frown' | 'tiredFrown' | 'uncertain'
  | 'tongue' | 'yawn' | 'confident' | 'sleepySmile' | 'kiss' | 'blowMouth' | 'cryingFrown' | 'tinyPout';

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

      {/* Happy — The canonical SVG path (now used for all wide/open smiles) */}
      <motion.g 
        id="mouth-happy" 
        initial={false} 
        animate={['happy', 'openSmile', 'laugh', 'cryingFrown'].includes(shape) ? { opacity: 1, rotate: shape === 'cryingFrown' ? 180 : 0 } : { opacity: 0, rotate: 0 }} 
        transition={{ rotate: { duration: 0 }, default: t }}
        style={{ originX: '50%', originY: '50%' }}
      >
        <defs>
          <clipPath id="mouth-clip">
            <path d="M 129.2 178.4 C 131 170, 142 176, 149.5 176 C 157 176, 168 170, 169.8 178.4 C 169 192, 160 201.6, 149.5 201.6 C 139 201.6, 130 192, 129.2 178.4 Z" />
          </clipPath>
        </defs>
        <path
          d="M 129.2 178.4 C 131 170, 142 176, 149.5 176 C 157 176, 168 170, 169.8 178.4 C 169 192, 160 201.6, 149.5 201.6 C 139 201.6, 130 192, 129.2 178.4 Z"
          fill={LIMB_BLACK}
        />
        <g clipPath="url(#mouth-clip)">
          <ellipse 
            cx={149.5} 
            cy={shape === 'cryingFrown' ? 175 : 193.5}
            rx={11.5} 
            ry={6.5} 
            fill={MASCOT_TONGUE} 
          />
        </g>
      </motion.g>

      <g transform={`translate(${MOUTH.cx}, ${MOUTH.cy})`}>
        {/* Morphing Smile/Frown */}
        <motion.path
          d={
            shape === 'frown' ? "M -7 4 Q 0 -2 7 4" :
            (shape === 'tiredFrown' || shape === 'cryingFrown') ? "M -9 4 Q 0 -4 9 4" :
            shape === 'smallSmile' ? "M -10 -1 Q 0 8 10 -1" :
            shape === 'tinyPout' ? "M -4 2 Q 0 -2 4 2" :
            "M -16 -4 Q 0 14 16 -4"
          }
          animate={{
            strokeWidth: shape === 'frown' ? 3.5 : 
                         (shape === 'tiredFrown' || shape === 'cryingFrown') ? 4.5 : 
                         shape === 'smallSmile' ? 3.5 : 
                         shape === 'tinyPout' ? 2.5 : 5,
            opacity: ['neutral', 'frown', 'tiredFrown', 'smallSmile', 'tinyPout', 'cryingFrown'].includes(shape) ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          fill="none" stroke={LIMB_BLACK} strokeLinecap="round"
        />

        {/* Removed the 'triangle' shaped openSmile and laugh variants here, they are now mapped to 'happy' above */}

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

        {/* Tongue (Silly) - Realistic half-ellipse tongue with a closed mouth */}
        <motion.g variants={v} initial="off" animate={shape === 'tongue' ? 'on' : 'off'} transition={t}>
          {/* Tongue body (wider semi-ellipse) */}
          <path d="M -8.5 0.5 A 8.5 10 0 0 0 8.5 0.5 Z" fill={MASCOT_TONGUE} />
          {/* Thin border around the tongue (no top border) */}
          <path d="M -8.5 0.5 A 8.5 10 0 0 0 8.5 0.5" fill="none" stroke={LIMB_BLACK} strokeWidth="2" strokeLinecap="round" />
          {/* Very subtle inner crease for realistic depth */}
          <path d="M 0 1.5 L 0 9" stroke="#a31f36" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          {/* Closed mouth line, rendered on top to perfectly cap the tongue */}
          <path d="M -12 -2 Q 0 5 12 -2" fill="none" stroke={LIMB_BLACK} strokeWidth="4.5" strokeLinecap="round" />
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
