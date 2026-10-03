import React from 'react'

export const CakePopSweepingIcon = ({ width = 120, height = 120, className = '' }: { width?: number, height?: number, className?: string }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="#FFF9F3" />
      {/* Cake Pop Head */}
      <circle cx="50" cy="45" r="22" fill="#F72585" />
      {/* Happy Face */}
      <path d="M43 42 Q45 40 47 42" stroke="#5B3A29" strokeWidth="2" strokeLinecap="round" />
      <path d="M53 42 Q55 40 57 42" stroke="#5B3A29" strokeWidth="2" strokeLinecap="round" />
      <path d="M47 50 Q50 55 53 50" stroke="#5B3A29" strokeWidth="2" strokeLinecap="round" fill="transparent" />
      {/* Cake Pop Stick (Body) */}
      <path d="M50 67 L50 90" stroke="#D4A373" strokeWidth="6" strokeLinecap="round" />
      {/* Broom */}
      <path d="M75 35 L60 85" stroke="#5B3A29" strokeWidth="3" strokeLinecap="round" />
      <path d="M55 85 L65 85 L70 95 L50 95 Z" fill="#FFC533" />
      {/* Hands holding broom */}
      <circle cx="65" cy="65" r="4" fill="#F72585" />
      <circle cx="68" cy="55" r="4" fill="#F72585" />
      {/* Crumbs being swept */}
      <circle cx="45" cy="92" r="1.5" fill="#D4A373" />
      <circle cx="40" cy="94" r="2" fill="#D4A373" />
      <circle cx="35" cy="90" r="1" fill="#D4A373" />
      {/* Sparkles */}
      <path d="M85 40 L88 45 L93 45 L89 48 L90 53 L85 50 L80 53 L81 48 L77 45 L82 45 Z" fill="#20D6D2" />
      <path d="M30 30 L32 33 L35 33 L33 35 L34 38 L30 36 L26 38 L27 35 L25 33 L28 33 Z" fill="#FFC533" />
    </svg>
  )
}
