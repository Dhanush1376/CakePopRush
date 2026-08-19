import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './OrderSummary.module.css';
import sharedStyles from './CartComponents.module.css';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';
interface OrderSummaryProps {
  buttonText?: string;
  nextRoute?: string;
  isPaymentPage?: boolean;
}

export const OrderSummary = ({ buttonText = 'CHECKOUT', nextRoute = '/checkout', isPaymentPage = false }: OrderSummaryProps = {}) => {
  const { totalItems, subtotal, totalDiscount, couponDiscountValue, shippingFee, total } = useCart();
  const navigate = useNavigate();

  const isShippingCalculated = shippingFee > 0 || totalItems === 0;

  return (
    <div className={sharedStyles.sectionCard}>
      <div className={sharedStyles.sectionHeader}>
        <h2 className={sharedStyles.sectionTitle}>
          {isPaymentPage ? `PURCHASE SUMMARY (${totalItems} ITEM${totalItems > 1 ? 'S' : ''})` : 'ORDER SUMMARY'}
        </h2>
        {!isPaymentPage && (
          <span className={styles.itemCount}>{totalItems} Item{totalItems > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className={styles.detailsList}>
        <div className={styles.row}>
          <span className={styles.label}>
            {isPaymentPage ? `Product Cost (${totalItems} item${totalItems > 1 ? 's' : ''})` : 'Subtotal'}
          </span>
          <span className={styles.value}>{formatCurrency(subtotal)}</span>
        </div>
        
        {(totalDiscount > 0 || couponDiscountValue > 0) && (
          <div className={styles.row}>
            <span className={styles.label}>{isPaymentPage ? 'Promo Discount' : 'Discount'}</span>
            <span className={`${styles.value} ${styles.discountValue}`}>
              - {formatCurrency(totalDiscount + couponDiscountValue)}
            </span>
          </div>
        )}
        
        <div className={styles.row}>
          <span className={styles.label}>{isPaymentPage ? 'Delivery Fee' : 'Shipping'}</span>
          <span className={styles.value}>
            {isShippingCalculated ? (shippingFee === 0 ? <span className={styles.freeShipping}>FREE</span> : formatCurrency(shippingFee)) : <span className={styles.calcMsg}>Calculated at checkout</span>}
          </span>
        </div>

        {isPaymentPage && (
          <div className={styles.row}>
            <span className={styles.label}>Tax</span>
            <span className={styles.value} style={{ color: '#6B5B50', fontWeight: '500' }}>Included</span>
          </div>
        )}
      </div>

      <hr className={sharedStyles.divider} />

      <div className={`${styles.row} ${styles.totalRow}`}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatCurrency(total)}</span>
      </div>

      {!isPaymentPage && (
        <>
          <div className={styles.checkoutWrap}>
            <button 
              onClick={() => navigate(nextRoute)}
              className={styles.checkoutBtn}
            >
              {buttonText} <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className={styles.secureWrap}>
            <ShieldCheck size={16} strokeWidth={1.5} className={styles.secureIcon} />
            <div className={styles.secureText}>
              <strong>Secure checkout</strong>
              <p>Your payment information is protected.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
