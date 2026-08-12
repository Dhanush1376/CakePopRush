import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './MobileCheckoutBar.module.css';
import { useCart } from '@/lib/cartStore';
import { formatCurrency } from '@/lib/formatters/currency';

interface MobileCheckoutBarProps {
  buttonText?: string;
  nextRoute?: string;
  variant?: 'pink' | 'yellow' | 'turquoise';
  showBack?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  disabled?: boolean;
}

export const MobileCheckoutBar = ({ 
  buttonText = 'CHECKOUT', 
  nextRoute = '/checkout', 
  variant = 'yellow',
  showBack = false,
  onBack,
  onNext,
  disabled = false
}: MobileCheckoutBarProps = {}) => {
  const { total, items, isCartOpen } = useCart();
  const navigate = useNavigate();

  if (items.length === 0 || isCartOpen) return null;

  return createPortal(
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.info}>
          <span className={styles.itemCount}>{items.length} ITEM{items.length > 1 ? 'S' : ''} IN BAG</span>
          <span className={styles.total}>{formatCurrency(total)}</span>
        </div>
        <div className={styles.action}>
          {showBack && (
            <button className={styles.backBtn} onClick={onBack || (() => navigate(-1))}>
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
          )}
          <button 
            onClick={disabled ? undefined : (onNext || (() => navigate(nextRoute)))}
            className={`${styles.checkoutBtn} ${styles[variant]} ${disabled ? styles.disabled : ''}`}
            disabled={disabled}
          >
            {buttonText} <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
