import { Calendar } from 'lucide-react'
import styles from './AdminComponents.module.css'

export function WelcomeSection() {
  return (
    <div className={styles.welcomeSection}>
      <div style={{ minWidth: 0 }}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, Admin!
        </h1>
        <p className={styles.welcomeSubtitle}>
          Here's what's happening with your store today.
        </p>
      </div>
      
      <button className={styles.datePickerBtn}>
        <Calendar size={16} color="var(--color-text-muted)" />
        <span className={styles.dateTextDesktop}>May 18 - May 24, 2025</span>
        <span className={styles.dateTextMobile}>May 18-24</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '2px'}}><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  )
}
