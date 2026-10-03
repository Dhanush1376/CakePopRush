import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import styles from './ScrollToTopButton.module.css';

interface ScrollToTopButtonProps {
  isWhatsAppVisible?: boolean;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ isWhatsAppVisible = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.scrollToTopWrapper}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: isWhatsAppVisible ? 0 : 56 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <button
            className={styles.scrollToTopButton}
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
