import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Banknote, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import styles from './CheckoutPaymentPage.module.css';
import { Container } from '@/components/layout/Container';
import { CheckoutProgress, OrderSummary, MobileCheckoutBar } from '@/features/cart';
import { useCart } from '@/features/cart';
import { formatCurrency } from '@/lib/formatters/currency';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import { addressService, CustomerAddress } from '@/services/api/addressService';
import orderService, { CreateOrderPayload } from '@/services/api/orderService';
import { useRazorpay } from '@/hooks/useRazorpay';
import { CheckoutPaymentSkeleton } from './components/CheckoutPaymentSkeleton';
import { SlideToOrder } from './components/SlideToOrder';
import { SaaSSuccessOverlay } from './components/SaaSSuccessOverlay';

export const CheckoutPaymentPage = () => {
  const { items, totalItems, subtotal, couponDiscountValue, shippingFee, total, isLoading, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { processPayment: processRazorpayPayment, isLoading: isRazorpayLoading } = useRazorpay();

  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'cod'>('razorpay');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);

  // Load selected customer address
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const savedSelectedId = localStorage.getItem('cakepoprush_selectedAddressId');
        const cached = localStorage.getItem('cakepoprush_addresses');
        let list: CustomerAddress[] = [];
        if (cached) {
          try {
            list = JSON.parse(cached);
          } catch {
            // ignore
          }
        }
        if (!list.length) {
          const res = await addressService.getAddresses();
          if (res.success && res.data) list = res.data;
        }

        const match =
          (savedSelectedId && list.find((a) => String(a._id || a.id) === savedSelectedId)) ||
          list.find((a) => a.isDefault) ||
          list[0] ||
          null;

        setSelectedAddress(match);
      } catch (e) {
        console.error('Error loading address for checkout:', e);
      }
    };
    loadAddress();
  }, []);

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

  const executeOrderPlacement = async () => {
    setPaymentPhase('loading');

    const orderPayload: CreateOrderPayload = {
      items: items.map((item) => ({
        productId: String((item.product as any)._id || item.product.id),
        quantity: item.quantity,
        variant: item.variantName || item.variantId || undefined,
        customizationNote: item.customization?.personalMessage || undefined,
      })),
      shippingAddress: {
        recipientName: user?.name || (selectedAddress as any)?.recipientName || (selectedAddress as any)?.name || 'Valued Customer',
        phone: (selectedAddress as any)?.phone || user?.phone || '',
        alternatePhone: (selectedAddress as any)?.alternatePhone,
        email: user?.email,
        line1: selectedAddress?.line1 || selectedAddress?.street || 'Local Delivery Address',
        line2: selectedAddress?.line2 || '',
        landmark: selectedAddress?.landmark || '',
        city: selectedAddress?.city || 'Bangalore',
        state: selectedAddress?.state || 'Karnataka',
        pincode: selectedAddress?.pincode || '560001',
        type: selectedAddress?.type || 'home',
        deliveryInstructions: (selectedAddress as any)?.deliveryInstructions || '',
      },
      paymentMethod: selectedPayment,
      notes: 'CakePopRush fast local delivery order',
    };

    if (selectedPayment === 'cod') {
      try {
        const res = await orderService.create(orderPayload);
        if (res.success && res.data?.order) {
          const confirmedOrder = res.data.order;
          setPlacedOrder(confirmedOrder);
          setPaymentPhase('success');

          setTimeout(() => {
            clearCart();
            setIsDrawerOpen(false);
            const targetRef = confirmedOrder.orderNumber || confirmedOrder._id || confirmedOrder.id;
            navigate(`/orders/${targetRef}`, {
              replace: true,
              state: { fromCheckout: true, order: confirmedOrder },
            });
          }, 1800);
        } else {
          setPaymentPhase('idle');
          toast({
            type: 'error',
            title: 'Order Failed',
            message: res.message || 'Unable to place Cash on Delivery order',
          });
        }
      } catch (err: any) {
        setPaymentPhase('idle');
        toast({
          type: 'error',
          title: 'Order Placement Failed',
          message: err.response?.data?.message || err.message || 'Failed to place order. Please try again.',
        });
      }
    } else {
      // Razorpay Online Payment Flow
      processRazorpayPayment(
        orderPayload,
        (confirmedOrder) => {
          setPlacedOrder(confirmedOrder);
          setPaymentPhase('success');

          setTimeout(() => {
            clearCart();
            setIsDrawerOpen(false);
            const targetRef = confirmedOrder.orderNumber || confirmedOrder._id || confirmedOrder.id;
            navigate(`/orders/${targetRef}`, {
              replace: true,
              state: { fromCheckout: true, order: confirmedOrder },
            });
          }, 1800);
        },
        () => {
          setPaymentPhase('idle');
        }
      );
    }
  };

  return (
    <div className={styles.page}>
      <CheckoutProgress currentStep="payment" />
      <Container>
        <div className={styles.layout}>
          <div className={styles.mainContent}>
            {/* Payment Options Section */}
            <div className={styles.paymentSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Payment Options</h2>
              </div>

              <div className={styles.paymentList}>
                {/* Option 1: Online Payment (Razorpay) */}
                <div
                  className={`${styles.paymentCard} ${selectedPayment === 'razorpay' ? styles.selectedCard : ''}`}
                  onClick={() => setSelectedPayment('razorpay')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.radioRow}>
                      <div className={`${styles.radio} ${selectedPayment === 'razorpay' ? styles.radioSelected : ''}`}>
                        {selectedPayment === 'razorpay' && <div className={styles.radioInner} />}
                      </div>
                      <h3 className={styles.paymentName}>Online Payment (Razorpay)</h3>
                    </div>
                    <div className={styles.iconWrap}>
                      <CreditCard size={18} strokeWidth={2} />
                    </div>
                  </div>
                  <div className={styles.paymentDetails}>
                    <p className={styles.paymentSubtext}>
                      UPI (Google Pay, PhonePe, Paytm), Cards, NetBanking & Wallets with instant verification
                    </p>
                  </div>
                </div>

                {/* Option 2: Cash on Delivery */}
                <div
                  className={`${styles.paymentCard} ${selectedPayment === 'cod' ? styles.selectedCard : ''}`}
                  onClick={() => setSelectedPayment('cod')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.radioRow}>
                      <div className={`${styles.radio} ${selectedPayment === 'cod' ? styles.radioSelected : ''}`}>
                        {selectedPayment === 'cod' && <div className={styles.radioInner} />}
                      </div>
                      <h3 className={styles.paymentName}>Cash on Delivery (COD)</h3>
                    </div>
                    <div className={styles.iconWrap}>
                      <Banknote size={18} strokeWidth={2} />
                    </div>
                  </div>
                  <div className={styles.paymentDetails}>
                    <p className={styles.paymentSubtext}>
                      Pay cash to your personal delivery worker upon doorstep delivery. Delivery OTP verified at door.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#07C2BB', fontSize: '0.82rem', fontWeight: 600 }}>
                      <CheckCircle2 size={15} />
                      <span>Verified Doorstep Delivery OTP will be sent when order is out for fulfillment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.mobileSummaryWrap}>
              <OrderSummary isPaymentPage />
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.stickyWrapper}>
              <OrderSummary isPaymentPage />
            </div>
          </div>
        </div>
      </Container>

      <MobileCheckoutBar
        buttonText={selectedPayment === 'cod' ? 'PLACE COD ORDER' : 'PAY & PLACE ORDER'}
        nextRoute="/orders"
        variant="yellow"
        showBack={true}
        onBack={() => navigate(-1)}
        onNext={handlePlaceOrder}
        disabled={paymentPhase === 'loading' || isRazorpayLoading}
        isPaymentPage
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
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.drawerConfirmWrapper}>
                  <div className={styles.drawerDragHandle} />
                  <div className={styles.drawerHeaderRow}>
                    <h2 className={styles.drawerHeader}>Confirm {selectedPayment === 'cod' ? 'COD Order' : 'Payment'}</h2>
                    <button
                      className={styles.drawerCloseBtn}
                      onClick={() => paymentPhase === 'idle' && setIsDrawerOpen(false)}
                      aria-label="Close payment drawer"
                      disabled={paymentPhase !== 'idle'}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        Items Total ({totalItems} item{totalItems !== 1 ? 's' : ''})
                      </span>
                      <span className={styles.summaryValue}>{formatCurrency(subtotal)}</span>
                    </div>

                    {couponDiscountValue > 0 && (
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Coupon Discount</span>
                        <span className={`${styles.summaryValue} ${styles.discountValue}`}>
                          - {formatCurrency(couponDiscountValue)}
                        </span>
                      </div>
                    )}

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Delivery Fee</span>
                      <span className={styles.summaryValue}>
                        {shippingFee === 0 ? (
                          <span style={{ color: 'var(--color-brand-turquoise)', fontWeight: 'bold' }}>FREE</span>
                        ) : (
                          formatCurrency(shippingFee)
                        )}
                      </span>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Payment Method</span>
                      <span className={styles.summaryValue} style={{ fontWeight: 600 }}>
                        {selectedPayment === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                      </span>
                    </div>
                  </div>

                  <hr className={styles.summaryDivider} />

                  <div className={styles.summaryTotalRow}>
                    <span className={styles.summaryTotalLabel}>Total Amount</span>
                    <span className={styles.summaryTotalValue}>{formatCurrency(total)}</span>
                  </div>

                  <SlideToOrder
                    totalAmount={total}
                    paymentMethod={selectedPayment}
                    isLoading={paymentPhase === 'loading' || isRazorpayLoading}
                    onSuccess={executeOrderPlacement}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Fullscreen Green SaaS Success Overlay */}
      {paymentPhase === 'success' && createPortal(
        <SaaSSuccessOverlay
          orderNumber={placedOrder?.orderNumber}
          paymentMethod={selectedPayment}
        />,
        document.body
      )}
    </div>
  );
};

export default CheckoutPaymentPage;
