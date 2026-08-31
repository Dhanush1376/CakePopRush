import React from 'react';
export const MascotWallHands = () => {
  return (
    <g id="wall-and-hands">
      {/* Wall / Ledge at y=215 to cut off the body exactly halfway */}
      <path 
        d="M 10 230 Q 10 215 30 215 L 270 215 Q 290 215 290 230 L 290 360 L 10 360 Z" 
        fill="#ffffff" 
      />

      {/* Left Paw (Gripping the wall) */}
      <g transform="translate(80, 215)">
        <g>
          <g transform="rotate(-10)">
            <rect x="-8" y="-12" width="7" height="16" rx="3.5" fill="#1c1c1c" />
            <rect x="-3" y="-15" width="7" height="19" rx="3.5" fill="#1c1c1c" />
            <rect x="2" y="-12" width="7" height="16" rx="3.5" fill="#1c1c1c" />
          </g>
        </g>
      </g>

      {/* Right Paw (Gripping the wall) */}
      <g transform="translate(220, 215)">
        <g>
          <g transform="rotate(10)">
            <rect x="-9" y="-12" width="7" height="16" rx="3.5" fill="#1c1c1c" />
            <rect x="-4" y="-15" width="7" height="19" rx="3.5" fill="#1c1c1c" />
            <rect x="1" y="-12" width="7" height="16" rx="3.5" fill="#1c1c1c" />
          </g>
        </g>
      </g>
    </g>
  );
};
