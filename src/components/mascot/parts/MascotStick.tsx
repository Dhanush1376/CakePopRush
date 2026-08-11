import React from 'react';
import { STICK } from '../config/mascotConfig';
import { STICK_COLOR } from '../config/mascotConstants';

export const MascotStick = () => {
  return (
    <g id="stick">
      <rect
        x={STICK.x}
        y={STICK.y}
        width={STICK.width}
        height={STICK.height}
        rx={STICK.rx}
        fill={STICK_COLOR}
      />
      <rect
        x={STICK.highlightX}
        y={STICK.highlightY}
        width={STICK.highlightWidth}
        height={STICK.highlightHeight}
        rx={STICK.highlightRx}
        fill="#ffffff"
        opacity={0.25}
      />
    </g>
  );
};
