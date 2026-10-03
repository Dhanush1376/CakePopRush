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
    {/* Base Light Blob */}
    <path 
      d="M0 0 C 100 40, 140 120, 80 180 C 20 240, 140 280, 60 320 L 0 320 Z" 
      fill="#D6F8F1" 
      opacity="0.9"
    />
    
    {/* Inner darker blob */}
    <path 
      d="M0 20 C 60 60, 80 130, 40 190 C 0 250, 80 290, 40 320 L 0 320 Z" 
      fill="#B3EBE0" 
      opacity="0.8"
    />
    
    {/* Wavy lines */}
    <path d="M0 50 C 40 90, 20 150, 40 210" stroke="#B3EBE0" strokeWidth="2" fill="none"/>

    {/* Sprinkles */}
    <rect x="30" y="50" width="8" height="4" rx="2" transform="rotate(45 30 50)" fill="#FFD000" />
    <rect x="75" y="130" width="8" height="4" rx="2" transform="rotate(-30 75 130)" fill="#F495B4" />
    <circle cx="40" cy="210" r="3" fill="#07C2BB" />
    <circle cx="90" cy="250" r="2.5" fill="#FFD000" />
    <rect x="30" y="290" width="8" height="4" rx="2" transform="rotate(-15 30 290)" fill="#F495B4" />
  </svg>
);
