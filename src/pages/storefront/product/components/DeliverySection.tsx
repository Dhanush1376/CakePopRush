import React, { useState } from 'react'
import { MapPin, Truck, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import styles from './DeliverySection.module.css'

interface DeliverySectionProps {
  pincode: string
  isChecking: boolean
  isAvailable: boolean | null
  onCheck: (pincode: string) => void
  preparationTime?: string
}

export const DeliverySection = ({ 
  pincode, 
  isChecking, 
  isAvailable, 
  onCheck,
  preparationTime
}: DeliverySectionProps) => {
  const [localCode, setLocalCode] = useState(pincode)

  const handleCheck = () => {
    if (localCode.length >= 6) {
      onCheck(localCode)
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Delivery</h3>
      
      <div className={styles.card}>
        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <MapPin size={18} className={styles.icon} />
            <input
              type="text"
              placeholder="Enter Pincode"
              value={localCode}
              onChange={(e) => setLocalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={styles.input}
              maxLength={6}
            />
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCheck}
            disabled={localCode.length < 6 || isChecking}
            isLoading={isChecking}
          >
            Check
          </Button>
        </div>

        {isAvailable === true && (
          <div className={styles.resultSuccess}>
            <div className={styles.resultHeader}>
              <Truck size={16} />
              <span>Delivery available to {pincode}</span>
            </div>
            <div className={styles.deliveryTime}>
              <CalendarClock size={16} />
              <span>Get it by <strong>Tomorrow, 12 PM – 4 PM</strong></span>
            </div>
            {preparationTime && (
              <div className={styles.freshBadge}>
                Freshly prepared in {preparationTime}
              </div>
            )}
          </div>
        )}

        {isAvailable === false && (
          <div className={styles.resultError}>
            Sorry, we don't deliver to {pincode} yet.
          </div>
        )}
      </div>
    </div>
  )
}
