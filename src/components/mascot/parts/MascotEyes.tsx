import React, { useId } from 'react';
import { motion, MotionValue, useTransform, useMotionValue } from 'framer-motion';
import { LEFT_EYE, RIGHT_EYE } from '../config/mascotConfig';
import { EYE_WHITE, PUPIL_BLACK, HIGHLIGHT_WHITE } from '../config/mascotConstants';

const Eye = ({
  id,
  geo,
  eyeX,
  eyeY,
  highlightX,
  highlightY,
  clipId
}: {
  id: string;
  geo: typeof LEFT_EYE | typeof RIGHT_EYE;
  eyeX?: MotionValue<number>;
  eyeY?: MotionValue<number>;
  highlightX?: MotionValue<number>;
  highlightY?: MotionValue<number>;
  clipId: string;
}) => {
  return (
  <motion.g id={`${id}-eye-container`} style={{ originX: '50%', originY: '50%' }}>
    <defs>
      <mask id={clipId} maskUnits="userSpaceOnUse">
        <circle cx={geo.cx} cy={geo.cy} r={geo.scleraR} fill="white" />
      </mask>
    </defs>
    <g id={`${id}-eye`} className="eye">
      {/* Invisible bounding box to lock the 50% transform origin exactly to cx,cy */}
      <rect x={geo.cx - 75} y={geo.cy - 75} width={150} height={150} fill="transparent" />
      
      {/* Normal open eye */}
      <motion.g id={`${id}-eye-normal`} initial={{ opacity: 1 }}>
        {/* Sclera (white outer circle) */}
        <circle
          id={`${id}-sclera`}
          cx={geo.cx} cy={geo.cy}
          r={geo.scleraR}
          fill={EYE_WHITE}
        />
        
        {/* Pupil + iris contained strictly within the sclera */}
        <g mask={`url(#${clipId})`}>
          <motion.g 
            id={`${id}-pupil-group`} 
            style={{ 
              originX: `${geo.cx + geo.pupilDx}px`, 
              originY: `${geo.cy + geo.pupilDy}px`
            }}
          >
            <motion.g style={{ x: eyeX, y: eyeY }}>
              <circle
                id={`${id}-pupil`}
                cx={geo.cx + geo.pupilDx} cy={geo.cy + geo.pupilDy}
                r={geo.pupilR}
                fill={PUPIL_BLACK}
              />
              {/* Glossy highlights */}
              <motion.g style={{ x: highlightX, y: highlightY }}>
                <circle
                  id={`${id}-highlight1`}
                  cx={geo.cx + geo.highlight1Dx}
                  cy={geo.cy + geo.highlight1Dy}
                  r={geo.highlight1R}
                  fill={HIGHLIGHT_WHITE}
                />
                <circle
                  id={`${id}-highlight2`}
                  cx={geo.cx + geo.highlight2Dx}
                  cy={geo.cy + geo.highlight2Dy}
                  r={geo.highlight2R}
                  fill={HIGHLIGHT_WHITE}
                  opacity={geo.highlight2Opacity}
                />
              </motion.g>
            </motion.g>
          </motion.g>
        </g>
      </motion.g>

      {/* Closed eye (happy/sleepy crescent arc) */}
      <motion.path
        id={`${id}-eye-closed`}
        d={`M ${geo.cx - geo.scleraR + 10} ${geo.cy + 2} Q ${geo.cx} ${geo.cy + geo.scleraR - 5} ${geo.cx + geo.scleraR - 10} ${geo.cy + 2}`}
        fill="none"
        stroke={PUPIL_BLACK}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={0}
      />

      {/* Tired eyelid overlay */}
      <motion.path
        id={`${id}-eye-tired`}
        d={`M ${geo.cx - geo.scleraR} ${geo.cy + 2} A ${geo.scleraR} ${geo.scleraR} 0 0 1 ${geo.cx + geo.scleraR} ${geo.cy + 2} Z`}
        fill="#E0355A"
        opacity={0}
      />

      {/* Squeezed eye (laughing > <) */}
      <motion.path
        id={`${id}-eye-squeezed`}
        d={id === 'left'
          ? `M ${geo.cx - 8} ${geo.cy - 5} L ${geo.cx + 2} ${geo.cy} L ${geo.cx - 8} ${geo.cy + 5}`
          : `M ${geo.cx + 8} ${geo.cy - 5} L ${geo.cx - 2} ${geo.cy} L ${geo.cx + 8} ${geo.cy + 5}`
        }
        fill="none"
        stroke={PUPIL_BLACK}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0}
      />

      {/* Damaged eye (X mark) */}
      <motion.path
        id={`${id}-eye-damaged`}
        d={`M ${geo.cx - 10} ${geo.cy - 10} L ${geo.cx + 10} ${geo.cy + 10} M ${geo.cx - 10} ${geo.cy + 10} L ${geo.cx + 10} ${geo.cy - 10}`}
        fill="none"
        stroke={PUPIL_BLACK}
        strokeWidth="5"
        strokeLinecap="round"
        opacity={0}
      />

      {/* Heart eye (Giant throbbing red heart replacing the eye entirely) */}
      <motion.g
        id={`${id}-eye-heart`}
        opacity={0}
        style={{ transformOrigin: `${geo.cx}px ${geo.cy + 10}px` }}
      >
        <path
          d={`M ${geo.cx} ${geo.cy - 5}
              C ${geo.cx - 15} ${geo.cy - 30}, ${geo.cx - 40} ${geo.cy - 20}, ${geo.cx - 40} ${geo.cy}
              C ${geo.cx - 40} ${geo.cy + 20}, ${geo.cx - 15} ${geo.cy + 35}, ${geo.cx} ${geo.cy + 50}
              C ${geo.cx + 15} ${geo.cy + 35}, ${geo.cx + 40} ${geo.cy + 20}, ${geo.cx + 40} ${geo.cy}
              C ${geo.cx + 40} ${geo.cy - 20}, ${geo.cx + 15} ${geo.cy - 30}, ${geo.cx} ${geo.cy - 5} Z`}
          fill="#F20D6F"
          stroke={PUPIL_BLACK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Glossy shine on the heart */}
        <path
          d={`M ${geo.cx - 28} ${geo.cy - 8} Q ${geo.cx - 20} ${geo.cy - 18} ${geo.cx - 10} ${geo.cy - 18}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Cute (🥹) eye - Large watery pupil with pooled tears at bottom */}
      <motion.g
        id={`${id}-eye-cute`}
        opacity={0}
      >
        <defs>
          <clipPath id={`${clipId}-cute`}>
            {/* Slightly wider and taller sclera for the cute look */}
            <ellipse cx={geo.cx} cy={geo.cy} rx={geo.scleraR * 1.15} ry={geo.scleraR * 1.25} />
          </clipPath>
        </defs>
        
        {/* Sclera */}
        <ellipse 
          cx={geo.cx} cy={geo.cy} 
          rx={geo.scleraR * 1.15} ry={geo.scleraR * 1.25} 
          fill={EYE_WHITE} 
        />
        
        <g clipPath={`url(#${clipId}-cute)`}>
          <motion.g 
            id={`${id}-pupil-group-cute`} 
            style={{ 
              originX: `${geo.cx}px`, 
              originY: `${geo.cy}px`
            }}
          >
            <motion.g style={{ x: eyeX, y: eyeY }}>
              {/* Huge black pupil */}
              <circle
                cx={geo.cx} cy={geo.cy + 3}
                r={geo.pupilR * 1.4}
                fill={PUPIL_BLACK}
              />
              
              {/* Top left main glossy highlight */}
              <circle
                cx={geo.cx - 5} cy={geo.cy - 5}
                r={geo.highlight1R * 1.2}
                fill={HIGHLIGHT_WHITE}
              />
              
              {/* Small extra top right sparkle */}
              <circle
                cx={geo.cx + 7} cy={geo.cy - 1}
                r={geo.highlight2R * 0.8}
                fill={HIGHLIGHT_WHITE}
              />
            </motion.g>
          </motion.g>
        </g>
        
        {/* Blue horizontal ellipse holding at the bottom edge of the white eye */}
        <ellipse
          id={`${id}-eye-cute-tear`}
          cx={geo.cx} cy={geo.cy + 36}
          rx={14} ry={5}
          fill="#4DC0F0"
          opacity={0.95}
          style={{ transformOrigin: `${geo.cx}px ${geo.cy + 36}px` }}
        />
      </motion.g>

      {/* Pleading Eye - Cute puppy-dog eyes with big shiny highlights */}
      <motion.g
        id={`${id}-eye-pleading`}
        opacity={0}
      >
        <defs>
          <mask id={`${clipId}-pleading`} maskUnits="userSpaceOnUse">
            {/* Slightly enlarged sclera for the puppy look */}
            <ellipse cx={geo.cx} cy={geo.cy} rx={geo.scleraR * 1.08} ry={geo.scleraR * 1.12} fill="white" />
          </mask>
        </defs>

        {/* Sclera — slightly bigger and rounder */}
        <ellipse 
          cx={geo.cx} cy={geo.cy} 
          rx={geo.scleraR * 1.08} ry={geo.scleraR * 1.12} 
          fill={EYE_WHITE} 
        />

        <g mask={`url(#${clipId}-pleading)`}>
          <motion.g 
            id={`${id}-pupil-group-pleading`} 
            style={{ 
              originX: `${geo.cx}px`, 
              originY: `${geo.cy}px`
            }}
          >
            <motion.g style={{ x: eyeX, y: eyeY }}>
              {/* Pupil — large but not overwhelming */}
              <circle
                cx={geo.cx} cy={geo.cy + 2}
                r={geo.pupilR * 1.15}
                fill={PUPIL_BLACK}
              />
              
              {/* Big glossy highlight (top-left) — the key to cuteness */}
              <circle
                cx={geo.cx - 6} cy={geo.cy - 5}
                r={geo.highlight1R * 1.4}
                fill={HIGHLIGHT_WHITE}
              />
              
              {/* Secondary sparkle (top-right) */}
              <circle
                cx={geo.cx + 8} cy={geo.cy - 5}
                r={geo.highlight2R * 1.0}
                fill={HIGHLIGHT_WHITE}
              />
              
              {/* Bottom watery shimmer (puppy eye effect) */}
              <ellipse
                cx={geo.cx} cy={geo.cy + 10}
                rx={8} ry={3}
                fill={HIGHLIGHT_WHITE}
                opacity={0.6}
              />
            </motion.g>
          </motion.g>
        </g>
      </motion.g>

    </g>
  </motion.g>
);
};

export const MascotEyes = ({ eyeX, eyeY }: { eyeX?: MotionValue<number>, eyeY?: MotionValue<number> }) => {
  const uniqueId = useId();
  // Strip out colons that useId might generate to ensure it's a valid DOM ID
  const cleanId = uniqueId.replace(/:/g, '-');

  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const activeX = eyeX || fallbackX;
  const activeY = eyeY || fallbackY;
  
  const highlightX = useTransform(activeX, (v: number) => -v * 0.75);
  const highlightY = useTransform(activeY, (v: number) => -v * 0.75);

  return (
    <g id="eyes">
      <Eye id="left" geo={LEFT_EYE} eyeX={eyeX} eyeY={eyeY} highlightX={highlightX} highlightY={highlightY} clipId={`left-clip-${cleanId}`} />
      <Eye id="right" geo={RIGHT_EYE} eyeX={eyeX} eyeY={eyeY} highlightX={highlightX} highlightY={highlightY} clipId={`right-clip-${cleanId}`} />
    </g>
  );
};
