import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
}

export const Pagination = ({ currentPage = 1, totalPages = 8 }: PaginationProps) => {
  return (
    <div className={styles.pagination}>
      <button className={styles.navButton} disabled={currentPage === 1} aria-label="Previous Page">
        <ChevronLeft size={20} />
      </button>
      
      <div className={styles.pages}>
        <button className={`${styles.pageButton} ${styles.active}`}>1</button>
        <button className={styles.pageButton}>2</button>
        <button className={styles.pageButton}>3</button>
        <span className={styles.ellipsis}>...</span>
        <button className={styles.pageButton}>{totalPages}</button>
      </div>

      <button className={styles.navButton} disabled={currentPage === totalPages} aria-label="Next Page">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
