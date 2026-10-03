import React from 'react'
import { Gift, Heart, Cake, Baby, GraduationCap, PartyPopper, Star } from 'lucide-react'
import styles from './OccasionSelector.module.css'

interface OccasionSelectorProps {
  occasions?: string[]
  selectedOccasion: string | null
  onChange: (occasion: string) => void
}

const getOccasionIcon = (occasion: string) => {
  switch (occasion.toLowerCase()) {
    case 'birthday': return <Cake size={24} />
    case 'anniversary': return <Heart size={24} />
    case 'wedding': return <PartyPopper size={24} />
    case 'baby shower': return <Baby size={24} />
    case 'graduation': return <GraduationCap size={24} />
    case 'thank you': return <Gift size={24} />
    case 'just because': return <Star size={24} />
    default: return <Gift size={24} />
  }
}

export const OccasionSelector = ({ occasions, selectedOccasion, onChange }: OccasionSelectorProps) => {
  if (!occasions || occasions.length === 0) return null

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>What's the occasion?</h3>
      <div className={styles.grid}>
        {occasions.map((occasion) => {
          const isSelected = selectedOccasion === occasion
          
          return (
            <button
              key={occasion}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => onChange(occasion)}
              aria-pressed={isSelected}
            >
              <div className={styles.iconWrapper}>
                {getOccasionIcon(occasion)}
              </div>
              <span className={styles.name}>{occasion}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
