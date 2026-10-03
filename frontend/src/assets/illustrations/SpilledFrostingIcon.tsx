import React from 'react'

export const SpilledFrostingIcon = ({ width = 120, height = 120, className = '' }: { width?: number, height?: number, className?: string }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="#FFF9F3" />
      {/* Tipped Bowl */}
      <path d="M40 75 L80 75 C80 50 40 50 40 75 Z" fill="#FFC533" transform="rotate(-30 60 75)" />
      {/* Spilled Frosting Splat */}
      <path d="M25 80 C20 70 35 65 45 75 C55 60 75 65 80 80 C85 95 65 100 50 90 C35 100 25 95 25 80 Z" fill="#F72585" />
      {/* Little Splashes */}
      <circle cx="20" cy="70" r="4" fill="#F72585" />
      <circle cx="85" cy="85" r="3" fill="#F72585" />
      <circle cx="35" cy="95" r="5" fill="#F72585" />
      {/* Highlight on frosting */}
      <path d="M35 80 Q40 75 45 80" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
