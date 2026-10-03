import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button 
            key={i}
            className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      // Always show first page
      pages.push(
        <button 
          key={1}
          className={`${styles.pageButton} ${currentPage === 1 ? styles.active : ''}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );

      // Ellipsis or middle pages
      if (currentPage > 3) {
        pages.push(<span key="ellipsis-1" className={styles.ellipsis}>...</span>);
      }

      // Middle pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button 
            key={i}
            className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }

      // Ellipsis or last page
      if (currentPage < totalPages - 2) {
        pages.push(<span key="ellipsis-2" className={styles.ellipsis}>...</span>);
      }

      // Always show last page
      pages.push(
        <button 
          key={totalPages}
          className={`${styles.pageButton} ${currentPage === totalPages ? styles.active : ''}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button 
        className={styles.navButton} 
        disabled={currentPage === 1} 
        aria-label="Previous Page"
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className={styles.pages}>
        {renderPageNumbers()}
      </div>

      <button 
        className={styles.navButton} 
        disabled={currentPage === totalPages} 
        aria-label="Next Page"
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
