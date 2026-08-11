import React from 'react'

export const DeliveryTruckIcon = ({ width = 120, height = 120, className = '' }: { width?: number, height?: number, className?: string }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="#FFF9F3" />
      {/* Box */}
      <path d="M25 45 C25 40 30 40 30 40 L65 40 L65 75 L25 75 Z" fill="#FFC533" />
      {/* Cab */}
      <path d="M65 55 L80 55 C85 55 90 60 90 65 L90 75 L65 75 Z" fill="#F72585" />
      {/* Window */}
      <path d="M70 58 L80 58 C83 58 85 60 85 63 L85 65 L70 65 Z" fill="#FFF" />
      {/* Stripe */}
      <rect x="25" y="55" width="40" height="8" fill="#F72585" />
      {/* Broken Wheel 1 */}
      <circle cx="40" cy="80" r="8" stroke="#5B3A29" strokeWidth="3" fill="#FFF" strokeDasharray="4 2" />
      {/* Good Wheel 2 */}
      <circle cx="75" cy="80" r="8" stroke="#5B3A29" strokeWidth="3" fill="#FFF" />
      {/* Smoke/Network Error sign */}
      <path d="M30 30 Q35 25 40 30 T50 30" stroke="#20D6D2" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
      <path d="M40 20 Q45 15 50 20" stroke="#20D6D2" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
    </svg>
  )
}
