import React from 'react';

export const FrostingCorner = ({ color = "#f879b4ff", style }: { color?: string, style?: React.CSSProperties }) => (
  <svg 
    width="280" 
    height="280" 
    viewBox="0 0 280 280" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ 
      position: 'absolute', 
      top: 0, 
      right: 0, 
      pointerEvents: 'none', 
      zIndex: 0,
      transform: 'scaleX(-1)',
      ...style
    }}
  >
    {/* Base Frosting */}
    <path 
      d="M0 0 H200 C150 20, 110 50, 100 100 C90 150, 40 180, 0 200 Z" 
      fill={color} 
    />
    
    {/* White stroke outline */}
    <path 
      d="M200 0 C150 20, 110 50, 100 100 C90 150, 40 180, 0 200" 
      stroke="white" 
      strokeWidth="10" 
    />
    
    {/* Second thin outline - asymmetrical, slight peel away gap */}
    <path 
      d="M206 0 C155 24, 115 55, 105 105 C95 155, 44 185, 0 206" 
      stroke={color} 
      strokeWidth="2" 
    />

    {/* Sprinkles acting as the outer trail (replacing the thin line) */}
    <rect x="185" y="15" width="4" height="12" rx="2" transform="rotate(45 185 15)" fill="#FFD000" />
    <rect x="160" y="35" width="4" height="12" rx="2" transform="rotate(-20 160 35)" fill="#07C2BB" />
    <rect x="140" y="55" width="4" height="12" rx="2" transform="rotate(60 140 55)" fill="#FFF" />
    <rect x="120" y="85" width="4" height="12" rx="2" transform="rotate(-40 120 85)" fill="#5C3317" />
    <rect x="105" y="115" width="4" height="12" rx="2" transform="rotate(15 105 115)" fill="#f879b4ff" />
    <rect x="85" y="145" width="4" height="12" rx="2" transform="rotate(-75 85 145)" fill="#FFD000" />
    <rect x="60" y="170" width="4" height="12" rx="2" transform="rotate(35 60 170)" fill="#07C2BB" />
    <rect x="35" y="190" width="4" height="12" rx="2" transform="rotate(-15 35 190)" fill="#5C3317" />
    <rect x="10" y="205" width="4" height="12" rx="2" transform="rotate(80 10 205)" fill="#f879b4ff" />
    
    {/* Extra sprinkles scattered deep inside the frosting (visual right side) */}
    <rect x="50" y="30" width="4" height="12" rx="2" transform="rotate(25 50 30)" fill="#07C2BB" />
    <rect x="20" y="70" width="4" height="12" rx="2" transform="rotate(-45 20 70)" fill="#FFD000" />
    <rect x="70" y="80" width="4" height="12" rx="2" transform="rotate(65 70 80)" fill="#FFF" />
    <rect x="30" y="130" width="4" height="12" rx="2" transform="rotate(-10 30 130)" fill="#5C3317" />
  </svg>
);
