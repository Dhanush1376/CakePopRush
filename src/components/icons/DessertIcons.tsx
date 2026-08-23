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
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(21.5, 21.5) scale(0.9)">
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
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(0, 16)">
      {/* Candles */}
      <rect {...oStyle} fill="#29C7D4" x="62" y="22" width="6" height="30" rx="2" />
      <rect {...oStyle} fill="#29C7D4" x="77" y="22" width="6" height="30" rx="2" />
      <rect {...oStyle} fill="#29C7D4" x="92" y="22" width="6" height="30" rx="2" />

      {/* Wicks */}
      <line x1="65" y1="22" x2="65" y2="17" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="80" y1="22" x2="80" y2="17" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="95" y1="22" x2="95" y2="17" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />

      {/* Flames */}
      <path {...oStyle} fill="#FFD229" d="M 65 17 Q 60 7 65 -3 Q 70 7 65 17 Z" strokeLinejoin="round" />
      <path {...oStyle} fill="#FFD229" d="M 80 17 Q 75 7 80 -3 Q 85 7 80 17 Z" strokeLinejoin="round" />
      <path {...oStyle} fill="#FFD229" d="M 95 17 Q 90 7 95 -3 Q 100 7 95 17 Z" strokeLinejoin="round" />

      {/* Top Tier Vanilla Body */}
      <rect {...oStyle} fill="#FFF3E6" x="50" y="50" width="60" height="40" rx="6" />
      
      {/* Top Tier Red Wavy Line */}
      <path stroke="#FF4F7B" strokeWidth="4" strokeLinecap="round" fill="none" d="M 55 75 Q 65 65 80 75 Q 95 85 105 75" />
      
      {/* Top Tier Pink Icing */}
      <path {...oStyle} fill="#FF77AF" d="M 56 50 L 104 50 A 6 6 0 0 1 110 56 L 110 60 Q 100 75 90 60 Q 80 70 70 60 Q 60 75 50 60 L 50 56 A 6 6 0 0 1 56 50 Z" strokeLinejoin="round" />

      {/* Base Tier Brown Body */}
      <path {...oStyle} fill="#8D3E25" d="M 36 90 L 124 90 A 6 6 0 0 1 130 96 L 130 125 L 30 125 L 30 96 A 6 6 0 0 1 36 90 Z" />
      
      {/* Base Tier White Base */}
      <path {...oStyle} fill="#FFF" d="M 30 125 L 130 125 L 130 129 A 6 6 0 0 1 124 135 L 36 135 A 6 6 0 0 1 30 129 Z" />

      {/* Base Tier Red Line */}
      <line x1="30" y1="125" x2="130" y2="125" stroke="#FF4F7B" strokeWidth="4" />

      {/* Base Tier Teal Icing */}
      <path {...oStyle} fill="#62D7D7" d="M 36 90 L 124 90 A 6 6 0 0 1 130 96 L 130 100 Q 115 115 100 100 Q 80 110 60 100 Q 45 115 30 100 L 30 96 A 6 6 0 0 1 36 90 Z" strokeLinejoin="round" />
    </g>
  </svg>
)

