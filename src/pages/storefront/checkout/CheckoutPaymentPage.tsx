import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Tag, CreditCard, Banknote, ShieldCheck, ChevronRight } from 'lucide-react';
import styles from './CheckoutPaymentPage.module.css';
import { Container } from '@/components/layout/Container';
import { CheckoutProgress } from '@/pages/storefront/cart/components/CheckoutProgress';
import { OrderSummary } from '@/pages/storefront/cart/components/OrderSummary';
import { MobileCheckoutBar } from '@/pages/storefront/cart/components/MobileCheckoutBar';
import { TrustBadges } from '@/pages/storefront/cart/components/TrustBadges';
import { useCart } from '@/lib/cartStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckoutPaymentSkeleton } from './components/CheckoutPaymentSkeleton';

export const CheckoutPaymentPage = () => {
  const { items, total, isLoading, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<string>('razorpay');

  const siriCoins = Math.round(total * 0.10);
  const cashback = Math.round(total * 0.02);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Container>
          <CheckoutPaymentSkeleton />
        </Container>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    // In a real app, this would submit the order to the backend
    // For now, we'll clear the cart and redirect to the orders page
    clearCart();
    navigate('/orders');
  };

  return (
    <div className={styles.page}>
      <CheckoutProgress currentStep="payment" />
      <Container>
        <div className={styles.layout}>
          <div className={styles.mainContent}>
            
            {/* Required Delivery Date */}
            <div className={styles.plainSection}>
              <div className={styles.sectionHeader}>
                <CalendarClock strokeWidth={2.5} />
                <h2 className={styles.sectionTitle}>Required Delivery Date</h2>
              </div>
              <p className={styles.sectionDesc}>When do you need these items? *</p>
              
              <div style={{ marginTop: '16px' }}>
                <Input 
                  type="date"
                  name="deliveryDate"
                  placeholder="dd-mm-yyyy"
                  required
                />
                <span className={styles.sectionDesc} style={{ display: 'block', marginTop: '8px' }}>Helps us prioritize your order preparation.</span>
              </div>
            </div>

            {/* Promo Banner */}
            <div className={styles.promoBanner}>
              <Tag size={20} strokeWidth={2.5} />
              <p className={styles.promoText}>Have a promo code? Check the price details sidebar to apply & save!</p>
            </div>

            {/* Payment Options */}
            <div className={styles.plainSection}>
              <div className={styles.sectionHeader}>
                <CreditCard strokeWidth={2.5} />
                <h2 className={styles.sectionTitle}>Payment Options</h2>
              </div>
              
              <div className={styles.paymentList}>
                
                <div 
                  className={`${styles.paymentOption} ${selectedPayment === 'razorpay' ? styles.selected : ''}`}
                  onClick={() => setSelectedPayment('razorpay')}
                >
                  <div className={styles.paymentLeft}>
                    <div className={styles.radio}>
                      {selectedPayment === 'razorpay' && <div className={styles.radioInner} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={styles.paymentName}>Razorpay</span>
                      <span className={styles.paymentSubtext}>Cards, UPI, NetBanking, Wallets</span>
                    </div>
                  </div>
                  <CreditCard className={styles.paymentIcon} size={20} />
                </div>

                <div 
                  className={`${styles.paymentOption} ${selectedPayment === 'cod' ? styles.selected : ''}`}
                  onClick={() => setSelectedPayment('cod')}
                >
                  <div className={styles.paymentLeft}>
                    <div className={styles.radio}>
                      {selectedPayment === 'cod' && <div className={styles.radioInner} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={styles.paymentName}>Cash on Delivery</span>
                      <span className={styles.paymentSubtext}>OTP required at delivery</span>
                    </div>
                  </div>
                  <Banknote className={styles.paymentIcon} size={20} />
                </div>

              </div>
            </div>

            <div className={styles.mobileSummaryWrap}>
              <OrderSummary isPaymentPage />
            </div>

            <div className={styles.mobileTrustWrap}>
               <TrustBadges variant="turquoise" />
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.stickyWrapper}>
              <OrderSummary isPaymentPage />

              <div className={styles.desktopTrustWrap}>
                <TrustBadges variant="turquoise" />
              </div>
            </div>
          </div>
        </div>
      </Container>

      <MobileCheckoutBar 
        buttonText="Pay & Place Order" 
        nextRoute="/orders" 
        variant="turquoise" 
        showBack={true}
        onBack={() => navigate(-1)}
        onNext={handlePlaceOrder}
      />
    </div>
  );
};
