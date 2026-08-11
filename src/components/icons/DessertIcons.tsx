import React from 'react'

export interface IconProps {
  width?: number
  height?: number
  className?: string
}

// Common styles from original SVG
const oStyle = { stroke: '#333', strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const thinStyle = { stroke: '#333', strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const AllItemsIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(15, 30)">
      {/* Box back */}
      <path {...oStyle} fill="#E8C396" d="M20 40 L110 40 L110 110 C110 120 20 120 20 110 Z" />
      {/* Box Flap Left */}
      <path {...oStyle} fill="#FFD8A3" d="M20 40 L-10 10 L40 10 Z" strokeLinejoin="round" />
      {/* Box Flap Right */}
      <path {...oStyle} fill="#FFD8A3" d="M110 40 L140 10 L90 10 Z" strokeLinejoin="round" />
      {/* Box Flap Back */}
      <path {...oStyle} fill="#E8C396" d="M20 40 L40 20 L90 20 L110 40 Z" strokeLinejoin="round" />
      
      {/* Little treats peeking out */}
      <circle cx="45" cy="35" r="18" fill="#FF77AF" />
      <circle cx="85" cy="40" r="16" fill="#62D7D7" />
      <circle cx="65" cy="25" r="15" fill="#8D3E25" />
      <circle cx="50" cy="20" r="12" fill="#FFD229" />
      
      {/* Box front body covering the treats */}
      <path {...oStyle} fill="#F4C991" d="M20 40 L110 40 L110 110 C110 120 20 120 20 110 Z" strokeLinejoin="round" />
      
      {/* Ribbon */}
      <path fill="#FF4F7B" d="M55 40 L55 117 M75 40 L75 117" stroke="#FF4F7B" strokeWidth="20" />
      <path {...oStyle} fill="none" d="M55 40 L55 117 M75 40 L75 117" />
      
      {/* Box Flap Front */}
      <path {...oStyle} fill="#FFD8A3" d="M20 40 L40 70 L90 70 L110 40 Z" strokeLinejoin="round" />
    </g>
  </svg>
)

export const BirthdayCakesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(0, 0)">
      <path {...oStyle} fill="#FFF3E6" d="M20 105 Q80 88 145 105 L140 175 Q82 190 25 175 Z"/>
      <path {...oStyle} fill="#FF77AF" d="M20 105 Q80 88 145 105 L143 130 Q130 118 118 130 Q104 144 91 128 Q76 113 63 129 Q49 145 35 129 Q28 120 21 125 Z"/>
      <path {...oStyle} fill="#FFB6D0" d="M28 146 Q80 160 137 146 L137 166 Q80 180 28 166 Z"/>
      <g {...thinStyle}>
        <rect x="46" y="60" width="8" height="43" fill="#29C7D4"/><path fill="#FFC21C" d="M50 58 C41 48 48 36 52 29 C59 42 60 51 50 58Z"/>
        <rect x="79" y="52" width="8" height="48" fill="#FFD229"/><path fill="#FFC21C" d="M83 50 C74 40 81 28 85 21 C92 34 93 43 83 50Z"/>
        <rect x="112" y="62" width="8" height="41" fill="#29C7D4"/><path fill="#FFC21C" d="M116 60 C107 50 114 38 118 31 C125 44 126 53 116 60Z"/>
      </g>
    </g>
  </svg>
)

export const CakePopsIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(0, 0)">
      <line {...oStyle} x1="78" y1="130" x2="45" y2="215"/>
      <circle {...oStyle} cx="82" cy="82" r="58" fill="#8D3E25"/>
      <path {...thinStyle} d="M40 62 Q80 35 125 60" fill="none" stroke="#6B2B1D"/>
      <g fill="#FFF1D7">
        <circle cx="50" cy="55" r="5"/><circle cx="72" cy="38" r="5"/><circle cx="98" cy="46" r="5"/>
        <circle cx="118" cy="68" r="5"/><circle cx="55" cy="88" r="5"/><circle cx="86" cy="77" r="5"/>
        <circle cx="109" cy="101" r="5"/><circle cx="68" cy="116" r="5"/>
      </g>
      <g stroke="#FF4F7B" strokeWidth="4"><path d="M48 72l8 4"/><path d="M92 58l8 4"/><path d="M88 105l8-4"/><path d="M118 84l7-5"/></g>
    </g>
  </svg>
)

export const CupcakesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(0, 0)">
      <path {...oStyle} fill="#62D7D7" d="M35 105 L135 105 L122 178 L49 178 Z"/>
      <path {...thinStyle} d="M58 112l5 58M84 110v62M110 112l-5 58" fill="none"/>
      <path {...oStyle} fill="#FFD8A3" d="M27 105 Q24 85 45 79 Q44 58 66 58 Q78 35 96 55 Q117 47 123 68 Q145 68 143 92 Q151 101 135 105 Z"/>
      <path {...oStyle} fill="#FF9FC0" d="M40 79 Q42 57 65 58 Q77 35 96 55 Q118 47 124 69 Q141 71 140 88 Q118 78 100 88 Q80 99 61 87 Q51 80 40 79Z"/>
      <path {...oStyle} fill="#FFF" d="M77 37 C67 25 78 14 86 25 C94 14 105 25 95 37 L86 45 Z"/>
    </g>
  </svg>
)

