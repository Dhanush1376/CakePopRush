import React from 'react'

interface BalloonProps {
  color?: 'yellow' | 'pink' | 'turquoise'
  size?: number
  className?: string
  style?: React.CSSProperties
}

export const Balloon = ({
  color = 'yellow',
  size = 120,
  className = '',
  style,
}: BalloonProps) => {
  const colorMap = {
    yellow: 'var(--color-brand-yellow)',
    pink: 'var(--color-brand-pink)',
    turquoise: 'var(--color-brand-turquoise)',
  }
  
  const fill = colorMap[color]

  return (
    <div 
      className={`animate-float ${className}`} 
      style={{ width: size, height: size * 2, ...style }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* String */}
        <path d="M50 95 Q 60 170 100 200" fill="none" stroke="var(--admin-brown)" strokeWidth="1.5" />
        
        {/* Normal Balloon Body */}
        <path 
          d="M 50 90 C 20 85 10 60 10 40 C 10 15 30 5 50 5 C 70 5 90 15 90 40 C 90 60 80 85 50 90 Z" 
          fill={fill} 
        />
        
        {/* Knot */}
        <path d="M 50 90 L 40 98 Q 45 100 50 95 Q 55 100 60 98 Z" fill="none" stroke="var(--admin-brown)" strokeWidth="1.5" />
        <circle cx="50" cy="94" r="1.5" fill="var(--admin-brown)" />
        
        {/* Highlight */}
        <path d="M 25 25 Q 15 45 25 65" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  )
}