export const CakePopsIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(14, 18) scale(0.8)">
      {/* Stick */}
      <path {...oStyle} fill="#FFF" d="M 52 100 L 60 108 L 24 144 L 16 136 Z" strokeLinejoin="round" />
      
      {/* Ball */}
      <circle {...oStyle} cx="95" cy="65" r="55" fill="#A3321A" />
      
      {/* Sprinkles */}
      <g strokeLinecap="round">
        {/* Teal Sprinkles */}
        <line x1="70" y1="35" x2="75" y2="38" stroke="#62D7D7" strokeWidth="4.5" />
        <line x1="120" y1="50" x2="115" y2="55" stroke="#62D7D7" strokeWidth="4.5" />
        <line x1="85" y1="95" x2="90" y2="98" stroke="#62D7D7" strokeWidth="4.5" />
        <line x1="55" y1="75" x2="60" y2="70" stroke="#62D7D7" strokeWidth="4.5" />
        <line x1="100" y1="25" x2="105" y2="30" stroke="#62D7D7" strokeWidth="4.5" />
        <line x1="135" y1="75" x2="132" y2="80" stroke="#62D7D7" strokeWidth="4.5" />
        
        {/* Yellow Sprinkles */}
        <line x1="90" y1="45" x2="92" y2="52" stroke="#FFD229" strokeWidth="4.5" />
        <line x1="130" y1="60" x2="125" y2="65" stroke="#FFD229" strokeWidth="4.5" />
        <line x1="75" y1="105" x2="80" y2="100" stroke="#FFD229" strokeWidth="4.5" />
        <line x1="55" y1="55" x2="60" y2="58" stroke="#FFD229" strokeWidth="4.5" />
        <line x1="110" y1="90" x2="115" y2="95" stroke="#FFD229" strokeWidth="4.5" />
        <line x1="80" y1="20" x2="85" y2="25" stroke="#FFD229" strokeWidth="4.5" />

        {/* Pink Sprinkles */}
        <line x1="80" y1="60" x2="85" y2="55" stroke="#FF77AF" strokeWidth="4.5" />
        <line x1="110" y1="70" x2="115" y2="65" stroke="#FF77AF" strokeWidth="4.5" />
        <line x1="100" y1="105" x2="95" y2="110" stroke="#FF77AF" strokeWidth="4.5" />
        <line x1="65" y1="85" x2="60" y2="90" stroke="#FF77AF" strokeWidth="4.5" />
        <line x1="115" y1="35" x2="120" y2="40" stroke="#FF77AF" strokeWidth="4.5" />
        <line x1="60" y1="40" x2="65" y2="35" stroke="#FF77AF" strokeWidth="4.5" />

        {/* White Sprinkles */}
        <line x1="105" y1="40" x2="110" y2="45" stroke="#FFF" strokeWidth="4.5" />
        <line x1="125" y1="85" x2="130" y2="80" stroke="#FFF" strokeWidth="4.5" />
        <line x1="65" y1="100" x2="60" y2="95" stroke="#FFF" strokeWidth="4.5" />
        <line x1="85" y1="80" x2="80" y2="85" stroke="#FFF" strokeWidth="4.5" />
        <line x1="140" y1="55" x2="135" y2="60" stroke="#FFF" strokeWidth="4.5" />
        <line x1="75" y1="50" x2="70" y2="55" stroke="#FFF" strokeWidth="4.5" />
        
        {/* Dot Sprinkles */}
        <circle cx="120" cy="35" r="3" fill="#FFF" />
        <circle cx="95" cy="80" r="3" fill="#FFD229" />
        <circle cx="55" cy="65" r="3" fill="#62D7D7" />
        <circle cx="130" cy="75" r="3" fill="#FF77AF" />
        <circle cx="75" cy="25" r="3" fill="#FFD229" />
        <circle cx="105" cy="60" r="3" fill="#FFF" />
      </g>
    </g>
  </svg>
)

export const CupcakesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(17, 10.8) scale(0.72)">
      <path {...oStyle} fill="#62D7D7" d="M35 105 L135 105 L122 178 L49 178 Z"/>
      <path {...thinStyle} d="M58 112l5 58M84 110v62M110 112l-5 58" fill="none"/>
      <path {...oStyle} fill="#FFD8A3" d="M27 105 Q24 85 45 79 Q44 58 66 58 Q78 35 96 55 Q117 47 123 68 Q145 68 143 92 Q151 101 135 105 Z"/>
      <path {...oStyle} fill="#FF9FC0" d="M40 79 Q42 57 65 58 Q77 35 96 55 Q118 47 124 69 Q141 71 140 88 Q118 78 100 88 Q80 99 61 87 Q51 80 40 79Z"/>
      <path {...oStyle} fill="#FFF" d="M77 37 C67 25 78 14 86 25 C94 14 105 25 95 37 L86 45 Z"/>
    </g>
  </svg>
)

