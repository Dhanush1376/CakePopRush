import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './MobileCheckoutBar.module.css';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';

interface MobileCheckoutBarProps {
  buttonText?: string;
  nextRoute?: string;
  variant?: 'pink' | 'yellow' | 'turquoise';
  showBack?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  isPaymentPage?: boolean;
}

export const MobileCheckoutBar = ({ 
  buttonText = 'CHECKOUT', 
  nextRoute = '/checkout', 
  variant = 'yellow',
  showBack = false,
  onBack,
  onNext,
  disabled = false,
  isPaymentPage = false
}: MobileCheckoutBarProps = {}) => {
  const { total, subtotal, totalDiscount, checkoutTotal, shippingFee, items, isCartOpen } = useCart();
  const navigate = useNavigate();

  const [isSplashActive, setIsSplashActive] = React.useState(() => {
    return typeof document !== 'undefined' && (
      document.body?.getAttribute('data-splash') === 'true' ||
      document.documentElement?.getAttribute('data-splash') === 'true'
    );
  });

  React.useEffect(() => {
    const checkSplash = () => {
      const active = (
        document.body?.getAttribute('data-splash') === 'true' ||
        document.documentElement?.getAttribute('data-splash') === 'true'
      );
      setIsSplashActive(active);
    };

    checkSplash();

    const observer = new MutationObserver(checkSplash);
    if (typeof document !== 'undefined') {
      observer.observe(document.body, { attributes: true, attributeFilter: ['data-splash'] });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-splash'] });
    }

    return () => observer.disconnect();
  }, []);

  if (items.length === 0 || isCartOpen || isSplashActive) return null;

  return createPortal(
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.info}>
          <span className={styles.itemCount}>{items.length} ITEM{items.length > 1 ? 'S' : ''} IN BAG</span>
          <div className={styles.priceRow}>
            <span className={styles.total}>{formatCurrency(isPaymentPage ? (checkoutTotal || total + shippingFee) : total)}</span>
            {totalDiscount > 0 && (
              <span className={styles.strikePrice}>{formatCurrency(isPaymentPage ? subtotal + shippingFee : subtotal)}</span>
            )}
          </div>
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
            {buttonText} <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
