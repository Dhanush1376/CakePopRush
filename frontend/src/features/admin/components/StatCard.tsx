import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import styles from './AdminComponents.module.css'

interface StatCardProps {
  title: string
  data: {
    value: string
    growth: string
    isPositive: boolean
    comparison: string
  }
  icon: React.ReactNode
  iconBg: string
  decoration?: React.ReactNode
}

export function StatCard({ title, data, icon, iconBg, decoration }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles.statCardMobile}`} style={{ padding: '1.25rem', overflow: decoration ? 'visible' : 'hidden' }}>
      {decoration}
      <div className={styles.statContent}>
        <div 
          className={styles.statIcon}
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.statTitle}>
            {title}
          </span>
          <span className={styles.statValue}>
            {data.value}
          </span>
          
          <div className={styles.statMeta}>
            <span className={styles.statGrowth} style={{ 
              color: data.isPositive ? 'var(--admin-green)' : 'var(--color-error)'
            }}>
              {data.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {data.growth}
            </span>
            <span className={styles.statComparison}>
              {data.comparison}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
