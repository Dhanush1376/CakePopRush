import React from 'react';

export type HomeFrostingPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftSide' | 'rightSide' | 'rightSidePink' | 'rightSideBlue' | 'leftSideBlue' | 'leftSideTurquoise';

export interface HomeFrostingProps {
  position?: HomeFrostingPosition;
  style?: React.CSSProperties;
  className?: string;
}

export const HomeFrosting = ({ position = 'topLeft', style, className }: HomeFrostingProps) => {
  const getPositionStyles = (pos: HomeFrostingPosition): React.CSSProperties => {
    switch (pos) {
      case 'topLeft': return { position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 };
      case 'topRight': return { position: 'absolute', top: 0, right: 0, pointerEvents: 'none', zIndex: 0 };
      case 'bottomLeft': return { position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none', zIndex: 0 };
      case 'bottomRight': return { position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none', zIndex: 0 };
      case 'leftSide': 
      case 'leftSideBlue': 
      case 'leftSideTurquoise': return { position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 0 };
      case 'rightSide': 
      case 'rightSidePink': 
      case 'rightSideBlue': return { position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 0 };
    }
  };

  // Color Palette requested: Yellow, Blue, Turquoise
  // Yellow: #FFD000 / #FFF8D6 / #FFF2AD
  // Blue: #3B82F6 (bright blue) / #DBEAFE (light blue) / #BFDBFE (soft blue)
  // Turquoise: #07C2BB (teal/turquoise) / #D6F8F1 / #B3EBE0

  const renderTopLeft = () => (
    <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 L400,0 C380,120 280,250 150,320 C80,350 30,380 0,400 Z" fill="#DBEAFE" opacity="0.8" />
      <path d="M0,0 L280,0 C260,80 180,160 80,220 C40,240 10,260 0,280 Z" fill="#BFDBFE" opacity="0.9" />
      <path d="M0,50 C80,80 140,130 160,220 C180,280 120,320 140,400" stroke="#BFDBFE" strokeWidth="2" fill="none" />
      
      {/* Sprinkles */}
      <rect x="250" y="80" width="8" height="4" rx="2" transform="rotate(30 250 80)" fill="#FFD000" />
      <rect x="280" y="150" width="8" height="4" rx="2" transform="rotate(-45 280 150)" fill="#07C2BB" />
      <circle cx="180" cy="180" r="3" fill="#07C2BB" />
      <circle cx="210" cy="220" r="2.5" fill="#FFD000" />
      <circle cx="120" cy="280" r="3" fill="#FFD000" />
    </svg>
  );

  const renderTopRight = () => (
    <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M400,0 L0,0 C20,120 120,250 250,320 C320,350 370,380 400,400 Z" fill="#FFF8D6" opacity="0.9" />
      <path d="M400,0 L120,0 C140,80 220,160 320,220 C360,240 390,260 400,280 Z" fill="#FFF2AD" opacity="0.8" />
      
      {/* Wavy lines */}
      <path d="M400,50 C320,80 260,130 240,220 C220,280 280,320 260,400" stroke="#FFF2AD" strokeWidth="2" fill="none" />
      
      {/* Sprinkles */}
      <rect x="150" y="80" width="8" height="4" rx="2" transform="rotate(-30 150 80)" fill="#3B82F6" />
      <rect x="120" y="150" width="8" height="4" rx="2" transform="rotate(45 120 150)" fill="#07C2BB" />
      <circle cx="220" cy="180" r="3" fill="#3B82F6" />
      <circle cx="280" cy="280" r="3" fill="#07C2BB" />
    </svg>
  );

  const renderBottomLeft = () => (
    <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,400 L400,400 C380,280 280,150 150,80 C80,50 30,20 0,0 Z" fill="#D6F8F1" opacity="0.9" />
      <path d="M0,400 L280,400 C260,320 180,240 80,180 C40,160 10,140 0,120 Z" fill="#B3EBE0" opacity="0.8" />
      
      {/* Sprinkles */}
      <rect x="250" y="320" width="8" height="4" rx="2" transform="rotate(60 250 320)" fill="#FFD000" />
      <rect x="280" y="250" width="8" height="4" rx="2" transform="rotate(-15 280 250)" fill="#3B82F6" />
      <circle cx="180" cy="220" r="3" fill="#3B82F6" />
      <circle cx="120" cy="120" r="3" fill="#FFD000" />
    </svg>
  );

  const renderBottomRight = () => (
    <svg width="240" height="240" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M400,400 L0,400 C20,280 120,150 250,80 C320,50 370,20 400,0 Z" fill="#DBEAFE" opacity="0.8" />
      <path d="M400,400 L120,400 C140,320 220,240 320,180 C360,160 390,140 400,120 Z" fill="#BFDBFE" opacity="0.9" />
      
      {/* Sprinkles */}
      <rect x="150" y="320" width="8" height="4" rx="2" transform="rotate(-60 150 320)" fill="#FFD000" />
      <rect x="120" y="250" width="8" height="4" rx="2" transform="rotate(15 120 250)" fill="#07C2BB" />
      <circle cx="220" cy="220" r="3" fill="#07C2BB" />
      <circle cx="280" cy="120" r="3" fill="#FFD000" />
    </svg>
  );

  const renderLeftSide = () => (
    <svg width="200" height="400" viewBox="0 0 160 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 10 C 120 10, 150 100, 90 160 C 40 210, 130 270, 0 310 Z" fill="#FFF8D6" opacity="0.9" />
      <path d="M 0 30 C 90 30, 110 100, 60 160 C 20 210, 90 260, 0 290 Z" fill="#FFF2AD" opacity="0.8" />
      
      {/* Sprinkles */}
      <rect x="30" y="60" width="8" height="4" rx="2" transform="rotate(45 30 60)" fill="#3B82F6" />
      <rect x="60" y="140" width="8" height="4" rx="2" transform="rotate(-30 60 140)" fill="#07C2BB" />
      <circle cx="30" cy="180" r="3" fill="#3B82F6" />
      <circle cx="45" cy="250" r="2.5" fill="#07C2BB" />
    </svg>
  );

  const renderRightSide = () => (
    <svg width="200" height="400" viewBox="0 0 160 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mirror of the left side, sticking to the right edge */}
      <path d="M 160 10 C 40 10, 10 100, 70 160 C 120 210, 30 270, 160 310 Z" fill="#D6F8F1" opacity="0.9" />
      <path d="M 160 30 C 70 30, 50 100, 100 160 C 140 210, 70 260, 160 290 Z" fill="#B3EBE0" opacity="0.8" />
      
      {/* Sprinkles */}
      <rect x="120" y="60" width="8" height="4" rx="2" transform="rotate(-45 120 60)" fill="#FFD000" />
      <rect x="90" y="140" width="8" height="4" rx="2" transform="rotate(30 90 140)" fill="#3B82F6" />
      <circle cx="120" cy="180" r="3" fill="#FFD000" />
      <circle cx="105" cy="250" r="2.5" fill="#3B82F6" />
    </svg>
  );

  const renderRightSidePink = () => (
    <svg width="200" height="400" viewBox="0 0 160 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 160 10 C 40 10, 10 100, 70 160 C 120 210, 30 270, 160 310 Z" fill="#FFDFE8" opacity="0.9" />
      <path d="M 160 30 C 70 30, 50 100, 100 160 C 140 210, 70 260, 160 290 Z" fill="#FFC2D6" opacity="0.8" />
      
      {/* Sprinkles */}
      <rect x="120" y="60" width="8" height="4" rx="2" transform="rotate(-45 120 60)" fill="#FFD000" />
      <rect x="90" y="140" width="8" height="4" rx="2" transform="rotate(30 90 140)" fill="#07C2BB" />
      <circle cx="120" cy="180" r="3" fill="#3B82F6" />
      <circle cx="105" cy="250" r="2.5" fill="#FFD000" />
    </svg>
  );

  const renderRightSideBlue = () => (
    <svg width="200" height="400" viewBox="0 0 160 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 160 10 C 80 10, 60 100, 100 150 C 140 200, 60 250, 160 310 Z" fill="#DBEAFE" opacity="0.9" />
      <path d="M 160 30 C 100 30, 90 100, 120 150 C 150 200, 90 250, 160 290 Z" fill="#BFDBFE" opacity="0.8" />
      
      {/* Sprinkles */}
      <rect x="130" y="50" width="8" height="4" rx="2" transform="rotate(15 130 50)" fill="#FFD000" />
      <rect x="100" y="120" width="8" height="4" rx="2" transform="rotate(-60 100 120)" fill="#07C2BB" />
      <circle cx="140" cy="190" r="3" fill="#FFD000" />
      <circle cx="95" cy="240" r="2.5" fill="#07C2BB" />
    </svg>
  );

  const renderLeftSideBlue = () => (
    <svg width="200" height="400" viewBox="0 0 160 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 10 C 80 10, 100 100, 60 150 C 20 200, 100 250, 0 310 Z" fill="#DBEAFE" opacity="0.9" />
      <path d="M 0 30 C 60 30, 70 100, 40 150 C 10 200, 70 250, 0 290 Z" fill="#BFDBFE" opacity="0.8" />
      
      {/* Sprinkles */}
      <rect x="30" y="50" width="8" height="4" rx="2" transform="rotate(-15 30 50)" fill="#FFD000" />
      <rect x="60" y="120" width="8" height="4" rx="2" transform="rotate(60 60 120)" fill="#07C2BB" />
      <circle cx="20" cy="190" r="3" fill="#FFD000" />
      <circle cx="65" cy="240" r="2.5" fill="#07C2BB" />
    </svg>
  );

  const renderLeftSideTurquoise = () => (
    <svg width="200" height="400" viewBox="0 0 160 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 10 C 80 10, 100 100, 60 150 C 20 200, 100 250, 0 310 Z" fill="#D6F8F1" opacity="0.9" />
      <path d="M 0 30 C 60 30, 70 100, 40 150 C 10 200, 70 250, 0 290 Z" fill="#B3EBE0" opacity="0.8" />
      
      {/* Sprinkles */}
      <rect x="30" y="50" width="8" height="4" rx="2" transform="rotate(-15 30 50)" fill="#FFD000" />
      <rect x="60" y="120" width="8" height="4" rx="2" transform="rotate(60 60 120)" fill="#3B82F6" />
      <circle cx="20" cy="190" r="3" fill="#FFD000" />
      <circle cx="65" cy="240" r="2.5" fill="#3B82F6" />
    </svg>
  );

  const renderSvg = () => {
    switch (position) {
      case 'topLeft': return renderTopLeft();
      case 'topRight': return renderTopRight();
      case 'bottomLeft': return renderBottomLeft();
      case 'bottomRight': return renderBottomRight();
      case 'leftSide': return renderLeftSide();
      case 'rightSide': return renderRightSide();
      case 'rightSidePink': return renderRightSidePink();
      case 'rightSideBlue': return renderRightSideBlue();
      case 'leftSideBlue': return renderLeftSideBlue();
      case 'leftSideTurquoise': return renderLeftSideTurquoise();
    }
  };

  return (
    <div style={{ ...getPositionStyles(position), ...style }} className={className}>
      {renderSvg()}
    </div>
  );
};