export const CookiesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      {/* Whole Cookie (Back Left) */}
      <circle {...oStyle} cx="55" cy="65" r="40" fill="#F4C991" />
      
      {/* Chocolate Chips on Whole Cookie */}
      <circle {...oStyle} cx="45" cy="45" r="6" fill="#8B4A2B" />
      <circle {...oStyle} cx="70" cy="52" r="7" fill="#8B4A2B" />
      <circle {...oStyle} cx="35" cy="70" r="5" fill="#8B4A2B" />
      <circle {...oStyle} cx="55" cy="85" r="6" fill="#8B4A2B" />
      <circle cx="65" cy="75" r="2.5" fill="#8B4A2B" />
      <circle cx="30" cy="55" r="2" fill="#8B4A2B" />
      <circle cx="50" cy="65" r="3" fill="#8B4A2B" />

      {/* Bitten Cookie (Front Right) */}
      <path {...oStyle} fill="#F4C991" d="M 105 55 A 40 40 0 0 1 120 58 Q 115 68 125 72 Q 135 78 142 80 A 40 40 0 0 1 145 95 A 40 40 0 0 1 105 135 A 40 40 0 0 1 65 95 A 40 40 0 0 1 105 55 Z" strokeLinejoin="round" />
      
      {/* Chocolate Chips on Bitten Cookie */}
      <circle {...oStyle} cx="90" cy="80" r="6" fill="#8B4A2B" />
      <circle {...oStyle} cx="115" cy="100" r="7" fill="#8B4A2B" />
      <circle {...oStyle} cx="85" cy="105" r="5" fill="#8B4A2B" />
      <circle {...oStyle} cx="125" cy="115" r="5" fill="#8B4A2B" />
      <circle {...oStyle} cx="100" cy="120" r="6" fill="#8B4A2B" />
      <circle cx="110" cy="80" r="2.5" fill="#8B4A2B" />
      <circle cx="95" cy="100" r="3" fill="#8B4A2B" />
      <circle cx="75" cy="90" r="2" fill="#8B4A2B" />
    </g>
  </svg>
)

export const CakesiclesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(26.8, 7.8) scale(0.76)">
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
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(0, 25)">
      {/* Steam / Heat Waves */}
      <path d="M 55 50 Q 40 30 60 20 T 55 -5" stroke="#E5E5E5" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 80 45 Q 65 20 85 10 T 80 -20" stroke="#E5E5E5" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 105 55 Q 95 35 110 25 T 105 5" stroke="#E5E5E5" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Top Face */}
      <polygon {...oStyle} fill="#4A241A" points="80,60 135,75 80,95 25,75" strokeLinejoin="round" />
      
      {/* Left Front Face */}
      <polygon {...oStyle} fill="#331811" points="25,75 80,95 80,130 25,110" strokeLinejoin="round" />
      
      {/* Right Front Face */}
      <polygon {...oStyle} fill="#2B120C" points="80,95 135,75 135,110 80,130" strokeLinejoin="round" />

      {/* Horizontal Cracks & Texture */}
      <path d="M 30 92 L 45 102 L 60 100 L 75 107" stroke="#1F0F0A" strokeWidth="4" strokeLinecap="round" fill="none" strokeLinejoin="round" />
      <path d="M 85 107 L 105 100 L 115 102 L 130 92" stroke="#1F0F0A" strokeWidth="4" strokeLinecap="round" fill="none" strokeLinejoin="round" />
      
      <circle cx="45" cy="115" r="3" fill="#1F0F0A" />
      <circle cx="110" cy="110" r="3" fill="#1F0F0A" />
      <rect x="65" y="120" width="6" height="6" rx="2" fill="#1F0F0A" transform="rotate(15 65 120)" />

      {/* Milk Chocolate Drizzle (Black Outlines) */}
      <path d="M 35 72 Q 72 58 110 65 Q 77 84 45 82 Q 85 65 125 75 Q 100 95 75 90 Q 90 80 105 88" stroke="#333" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Milk Chocolate Drizzle (Fill) */}
      <path d="M 35 72 Q 72 58 110 65 Q 77 84 45 82 Q 85 65 125 75 Q 100 95 75 90 Q 90 80 105 88" stroke="#A05A3A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Chocolate Balls (Maltesers) */}
      <g>
        <circle {...oStyle} cx="60" cy="65" r="7" fill="#A05A3A" />
        <circle cx="58" cy="63" r="2" fill="#FFF" opacity="0.6" />

        <circle {...oStyle} cx="90" cy="62" r="7" fill="#A05A3A" />
        <circle cx="88" cy="60" r="2" fill="#FFF" opacity="0.6" />

        <circle {...oStyle} cx="75" cy="75" r="8" fill="#A05A3A" />
        <circle cx="73" cy="73" r="2.5" fill="#FFF" opacity="0.6" />

        <circle {...oStyle} cx="110" cy="72" r="6" fill="#A05A3A" />
        <circle cx="108" cy="70" r="1.5" fill="#FFF" opacity="0.6" />

        <circle {...oStyle} cx="45" cy="80" r="7" fill="#A05A3A" />
        <circle cx="43" cy="78" r="2" fill="#FFF" opacity="0.6" />

        <circle {...oStyle} cx="95" cy="85" r="7.5" fill="#A05A3A" />
        <circle cx="93" cy="83" r="2" fill="#FFF" opacity="0.6" />

        {/* Loose Balls on the side */}
        <circle {...oStyle} cx="20" cy="120" r="8" fill="#A05A3A" />
        <circle cx="18" cy="118" r="2" fill="#FFF" opacity="0.6" />

        <circle {...oStyle} cx="140" cy="115" r="7" fill="#A05A3A" />
        <circle cx="138" cy="113" r="1.5" fill="#FFF" opacity="0.6" />
      </g>
    </g>
  </svg>
)

