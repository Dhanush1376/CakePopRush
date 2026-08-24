import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Tag } from 'lucide-react';
import styles from './QuickAddDrawer.module.css';
import { Product } from '@/types/product';
import { usePDPState } from '@/features/products/hooks/usePDPState';
import { ConfigurationRenderer } from '@/features/products/components/ConfigurationRenderer';
import { useToast } from '@/components/ui/ToastContext';
import { formatCurrency } from '@/lib/formatters/currency';

interface QuickAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const QuickAddDrawer: React.FC<QuickAddDrawerProps> = ({ isOpen, onClose, product }) => {
  const { state, actions } = usePDPState(product);
  const { toast } = useToast();

  // Handle preventing body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    actions.addToCart();
    toast({
      type: 'success',
      title: 'Added to bag'
    });
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className={styles.drawer}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.header}>
                <h2 className={styles.title}>Options for {product.name}</h2>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close options">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
              
              <div className={styles.content}>
                <div className={styles.customizationArea}>
                  <ConfigurationRenderer 
                    product={product} 
                    state={state} 
                    actions={actions} 
                  />
                </div>
              </div>

              <div className={styles.footer}>
                <div className={styles.totalPrice}>
                  <span className={styles.totalLabel}>Total Price</span>
                  <span className={styles.totalAmount}>{formatCurrency(state.calculatedTotal)}</span>
                </div>
                <button className={styles.addBtn} onClick={handleAddToCart}>
                  <ShoppingBag size={16} />
                  Add to Bag
                </button>
              </div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
