import React from 'react'

export const EmptyDessertTrayIcon = ({ width = 120, height = 120, className = '' }: { width?: number, height?: number, className?: string }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="#FFF9F3" />
      
      {/* Heart Icon (Wishlist) */}
      <g transform="translate(36, 36) scale(2)">
        <path 
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" 
          stroke="#F72585" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round"
          strokeLinejoin="round" 
        />
      </g>
    </svg>
  )
}