export const MacaronsIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      {/* Macaron 1 (Bottom - Turquoise) */}
      <g transform="translate(80, 115) rotate(8)">
        <path {...oStyle} fill="#62D7D7" d="M -40 10 C -40 30 40 30 40 10 C 40 0 -40 0 -40 10 Z" />
        <path {...oStyle} fill="#FFF3E6" d="M -42 5 C -42 15 42 15 42 5 C 42 -5 -42 -5 -42 5 Z" />
        <path {...oStyle} fill="#29C7D4" d="M -40 0 C -40 -30 40 -30 40 0 C 40 10 -40 10 -40 0 Z" />
        
        <circle cx="-25" cy="12" r="1.5" fill="#29C7D4" />
        <circle cx="-5" cy="15" r="1.5" fill="#29C7D4" />
        <circle cx="15" cy="13" r="1.5" fill="#29C7D4" />
        <circle cx="25" cy="10" r="1.5" fill="#29C7D4" />
        <circle cx="-35" cy="11" r="1.5" fill="#29C7D4" />
      </g>

      {/* Macaron 2 (Middle - Pink) */}
      <g transform="translate(75, 80) rotate(-10)">
        <path {...oStyle} fill="#FFB6D0" d="M -40 10 C -40 30 40 30 40 10 C 40 0 -40 0 -40 10 Z" />
        <path {...oStyle} fill="#5B291A" d="M -42 5 C -42 15 42 15 42 5 C 42 -5 -42 -5 -42 5 Z" />
        <path {...oStyle} fill="#FF77AF" d="M -40 0 C -40 -30 40 -30 40 0 C 40 10 -40 10 -40 0 Z" />
        
        <circle cx="-25" cy="12" r="1.5" fill="#FF77AF" />
        <circle cx="-5" cy="15" r="1.5" fill="#FF77AF" />
        <circle cx="15" cy="13" r="1.5" fill="#FF77AF" />
        <circle cx="25" cy="10" r="1.5" fill="#FF77AF" />
        <circle cx="-35" cy="11" r="1.5" fill="#FF77AF" />
      </g>

      {/* Macaron 3 (Top - Yellow) */}
      <g transform="translate(85, 45) rotate(5)">
        <path {...oStyle} fill="#FFD8A3" d="M -40 10 C -40 30 40 30 40 10 C 40 0 -40 0 -40 10 Z" />
        <path {...oStyle} fill="#5B291A" d="M -42 5 C -42 15 42 15 42 5 C 42 -5 -42 -5 -42 5 Z" />
        <path {...oStyle} fill="#F4C991" d="M -40 0 C -40 -30 40 -30 40 0 C 40 10 -40 10 -40 0 Z" />
        
        <circle cx="-25" cy="12" r="1.5" fill="#F4C991" />
        <circle cx="-5" cy="15" r="1.5" fill="#F4C991" />
        <circle cx="15" cy="13" r="1.5" fill="#F4C991" />
        <circle cx="25" cy="10" r="1.5" fill="#F4C991" />
        <circle cx="-35" cy="11" r="1.5" fill="#F4C991" />
      </g>
    </g>
  </svg>
)

