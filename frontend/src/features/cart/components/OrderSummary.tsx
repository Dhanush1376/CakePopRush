import React from 'react';
import { ShieldCheck, BadgePercent, Award, CreditCard } from 'lucide-react';
import styles from './OrderSummary.module.css';
import sharedStyles from './CartComponents.module.css';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';
interface OrderSummaryProps {
  buttonText?: string;
  nextRoute?: string;
  isPaymentPage?: boolean;
}

export const OrderSummary = ({ isPaymentPage = false }: OrderSummaryProps = {}) => {
  const { totalItems, subtotal, totalDiscount, couponDiscountValue, shippingFee, cartTotal, checkoutTotal, total } = useCart();

  const displayTotal = isPaymentPage ? (checkoutTotal || total + shippingFee) : (cartTotal || total);

  return (
    <div className={`${sharedStyles.sectionCard} ${styles.summaryCard}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {isPaymentPage ? `Purchase Summary (${totalItems} item${totalItems > 1 ? 's' : ''})` : 'Order Summary'}
        </h2>
        {!isPaymentPage && (
          <span className={styles.itemCount}>{totalItems} Item{totalItems > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className={styles.detailsList}>
        <div className={styles.row}>
          <span className={styles.label}>
            {isPaymentPage ? `Item Total (${totalItems} item${totalItems > 1 ? 's' : ''})` : 'Subtotal'}
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
            {isPaymentPage ? (
              shippingFee === 0 ? (
                <span className={styles.freeShipping}>FREE</span>
              ) : (
                formatCurrency(shippingFee)
              )
            ) : (
              <span className={styles.calcMsg} style={{ color: '#7A685D', fontSize: '13px' }}>
                Calculated at checkout
              </span>
            )}
          </span>
        </div>

        {isPaymentPage && (
          <div className={styles.row}>
            <span className={styles.label}>Taxes</span>
            <span className={styles.value} style={{ color: '#6B5B50', fontWeight: '500' }}>Included</span>
          </div>
        )}
      </div>

      <div className={`${styles.row} ${styles.totalRow}`}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatCurrency(displayTotal)}</span>
      </div>

      {totalDiscount > 0 && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          backgroundColor: 'rgba(46, 196, 182, 0.12)',
          borderRadius: '8px',
          color: '#0d7a6e',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <BadgePercent size={15} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <span>You save {formatCurrency(totalDiscount + couponDiscountValue)} on this order!</span>
        </div>
      )}

      <div className={styles.compactTrustRow}>
        <div className={styles.compactTrustItem}>
          <Award size={12} strokeWidth={2} className={styles.compactTrustIcon} />
          <span>Freshly Baked</span>
        </div>
        <div className={styles.compactTrustDivider}>•</div>
        <div className={styles.compactTrustItem}>
          <ShieldCheck size={12} strokeWidth={2} className={styles.compactTrustIcon} />
          <span>Safe Checkout</span>
        </div>
        <div className={styles.compactTrustDivider}>•</div>
        <div className={styles.compactTrustItem}>
          <CreditCard size={12} strokeWidth={2} className={styles.compactTrustIcon} />
          <span>Safe Payments</span>
        </div>
      </div>
    </div>
  );
};
