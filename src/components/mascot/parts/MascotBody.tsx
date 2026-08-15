import React from 'react';
import { BODY, SHEEN } from '../config/mascotConfig';
import {
  MASCOT_PINK,
  SPRINKLE_CHOCOLATE, SPRINKLE_CYAN, SPRINKLE_YELLOW, SPRINKLE_CREAM, SPRINKLE_PINK_ACCENT
} from '../config/mascotConstants';

const SPRINKLE_MAP: {
  x: number; y: number;
  type: 'dot' | 'rod';
  color: string;
  r?: number;
  w?: number; h?: number; rx?: number;
  rotation?: number;
  rotCx?: number; rotCy?: number;
}[] = [
  // top area
  { type: 'dot', x: 150, y: 58, r: 6.5, color: SPRINKLE_CREAM },
  { type: 'dot', x: 176, y: 52, r: 7, color: SPRINKLE_YELLOW },
  { type: 'dot', x: 123, y: 55, r: 6, color: SPRINKLE_CYAN },
  { type: 'rod', x: 196, y: 62, w: 16, h: 7, rx: 3.5, color: SPRINKLE_CHOCOLATE, rotation: 28, rotCx: 204, rotCy: 65.5 },
  { type: 'dot', x: 100, y: 72, r: 6.5, color: SPRINKLE_CHOCOLATE },

  // upper sides
  { type: 'dot', x: 212, y: 88, r: 7, color: SPRINKLE_CYAN },
  { type: 'dot', x: 85, y: 95, r: 6, color: SPRINKLE_CYAN },
  { type: 'rod', x: 60, y: 108, w: 15, h: 7, rx: 3.5, color: SPRINKLE_CHOCOLATE, rotation: -20, rotCx: 67.5, rotCy: 111.5 },
  { type: 'dot', x: 230, y: 115, r: 6, color: SPRINKLE_YELLOW },

  // mid sides
  { type: 'dot', x: 60, y: 140, r: 6.5, color: SPRINKLE_CHOCOLATE },
  { type: 'dot', x: 238, y: 145, r: 6.5, color: SPRINKLE_CHOCOLATE },
  { type: 'dot', x: 222, y: 168, r: 6, color: SPRINKLE_CREAM },
  { type: 'dot', x: 70, y: 172, r: 5.5, color: SPRINKLE_CYAN },

  // lower sides
  { type: 'rod', x: 205, y: 196, w: 16, h: 7, rx: 3.5, color: SPRINKLE_CHOCOLATE, rotation: 35, rotCx: 213, rotCy: 199.5 },
  { type: 'dot', x: 82, y: 205, r: 6.5, color: SPRINKLE_YELLOW },
  { type: 'dot', x: 196, y: 222, r: 6, color: SPRINKLE_CYAN },
  { type: 'dot', x: 108, y: 228, r: 6.5, color: SPRINKLE_CHOCOLATE },

  // bottom
  { type: 'dot', x: 150, y: 238, r: 6, color: SPRINKLE_CREAM },
  { type: 'rod', x: 165, y: 230, w: 15, h: 7, rx: 3.5, color: SPRINKLE_CHOCOLATE, rotation: -15, rotCx: 172.5, rotCy: 233.5 },
  
  // pink accents
  { type: 'dot', x: 128, y: 80, r: 4.5, color: SPRINKLE_PINK_ACCENT },
  { type: 'dot', x: 188, y: 205, r: 4.5, color: SPRINKLE_PINK_ACCENT },
];

export const MascotBody = () => {
  return (
    <g id="body">
      <defs>
        <radialGradient id="body-gradient" cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FF70A0" /> {/* Lighter pink highlight */}
          <stop offset="50%" stopColor={MASCOT_PINK} /> {/* Base pink */}
          <stop offset="90%" stopColor="#D9225D" /> {/* Darker shadow */}
          <stop offset="100%" stopColor="#C41549" /> {/* Deep shadow at rim */}
        </radialGradient>
        
        <filter id="sprinkle-shadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#900B31" floodOpacity="0.4" />
        </filter>
      </defs>

      <g id="frosting">
        <circle cx={BODY.cx} cy={BODY.cy} r={BODY.r} fill="url(#body-gradient)" />
        {/* We can keep the sheen for extra glossiness! */}
        <ellipse cx={SHEEN.cx} cy={SHEEN.cy} rx={SHEEN.rx} ry={SHEEN.ry} fill="#ffffff" opacity={0.12} />
      </g>
      <g id="sprinkles" filter="url(#sprinkle-shadow)">
        {SPRINKLE_MAP.map((s, i) => {
          if (s.type === 'dot') {
            return (
              <circle
                key={`spr-${i}`}
                cx={s.x} cy={s.y} r={s.r}
                fill={s.color}
              />
            );
          } else {
            return (
              <rect
                key={`spr-${i}`}
                x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx}
                fill={s.color}
                transform={s.rotation ? `rotate(${s.rotation} ${s.rotCx} ${s.rotCy})` : undefined}
              />
            );
          }
        })}
      </g>
    </g>
  );
};