export const TrufflesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(4.4, 17.9) scale(1.08)">
      {/* Truffle 2 (Back) */}
      <circle {...oStyle} cx="80" cy="40" r="35" fill="#E8C396" />
      {/* Drizzle on Back Truffle */}
      <path {...oStyle} d="M60 20 Q70 10 75 30 T95 25 T100 45" fill="none" stroke="#8D3E25" strokeWidth="4" />
      
      {/* Spoon */}
      <path {...oStyle} fill="#FFD8A3" d="M 82 70 L 110 25 A 3.6 3.6 0 0 1 116 29 L 88 74 Z" strokeLinejoin="round" />
      
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

      {/* Cup Base */}
      <path {...oStyle} fill="#FFF" d="M 35 95 L 68 95 L 65 110 L 38 110 Z" strokeLinejoin="round" />
      {/* Smooth Cup Body */}
      <path {...oStyle} fill="#FFF" d="M 3 70 L 100 70 C 100 115 3 115 3 70 Z" strokeLinejoin="round" />
    </g>
  </svg>
)

export const CakeJarsIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(23.3, 11.1) scale(0.81)">
      {/* Lid */}
      <rect {...oStyle} x="45" y="15" width="50" height="15" rx="4" fill="#FFD8A3" />
      <rect {...oStyle} x="40" y="27" width="60" height="8" rx="2" fill="#E8C396" />
      
      {/* Jar Body */}
      <path {...oStyle} d="M35 35 L105 35 Q115 35 115 45 L115 145 Q115 155 105 155 L35 155 Q25 155 25 145 L25 45 Q25 35 35 35 Z" fill="#FFF3E6" />
      
      {/* Layers inside Jar */}
      <path d="M26 130 L114 130 Q114 154 104 154 L36 154 Q26 154 26 130 Z" fill="#5B291A" />
      <path d="M26 105 L114 105 L114 130 L26 130 Z" fill="#FF77AF" />
      <path d="M26 80 L114 80 L114 105 L26 105 Z" fill="#FFD8A3" />
      <path d="M26 50 L114 50 L114 80 L26 80 Z" fill="#FFB6D0" />
      
      {/* Whipped Cream Top */}
      <path {...oStyle} fill="#FFF" d="M40 50 Q50 35 60 50 Q70 35 80 50 Q90 35 100 50 Z" />
      {/* Cherry on top */}
      <circle cx="70" cy="38" r="8" fill="#FF4F7B" stroke="#333" strokeWidth="3" />
      
      {/* Outer Jar Outline */}
      <path {...oStyle} d="M35 35 L105 35 Q115 35 115 45 L115 145 Q115 155 105 155 L35 155 Q25 155 25 145 L25 45 Q25 35 35 35 Z" fill="none" />
    </g>
  </svg>
)

export const GiftBoxesIcon = ({ width = 160, height = 160, className = '' }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(17, 3.5) scale(0.9)">
      {/* Box Body */}
      <rect {...oStyle} x="30" y="65" width="80" height="80" rx="6" fill="#FF77AF" />
      
      {/* Box Lid */}
      <rect {...oStyle} x="22" y="45" width="96" height="22" rx="4" fill="#FFB6D0" />
      
      {/* Vertical Ribbon */}
      <rect x="62" y="45" width="16" height="100" fill="#62D7D7" stroke="#333" strokeWidth="4" />
      
      {/* Horizontal Ribbon */}
      <rect x="22" y="80" width="96" height="16" fill="#62D7D7" stroke="#333" strokeWidth="4" />
      
      {/* Bow Left Loop */}
      <path {...oStyle} fill="#62D7D7" d="M70 45 C45 25 35 35 60 45 Z" />
      {/* Bow Right Loop */}
      <path {...oStyle} fill="#62D7D7" d="M70 45 C95 25 105 35 80 45 Z" />
      {/* Bow Center Knot */}
      <circle cx="70" cy="45" r="7" fill="#29C7D4" stroke="#333" strokeWidth="4" />
    </g>
  </svg>
)
