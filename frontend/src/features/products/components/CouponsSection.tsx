import React, { useState } from 'react'
import { Tag, Copy, Lock, Check } from 'lucide-react'
import styles from './CouponsSection.module.css'
import { formatCurrency } from '@/lib/formatters/currency'

interface CouponsSectionProps {
  currentTotal: number
}

const OFFERS = [
  {
    id: 'off-15',
    title: '15% Off',
    code: 'CAKEPOP15',
    threshold: 400,
    description: 'On order of ₹400',
    expiry: '30 MAY'
  },
  {
    id: 'off-10',
    title: '10% Off',
    code: 'WELCOME10',
    threshold: 600,
    description: 'On order of ₹600',
    expiry: '1 JUN'
  }
]

export const CouponsSection = ({ currentTotal }: CouponsSectionProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Tag size={16} className={styles.icon} />
        <h3 className={styles.title}>Available Coupons & Savings</h3>
      </div>
      
      <div className={styles.list}>
        {OFFERS.map((offer, index) => {
          const isUnlocked = currentTotal >= offer.threshold
          const amountNeeded = offer.threshold - currentTotal

          return (
            <div 
              key={offer.id} 
              className={`${styles.card} ${isUnlocked ? styles.unlocked : styles.locked}`}
            >
              {/* Badge on first offer */}
              {index === 0 && (
                <div className={styles.badge}>BEST OFFER</div>
              )}

              <div className={styles.cardTop}>
                <div className={styles.codePill}>
                  {isUnlocked ? offer.code : (
                    <><Lock size={12} className={styles.lockIcon} /> LOCKED</>
                  )}
                </div>
              </div>
              
              <div className={styles.cardMain}>
                <h4 className={styles.offerTitle}>{offer.title}</h4>
                <p className={styles.offerDesc}>{offer.description}</p>
              </div>
              
              <div className={styles.cardDivider}></div>
              
              <div className={styles.cardBottom}>
                <span className={styles.expiry}>EXP: {offer.expiry}</span>
                {isUnlocked ? (
                  <button 
                    className={styles.copyBtn}
                    onClick={() => handleCopy(offer.code, offer.id)}
                  >
                    {copiedId === offer.id ? (
                      <><Check size={14} /> COPIED</>
                    ) : (
                      <><Copy size={14} /> COPY CODE</>
                    )}
                  </button>
                ) : (
                  <span className={styles.lockedText}>Add {formatCurrency(amountNeeded)} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
