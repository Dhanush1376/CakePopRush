import styles from './AdminDashboardSkeleton.module.css'

export function AdminDashboardSkeleton() {
  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div>
          <div className={`${styles.skeleton} ${styles.welcomeText}`} />
          <div className={`${styles.skeleton} ${styles.welcomeSubtext}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.welcomeDate}`} />
      </div>
      
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.skeleton} ${styles.statTitle}`} />
              <div className={`${styles.skeleton} ${styles.statIcon}`} />
            </div>
            <div className={`${styles.skeleton} ${styles.statValue}`} />
          </div>
        ))}
      </div>
      
      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <div className={`${styles.skeleton} ${styles.chartCard}`} />
        <div className={`${styles.skeleton} ${styles.chartCardSmall}`} />
      </div>
      
      {/* Bottom Grid */}
      <div className={styles.bottomGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`bottom-${i}`} className={`${styles.skeleton} ${styles.bottomCard}`} />
        ))}
      </div>
    </div>
  )
}
