import React, { useId } from 'react';
import { motion, MotionValue } from 'framer-motion';
import { LEFT_EYE, RIGHT_EYE } from '../config/mascotConfig';
import { EYE_WHITE, PUPIL_BLACK, HIGHLIGHT_WHITE, HEART_RED } from '../config/mascotConstants';

const Eye = ({
  id,
  geo,
  eyeX,
  eyeY,
  clipId
}: {
  id: string;
  geo: typeof LEFT_EYE | typeof RIGHT_EYE;
  eyeX?: MotionValue<number>;
  eyeY?: MotionValue<number>;
  clipId: string;
}) => (
  <motion.g id={`${id}-eye-container`} style={{ originX: '50%', originY: '50%' }}>
    <g id={`${id}-eye`} className="eye">
      {/* Normal open eye */}
      <motion.g id={`${id}-eye-normal`}>
        {/* Sclera (white outer circle) */}
        <circle
          id={`${id}-sclera`}
          cx={geo.cx} cy={geo.cy}
          r={geo.scleraR}
          fill={EYE_WHITE}
        />
        
        {/* Pupil + iris contained strictly within the sclera */}
        <g clipPath={`url(#${clipId})`}>
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
        </g>
      </motion.g>

      {/* Closed eye (happy/sleepy crescent arc) */}
      <motion.path
        id={`${id}-eye-closed`}
        d={`M ${geo.cx - geo.scleraR + 2} ${geo.cy + 2} Q ${geo.cx} ${geo.cy + geo.scleraR - 2} ${geo.cx + geo.scleraR - 2} ${geo.cy + 2}`}
        fill="none"
        stroke={PUPIL_BLACK}
        strokeWidth="4"
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

      {/* Heart eye */}
      <motion.path
        id={`${id}-eye-heart`}
        d={`M ${geo.cx} ${geo.cy + 4} C ${geo.cx} ${geo.cy - 2}, ${geo.cx - 6} ${geo.cy - 8}, ${geo.cx - 12} ${geo.cy - 4} C ${geo.cx - 18} ${geo.cy}, ${geo.cx - 12} ${geo.cy + 8}, ${geo.cx} ${geo.cy + 16} C ${geo.cx + 12} ${geo.cy + 8}, ${geo.cx + 18} ${geo.cy}, ${geo.cx + 12} ${geo.cy - 4} C ${geo.cx + 6} ${geo.cy - 8}, ${geo.cx} ${geo.cy - 2}, ${geo.cx} ${geo.cy + 4} Z`}
        fill={HEART_RED}
        transform="scale(0.9)"
        style={{ originX: '50%', originY: '50%' }}
        opacity={0}
      />
    </g>
  </motion.g>
);

export const MascotEyes = ({ eyeX, eyeY }: { eyeX?: MotionValue<number>, eyeY?: MotionValue<number> }) => {
  const uniqueId = useId();
  // Strip out colons that useId might generate to ensure it's a valid DOM ID
  const cleanId = uniqueId.replace(/:/g, '-');
  return (
    <g id="eyes">
      <defs>
        <clipPath id={`left-clip-${cleanId}`}>
          <circle cx={LEFT_EYE.cx} cy={LEFT_EYE.cy} r={LEFT_EYE.scleraR} />
        </clipPath>
        <clipPath id={`right-clip-${cleanId}`}>
          <circle cx={RIGHT_EYE.cx} cy={RIGHT_EYE.cy} r={RIGHT_EYE.scleraR} />
        </clipPath>
      </defs>
      <Eye id="left" geo={LEFT_EYE} eyeX={eyeX} eyeY={eyeY} clipId={`left-clip-${cleanId}`} />
      <Eye id="right" geo={RIGHT_EYE} eyeX={eyeX} eyeY={eyeY} clipId={`right-clip-${cleanId}`} />
    </g>
  );
};
