import React from 'react'
import { Flavour } from '@/types/product'
import { formatCurrency } from '@/lib/formatters/currency'
import { Check } from 'lucide-react'
import styles from './FlavourSelector.module.css'

interface FlavourSelectorProps {
  flavours?: Flavour[]
  selectedId: string | null
  onChange: (id: string | null) => void
}

const getSprinkles = (id: string) => {
  const hashStr = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FFFFFF', '#FF9F1C', '#FFB6C1', '#1A535C', '#3c2415'];
  
  const sprinkles = [];
  const numSprinkles = 12; // distribute 12 sprinkles evenly
  
  for (let i = 0; i < numSprinkles; i++) {
    const hash = hashStr + i * 17;
    const isRod = i % 2 === 0; // alternating dots and rods
    
    // Polar coordinates for even spread
    // Divide into 12 sectors, add some pseudo-random jitter to angle
    const angleDeg = (i * (360 / numSprinkles)) + (hash % 20) - 10;
    const angleRad = angleDeg * (Math.PI / 180);
    
    // Radius between 12 and 40 to stay well inside the r=50 circle
    const rDist = 15 + (hash % 25);
    
    const cx = 50 + rDist * Math.cos(angleRad);
    const cy = 50 + rDist * Math.sin(angleRad);
    
    const color = colors[hash % colors.length];
    
    if (isRod) {
      sprinkles.push({
        type: 'rod',
        id: i,
        x: cx - 4,
        y: cy - 2,
        w: 8,
        h: 4,
        rx: 2,
        rot: hash * 11 % 360,
        rotCx: cx,
        rotCy: cy,
        color
      });
    } else {
      sprinkles.push({
        type: 'dot',
        id: i,
        cx,
        cy,
        r: 2.5 + (hash % 2),
        color
      });
    }
  }
  return sprinkles;
}

export const FlavourSelector = ({ flavours, selectedId, onChange }: FlavourSelectorProps) => {
  if (!flavours || flavours.length === 0) return null

  return (
    <div className={styles.container}>
      <div className={styles.optionsGrid}>
        {flavours.map((flavour) => {
          const isSelected = selectedId === flavour.id
          
          return (
            <button
              key={flavour.id}
              className={`${styles.flavourCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => onChange(isSelected ? null : flavour.id)}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className={styles.checkBadge}>
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
              <div className={styles.svgWrapper}>
                <svg viewBox="0 0 100 100" className={styles.flavorSvg}>
                  <defs>
                    <linearGradient id="mixed-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF77AF" />
                      <stop offset="33%" stopColor="#FFD8A3" />
                      <stop offset="66%" stopColor="#4A90E2" />
                      <stop offset="100%" stopColor="#5B291A" />
                    </linearGradient>
                  </defs>
                  
                  {/* Base Body */}
                  <circle cx="50" cy="50" r="50" fill={flavour.colorHex || '#ddd'} />
                  
                  {/* Sprinkles (mixed dots and rods evenly distributed) */}
                  {getSprinkles(flavour.id).map(s => {
                    if (s.type === 'dot') {
                      return <circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill={s.color} />;
                    } else {
                      return (
                        <rect 
                          key={s.id} 
                          x={s.x} y={s.y} 
                          width={s.w} height={s.h} rx={s.rx} 
                          fill={s.color} 
                          transform={`rotate(${s.rot} ${s.rotCx} ${s.rotCy})`}
                        />
                      );
                    }
                  })}
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.flavourName}>{flavour.name}</span>
                <span className={styles.flavourPrice}>
                  {flavour.priceModifier > 0 ? `+ ${formatCurrency(flavour.priceModifier)}` : '+ ₹0'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
