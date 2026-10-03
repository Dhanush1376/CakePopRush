import React from 'react'
import { MessageCircle } from 'lucide-react'
import styles from './CustomThemeCTA.module.css'

export const CustomThemeCTA = () => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Looking for a Custom Design?</h3>
      <p className={styles.description}>
        We can customize cake pops for birthdays, weddings, or corporate events!
      </p>
      
      <div className={styles.actions}>
        <button 
          className={styles.btnCustomize}
          onClick={() => console.log('Customize clicked')}
        >
          Customize
        </button>
        <button 
          className={styles.btnWhatsapp}
          onClick={() => window.open('https://wa.me/1234567890', '_blank')}
        >
          <MessageCircle size={16} />
          WhatsApp
        </button>
      </div>
    </div>
  )
}
