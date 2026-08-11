import React from 'react'

export const MeltingCupcakeIcon = ({ width = 120, height = 120, className = '' }: { width?: number, height?: number, className?: string }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="#FFF9F3" />
      {/* Cupcake Base */}
      <path d="M45 80 L38 55 L82 55 L75 80 C74 85 70 88 60 88 C50 88 46 85 45 80 Z" fill="#D4A373" />
      {/* Wrapper lines */}
      <path d="M45 55 L50 80 M52 55 L55 81 M60 55 L60 82 M68 55 L65 81 M75 55 L70 80" stroke="#B88A5C" strokeWidth="2" strokeLinecap="round" />
      {/* Melting Frosting */}
      <path d="M30 55 C30 35 45 25 60 25 C75 25 90 35 90 55 C90 65 85 62 82 58 C78 54 75 60 70 65 C65 70 60 62 55 60 C50 58 48 68 45 72 C40 76 35 70 32 60 C30 58 30 60 30 55 Z" fill="#20D6D2" />
      {/* Melting Drip */}
      <path d="M45 70 Q45 85 42 85 Q39 85 39 70" fill="#20D6D2" />
      {/* Sprinkles */}
      <circle cx="50" cy="40" r="2.5" fill="#F72585" />
      <circle cx="70" cy="35" r="2.5" fill="#FFC533" />
      <circle cx="60" cy="45" r="2.5" fill="#FFF" />
      <circle cx="45" cy="50" r="2.5" fill="#FFC533" />
    </svg>
  )
}
