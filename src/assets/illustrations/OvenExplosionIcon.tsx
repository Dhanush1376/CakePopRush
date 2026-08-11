import React from 'react'

export const OvenExplosionIcon = ({ width = 120, height = 120, className = '' }: { width?: number, height?: number, className?: string }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="#FFF9F3" />
      {/* Oven Base */}
      <rect x="35" y="45" width="50" height="50" rx="4" fill="#5B3A29" />
      <rect x="40" y="55" width="40" height="30" rx="2" fill="#3D2418" />
      {/* Knobs */}
      <circle cx="42" cy="50" r="2" fill="#FFC533" />
      <circle cx="48" cy="50" r="2" fill="#FFC533" />
      <circle cx="54" cy="50" r="2" fill="#FFC533" />
      {/* Explosion/Smoke */}
      <path d="M40 55 C30 40 45 25 60 30 C75 25 90 40 80 55 C90 70 70 85 60 70 C50 85 30 70 40 55 Z" fill="#F72585" opacity="0.9" />
      {/* Sparks */}
      <path d="M60 20 L62 25 L67 25 L63 28 L64 33 L60 30 L56 33 L57 28 L53 25 L58 25 Z" fill="#FFC533" />
      <circle cx="30" cy="35" r="3" fill="#20D6D2" />
      <circle cx="85" cy="40" r="4" fill="#FFC533" />
      <circle cx="80" cy="75" r="2" fill="#20D6D2" />
      <circle cx="35" cy="70" r="2.5" fill="#FFC533" />
    </svg>
  )
}