export const CookiesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(0, 0)">
      <path {...oStyle} fill="#F4C991" d="M78 20 C115 20 145 48 148 84 C128 80 116 65 119 47 C100 51 85 42 78 20 Z M148 84 C151 126 121 160 80 162 C37 164 5 133 6 91 C7 48 38 20 78 20"/>
      <circle cx="49" cy="65" r="8" fill="#8B4A2B"/>
      <circle cx="83" cy="91" r="8" fill="#8B4A2B"/>
      <circle cx="49" cy="121" r="8" fill="#8B4A2B"/>
      <circle cx="105" cy="130" r="7" fill="#8B4A2B"/>
    </g>
  </svg>
)

export const CakesiclesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(10, 0)">
      {/* Popsicle Stick */}
      <path {...oStyle} fill="#E8C396" d="M60 120 L60 160 C60 170 80 170 80 160 L80 120 Z" />
      
      {/* Main Body */}
      <path {...oStyle} fill="#FFD8A3" d="M30 60 C30 30 50 20 70 20 C90 20 110 30 110 60 L110 120 C110 130 100 135 70 135 C40 135 30 130 30 120 Z" />
      
      {/* Teal Frosting Dip */}
      <path {...oStyle} fill="#62D7D7" d="M30 60 C30 30 50 20 70 20 C90 20 110 30 110 60 L110 80 C100 90 90 75 80 85 C70 95 60 80 50 90 C40 100 30 85 30 80 Z" />
      
      {/* Sprinkles on Frosting */}
      <g fill="#FFF">
        <rect x="50" y="40" width="8" height="4" rx="2" transform="rotate(30 50 40)" />
        <rect x="80" y="35" width="8" height="4" rx="2" transform="rotate(-45 80 35)" />
        <rect x="65" y="55" width="8" height="4" rx="2" transform="rotate(15 65 55)" />
      </g>
      <g fill="#FF4F7B">
        <rect x="45" y="60" width="8" height="4" rx="2" transform="rotate(-20 45 60)" />
        <rect x="90" y="50" width="8" height="4" rx="2" transform="rotate(60 90 50)" />
      </g>
    </g>
  </svg>
)

export const BrowniesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(15, 40)">
      {/* Brownie body */}
      <path {...oStyle} fill="#5B291A" d="M20 50 L110 50 L110 100 C110 110 20 110 20 100 Z" />
      {/* Brownie top */}
      <path {...oStyle} fill="#8D3E25" d="M35 20 C45 10 115 10 125 20 L110 50 L20 50 Z" />
      
      {/* Walnuts/Chips on top */}
      <circle cx="50" cy="35" r="5" fill="#E8C396" />
      <circle cx="90" cy="30" r="4" fill="#E8C396" />
      <circle cx="70" cy="40" r="5" fill="#5B291A" />
      <circle cx="100" cy="42" r="3" fill="#5B291A" />
      
      {/* Cream dollop */}
      <path {...oStyle} fill="#FFF3E6" d="M50 25 C40 15 50 0 65 5 C75 -10 90 0 85 15 C95 20 85 35 65 30 C55 35 45 30 50 25 Z" />
    </g>
  </svg>
)

export const MacaronsIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(-10, 20) scale(1.3)">
      {/* Bottom Shell */}
      <path {...oStyle} fill="#FFB6D0" d="M30 60 C30 80 110 80 110 60 C110 50 30 50 30 60 Z" />
      
      {/* Filling */}
      <path {...oStyle} fill="#FFF3E6" d="M35 50 C35 60 105 60 105 50 C105 40 35 40 35 50 Z" />
      
      {/* Top Shell */}
      <path {...oStyle} fill="#FF77AF" d="M30 45 C30 15 60 10 70 10 C80 10 110 15 110 45 C110 55 30 55 30 45 Z" />
      
      {/* Texture Details (the 'feet' of the macaron) */}
      <g fill="#E70074" opacity="0.3">
        <circle cx="40" cy="48" r="2" />
        <circle cx="50" cy="50" r="1.5" />
        <circle cx="60" cy="48" r="2" />
        <circle cx="75" cy="50" r="2" />
        <circle cx="90" cy="49" r="1.5" />
        <circle cx="100" cy="48" r="2" />
        
        <circle cx="40" cy="62" r="1.5" />
        <circle cx="55" cy="60" r="2" />
        <circle cx="70" cy="62" r="2" />
        <circle cx="85" cy="60" r="1.5" />
        <circle cx="100" cy="61" r="2" />
      </g>
    </g>
  </svg>
)

export const TrufflesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(20, 40)">
      {/* Truffle 2 (Back) */}
      <circle {...oStyle} cx="80" cy="40" r="35" fill="#E8C396" />
      {/* Drizzle on Back Truffle */}
      <path {...oStyle} d="M60 20 Q70 10 75 30 T95 25 T100 45" fill="none" stroke="#8D3E25" strokeWidth="4" />
      
      {/* Truffle 1 (Front) */}
      <circle {...oStyle} cx="45" cy="65" r="40" fill="#5B291A" />
      
      {/* Cocoa powder/texture dots on Front Truffle */}
      <g fill="#8D3E25">
        <circle cx="30" cy="50" r="3" />
        <circle cx="55" cy="45" r="2.5" />
        <circle cx="45" cy="60" r="4" />
        <circle cx="25" cy="70" r="3" />
        <circle cx="65" cy="65" r="3" />
        <circle cx="40" cy="80" r="2.5" />
        <circle cx="60" cy="85" r="3" />
      </g>
      
      {/* Small highlight */}
      <path fill="#FFF" opacity="0.3" d="M25 45 C35 35 45 40 45 40 C45 40 30 55 25 45 Z" />
    </g>
  </svg>
)
