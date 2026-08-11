import React from 'react'

interface BuntingProps {
  className?: string
  width?: string | number
}

export const Bunting = ({ className = '', width = '100%' }: BuntingProps) => {
  return (
    <div className={className} style={{ width, overflow: 'hidden' }} aria-hidden="true">
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" style={{ width: '100%', height: '40px' }}>
        {/* String */}
        <path d="M0 10 Q 50 30 100 10 Q 150 30 200 10 Q 250 30 300 10 Q 350 30 400 10" fill="none" stroke="var(--color-border)" strokeWidth="2" />
        
        {/* Pennants */}
        <path d="M10 14 L40 50 L40 18 Z" fill="var(--color-brand-pink)" />
        <path d="M60 18 L60 50 L90 14 Z" fill="var(--color-brand-yellow)" />
        
        <path d="M110 14 L140 50 L140 18 Z" fill="var(--color-brand-turquoise)" />
        <path d="M160 18 L160 50 L190 14 Z" fill="var(--color-brand-pink)" />
        
        <path d="M210 14 L240 50 L240 18 Z" fill="var(--color-brand-yellow)" />
        <path d="M260 18 L260 50 L290 14 Z" fill="var(--color-brand-turquoise)" />
        
        <path d="M310 14 L340 50 L340 18 Z" fill="var(--color-brand-pink)" />
        <path d="M360 18 L360 50 L390 14 Z" fill="var(--color-brand-yellow)" />
      </svg>
    </div>
  )
}
