import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, CreditCard, Banknote, ShieldCheck, Loader2, X } from 'lucide-react';
import styles from './CheckoutPaymentPage.module.css';
import { Container } from '@/components/layout/Container';
import { CheckoutProgress, OrderSummary, MobileCheckoutBar, TrustBadges } from '@/features/cart';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckoutPaymentSkeleton } from './components/CheckoutPaymentSkeleton';

export const CheckoutPaymentPage = () => {
  const { items, totalItems, subtotal, totalDiscount, couponDiscountValue, shippingFee, total, isLoading, clearCart } = useCart();
  const isShippingCalculated = shippingFee > 0 || totalItems === 0;
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<string>('razorpay');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const [otpValue, setOtpValue] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Reset OTP state if payment method changes
  useEffect(() => {
    if (selectedPayment !== 'cod') {
      setIsOtpVerified(false);
      setIsOtpLoading(false);
      setOtpValue('');
    }
  }, [selectedPayment]);

  const siriCoins = Math.round(total * 0.10);
  const cashback = Math.round(total * 0.02);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (items.length === 0 && paymentPhase === 'idle') {
      navigate('/cart');
    }
  }, [items, navigate, paymentPhase]);

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
    setIsDrawerOpen(true);
    setPaymentPhase('idle');
  };

  const processPayment = () => {
    setPaymentPhase('loading');
    
    // Simulate Razorpay / backend processing
    setTimeout(() => {
      setPaymentPhase('success');
      
      // Navigate to success page after tick is shown
      setTimeout(() => {
        const newOrderId = `CPR-${Math.floor(10000 + Math.random() * 90000)}`;
        setIsDrawerOpen(false);
        navigate(`/order-success/${newOrderId}`, { state: { fromCheckout: true } });
        setTimeout(() => clearCart(), 100);
      }, 1500);
    }, 2000);
  };

  return (
    <div className={styles.page}>
      <CheckoutProgress currentStep="payment" />
      <Container>
        <div className={styles.layout}>
          <div className={styles.mainContent}>
            
            {/* Required Delivery Date */}
            <div className={styles.sectionCard}>
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
                  className={styles.customDateInput}
                  required
                />
                <span className={styles.sectionDesc} style={{ display: 'block', marginTop: '8px' }}>Helps us prioritize your order preparation.</span>
              </div>
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

                {/* OTP Verification Section for COD */}
                <AnimatePresence>
                  {selectedPayment === 'cod' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className={styles.otpSection}>
                        <AnimatePresence mode="wait">
                          {!isOtpVerified ? (
                            <motion.div 
                              key="input"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className={styles.otpLabel}>Enter OTP sent to your mail</p>
                              <div className={styles.otpInputGroup}>
                                <div style={{ flex: 1 }}>
                                  <Input 
                                    type="text" 
                                    placeholder="Enter 4-digit OTP" 
                                    maxLength={4}
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                    className={styles.otpInput}
                                    fullWidth
                                    disabled={isOtpLoading}
                                  />
                                </div>
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (otpValue.length === 4) {
                                      setIsOtpLoading(true);
                                      setTimeout(() => {
                                        setIsOtpLoading(false);
                                        setIsOtpVerified(true);
                                      }, 1200);
                                    }
                                  }}
                                  disabled={otpValue.length !== 4 || isOtpLoading}
                                  isLoading={isOtpLoading}
                                  className={styles.verifyBtn}
                                >
                                  {isOtpLoading ? 'Verifying' : 'Verify'}
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="success"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={styles.otpSuccess}
                            >
                              <ShieldCheck size={18} />
                              <span>OTP Verified Successfully</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
        buttonText={selectedPayment === 'cod' && !isOtpVerified ? "Verify OTP to Place Order" : "Pay & Place Order"}
        nextRoute="/orders" 
        variant="yellow" 
        showBack={true}
        onBack={() => navigate(-1)}
        onNext={handlePlaceOrder}
        disabled={selectedPayment === 'cod' && !isOtpVerified}
      />

      {/* Payment Drawer Portal */}
      {createPortal(
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div 
              className={styles.paymentDrawerOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => paymentPhase === 'idle' && setIsDrawerOpen(false)}
            >
              <motion.div 
                className={styles.paymentDrawer}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {paymentPhase !== 'success' ? (
                  <>
                    <div className={styles.drawerDragHandle} />
                    <div className={styles.drawerHeaderRow}>
                      <h2 className={styles.drawerHeader}>Confirm Payment</h2>
                      <button 
                        className={styles.drawerCloseBtn} 
                        onClick={() => setIsDrawerOpen(false)}
                        aria-label="Close payment drawer"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className={styles.summaryDetails}>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Product Cost ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                        <span className={styles.summaryValue}>{formatCurrency(subtotal)}</span>
                      </div>
                      
                      {(totalDiscount > 0 || couponDiscountValue > 0) && (
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>Promo Discount</span>
                          <span className={`${styles.summaryValue} ${styles.discountValue}`}>- {formatCurrency(totalDiscount + couponDiscountValue)}</span>
                        </div>
                      )}
                      
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Delivery Fee</span>
                        <span className={styles.summaryValue}>
                          {isShippingCalculated ? (shippingFee === 0 ? <span style={{ color: 'var(--color-brand-turquoise)', fontWeight: 'bold' }}>FREE</span> : formatCurrency(shippingFee)) : <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Calculated at checkout</span>}
                        </span>
                      </div>
                      
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Tax</span>
                        <span className={styles.summaryValue} style={{ color: '#6B5B50', fontWeight: '500' }}>Included</span>
                      </div>
                    </div>

                    <hr className={styles.summaryDivider} />

                    <div className={styles.summaryTotalRow}>
                      <span className={styles.summaryTotalLabel}>Total</span>
                      <span className={styles.summaryTotalValue}>{formatCurrency(total)}</span>
                    </div>

                    <button 
                      className={styles.payButton} 
                      onClick={processPayment}
                      disabled={paymentPhase === 'loading'}
                    >
                      {paymentPhase === 'loading' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatCurrency(total + 49)} securely`
                      )}
                    </button>
                  </>
                ) : (
                  <motion.div 
                    className={styles.tickContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div 
                      className={styles.tickCircle}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                    >
                      <motion.svg 
                        width="36" 
                        height="36" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </motion.svg>
                    </motion.div>
                    <h2 className={styles.tickTitle}>Payment Successful!</h2>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
