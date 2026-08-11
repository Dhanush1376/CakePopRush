import React from 'react'

export const BrokenCakePopIcon = ({ width = 120, height = 120, className = '' }: { width?: number, height?: number, className?: string }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="#FFF9F3" />
      <path d="M55 85 L58 105 C58.5 107.5 61.5 107.5 62 105 L65 85 L60 82 Z" fill="#D4A373" />
      <path d="M56 75 L52 50 C51.5 47 54.5 45 56 46 L64 48 C66 48.5 66 51 65 53 L62 76 L59 79 Z" fill="#D4A373" />
      <circle cx="58" cy="40" r="24" fill="#F72585" />
      <path d="M40 30 L48 35 L45 42 L55 45 L52 55" stroke="#FFF9F3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M48 35 Q50 33 52 35" stroke="#5B3A29" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 38 Q64 36 66 38" stroke="#5B3A29" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 48 Q57 45 60 48" stroke="#5B3A29" strokeWidth="2" strokeLinecap="round" />
      <rect x="75" y="85" width="8" height="3" rx="1.5" transform="rotate(45 75 85)" fill="#20D6D2" />
      <rect x="35" y="90" width="8" height="3" rx="1.5" transform="rotate(-30 35 90)" fill="#FFC533" />
      <rect x="80" y="70" width="8" height="3" rx="1.5" transform="rotate(15 80 70)" fill="#F72585" />
    </svg>
  )
}
