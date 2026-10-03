import React from 'react'

interface ConfettiDotsProps {
  density?: number
  className?: string
}

export const ConfettiDots = ({ density = 20, className = '' }: ConfettiDotsProps) => {
  // Generate random dots that are deterministic per render
  // (Using pseudo-random so it doesn't cause hydration mismatch if SSR'd later)
  const dots = Array.from({ length: density }).map((_, i) => {
    // Simple deterministic random
    const randX = ((i * 13) % 100)
    const randY = ((i * 17) % 100)
    const randColor = i % 3 === 0 ? 'var(--color-brand-pink)' : i % 3 === 1 ? 'var(--color-brand-yellow)' : 'var(--color-brand-turquoise)'
    const randSize = 4 + (i % 6)
    
    return (
      <circle 
        key={i} 
        cx={`${randX}%`} 
        cy={`${randY}%`} 
        r={randSize / 2} 
        fill={randColor} 
        opacity={0.6}
      />
    )
  })

  return (
    <div className={className} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
      <svg width="100%" height="100%">
        {dots}
      </svg>
    </div>
  )
}
