import React from 'react';

export const FrostingSide = ({ color = "#07C2BB", style, className }: { color?: string, style?: React.CSSProperties, className?: string }) => (
  <svg 
    width="160" 
    height="320" 
    viewBox="0 0 160 320" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ 
      position: 'absolute', 
      pointerEvents: 'none', 
      zIndex: 0,
      ...style
    }}
  >
    {/* Base Frosting */}
    <path 
      d="M 0 0 C 60 20, 80 50, 50 100 C 20 150, 100 180, 80 230 C 60 280, 40 300, 0 314 Z" 
      fill={color} 
    />
    
    {/* White stroke outline - tapers to sharp point at wall */}
    <path 
      d="M 0 0 C 60 20, 80 50, 50 100 C 20 150, 100 180, 80 230 C 60 280, 40 300, 0 314" 
      stroke="white" 
      strokeWidth="10" 
    />
    
    {/* Second thin outline - asymmetrical, slight peel away gap */}
    <path 
      d="M 0 6 C 64 26, 84 56, 54 106 C 24 156, 104 186, 84 236 C 64 286, 44 306, 0 320" 
      stroke={color} 
      strokeWidth="2" 
    />

    {/* Sprinkles inside the frosting */}
    <rect x="20" y="40" width="4" height="12" rx="2" transform="rotate(45 20 40)" fill="#FFF" />
    <rect x="15" y="120" width="4" height="12" rx="2" transform="rotate(-30 15 120)" fill="#FFD000" />
    <rect x="30" y="200" width="4" height="12" rx="2" transform="rotate(60 30 200)" fill="#5C3317" />
    <rect x="10" y="280" width="4" height="12" rx="2" transform="rotate(-15 10 280)" fill="#f879b4ff" />

    {/* Sprinkles outside tracing the curve */}
    <rect x="90" y="60" width="4" height="12" rx="2" transform="rotate(20 90 60)" fill="#5C3317" />
    <rect x="55" y="140" width="4" height="12" rx="2" transform="rotate(-45 55 140)" fill="#FFF" />
    <rect x="100" y="240" width="4" height="12" rx="2" transform="rotate(35 100 240)" fill="#FFD000" />
    <rect x="45" y="300" width="4" height="12" rx="2" transform="rotate(-60 45 300)" fill="#f879b4ff" />
  </svg>
);
