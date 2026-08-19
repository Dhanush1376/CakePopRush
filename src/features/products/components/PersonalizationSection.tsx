import React from 'react'
import { MessageSquareHeart } from 'lucide-react'
import styles from './PersonalizationSection.module.css'

interface PersonalizationSectionProps {
  message: string
  onChange: (message: string) => void
  maxLength?: number
}

export const PersonalizationSection = ({ 
  message, 
  onChange, 
  maxLength = 50 
}: PersonalizationSectionProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <MessageSquareHeart size={20} className={styles.icon} />
        <h3 className={styles.label}>Add a Personal Message</h3>
      </div>
      
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={message}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="e.g. Happy Birthday Rahul!"
          className={styles.input}
        />
        <div className={styles.counter}>
          <span className={message.length >= maxLength ? styles.counterMax : ''}>
            {message.length}
          </span>
          <span> / {maxLength}</span>
        </div>
      </div>
    </div>
  )
}
