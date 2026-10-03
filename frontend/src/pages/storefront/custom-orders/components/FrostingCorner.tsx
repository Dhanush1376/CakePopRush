import React, { useId } from 'react';

export type CornerPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type FrostingVariant = 'pink' | 'yellow' | 'turquoise' | 'default';

export interface FrostingCornerProps {
  position?: CornerPosition;
  variant?: FrostingVariant;
  style?: React.CSSProperties;
  className?: string;
}

const VARIANTS = {
  pink: { outer: '#FFDFE8', inner: '#FFC2D6' },
  yellow: { outer: '#FFF8D6', inner: '#FFF2AD' },
  turquoise: { outer: '#D6F8F1', inner: '#B3EBE0' },
};

export const FrostingCorner = ({ position = 'topRight', variant = 'default', style, className }: FrostingCornerProps) => {
  const clipId = 'clip-' + useId().replace(/:/g, '');
  const getColors = (defaultVariant: 'pink' | 'yellow' | 'turquoise') => {
    return variant === 'default' ? VARIANTS[defaultVariant] : VARIANTS[variant];
  };

  const renderTopLeft = () => {
    const { outer, inner } = getColors('pink');
    return (
      <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 L400,0 C380,120 280,250 150,320 C80,350 30,380 0,400 Z" fill={outer} opacity="0.8" />
        <path d="M0,0 L280,0 C260,80 180,160 80,220 C40,240 10,260 0,280 Z" fill={inner} opacity="0.9" />
        {/* Sprinkles */}
        <rect x="250" y="80" width="8" height="4" rx="2" transform="rotate(30 250 80)" fill="#FFD000" />
        <rect x="280" y="150" width="8" height="4" rx="2" transform="rotate(-45 280 150)" fill="#07C2BB" />
        <circle cx="180" cy="180" r="3" fill="#07C2BB" />
        <circle cx="210" cy="220" r="2.5" fill="#FFD000" />
        <circle cx="120" cy="280" r="3" fill="#F495B4" />
      </svg>
    );
  };

  const renderTopRight = () => {
    const { outer, inner } = getColors('yellow');
    return (
      <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}>
            <path d="M400,0 L0,0 C20,120 120,250 250,320 C320,350 370,380 400,400 Z" />
          </clipPath>
        </defs>
        <path d="M400,0 L0,0 C20,120 120,250 250,320 C320,350 370,380 400,400 Z" fill={outer} opacity="0.8" />
        <path d="M400,0 L120,0 C140,80 220,160 320,220 C360,240 390,260 400,280 Z" fill={inner} opacity="0.6" />
        {/* Sprinkles */}
        <rect x="150" y="80" width="8" height="4" rx="2" transform="rotate(-30 150 80)" fill="#F495B4" />
        <rect x="120" y="150" width="8" height="4" rx="2" transform="rotate(45 120 150)" fill="#07C2BB" />
        <circle cx="220" cy="180" r="3" fill="#FFD000" />
        <circle cx="190" cy="220" r="2.5" fill="#F495B4" />
        <circle cx="280" cy="280" r="3" fill="#FFD000" />
      </svg>
    );
  };

  const renderBottomLeft = () => {
    const { outer, inner } = getColors('yellow');
    return (
      <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,400 L400,400 C380,280 280,150 150,80 C80,50 30,20 0,0 Z" fill={outer} opacity="0.8" />
        <path d="M0,400 L280,400 C260,320 180,240 80,180 C40,160 10,140 0,120 Z" fill={inner} opacity="0.7" />

        {/* Sprinkles */}
        <rect x="250" y="320" width="8" height="4" rx="2" transform="rotate(60 250 320)" fill="#07C2BB" />
        <rect x="280" y="250" width="8" height="4" rx="2" transform="rotate(-15 280 250)" fill="#F495B4" />
        <circle cx="180" cy="220" r="3" fill="#FFD000" />
        <circle cx="210" cy="180" r="2.5" fill="#07C2BB" />
        <circle cx="120" cy="120" r="3" fill="#FFD000" />
      </svg>
    );
  };

  const renderBottomRight = () => {
    const { outer, inner } = getColors('turquoise');
    return (
      <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M400,400 L0,400 C20,280 120,150 250,80 C320,50 370,20 400,0 Z" fill={outer} opacity="0.9" />
        <path d="M400,400 L120,400 C140,320 220,240 320,180 C360,160 390,140 400,120 Z" fill={inner} opacity="0.8" />
        {/* Sprinkles */}
        <rect x="150" y="320" width="8" height="4" rx="2" transform="rotate(-60 150 320)" fill="#FFD000" />
        <rect x="120" y="250" width="8" height="4" rx="2" transform="rotate(15 120 250)" fill="#F495B4" />
        <circle cx="220" cy="220" r="3" fill="#FFDFE8" />
        <circle cx="190" cy="180" r="2.5" fill="#FFD000" />
        <circle cx="280" cy="120" r="3" fill="#F495B4" />
      </svg>
    );
  };

  const getPositionStyles = (pos: CornerPosition): React.CSSProperties => {
    switch (pos) {
      case 'topLeft': return { position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 };
      case 'topRight': return { position: 'absolute', top: 0, right: 0, pointerEvents: 'none', zIndex: 0 };
      case 'bottomLeft': return { position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none', zIndex: 0 };
      case 'bottomRight': return { position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none', zIndex: 0 };
    }
  };

  const renderSvg = () => {
    switch (position) {
      case 'topLeft': return renderTopLeft();
      case 'topRight': return renderTopRight();
      case 'bottomLeft': return renderBottomLeft();
      case 'bottomRight': return renderBottomRight();
    }
  };

  return (
    <div style={{ ...getPositionStyles(position), ...style }} className={className}>
      {renderSvg()}
    </div>
  );
};
