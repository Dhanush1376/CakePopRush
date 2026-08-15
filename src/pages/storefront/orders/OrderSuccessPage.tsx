import React, { useEffect, useState, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Package, Truck, ShoppingBag, MapPin, Phone, Star, Receipt, Box, ArrowRight, X, Download } from 'lucide-react'

import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator'
import { useCart } from '@/lib/cartStore' // Used for empty cart fallback check if needed
import { MOCK_ORDERS } from './OrdersPage'
import { InvoiceViewer, downloadInvoicePDF } from '@/components/invoice/InvoiceViewer'
import { mapOrderToInvoiceData } from '@/types/invoice'
import styles from './OrderSuccessPage.module.css'

// We will use a mock order structure similar to OrderTrackingPage for display
const MOCK_SUCCESS_ORDER = {
  date: 'Today',
  time: 'Just now',
  status: 'confirmed',
  orderType: 'Delivery',
  estimatedDelivery: 'Today',
  estimatedTime: '6:30 PM – 7:00 PM',
  items: [
    { id: '1', name: 'Assorted Cake Pops Box', qty: 1, unitPrice: 599, subtotal: 599, icon: <Star size={16} /> }
  ],
  totalProducts: 1,
  totalQuantity: 1,
  address: {
    recipientName: 'Dhanush',
    phone: '+91 98765 43210',
    houseNo: '12A',
    street: 'MG Road',
    area: 'Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    type: 'Home'
  },
  price: {
    itemSubtotal: 599,
    productDiscount: 0,
    couponDiscount: 50,
    deliveryFee: 40,
    packagingFee: 0,
    taxes: 0,
    totalDiscount: 50,
    amountPaid: 589
  },
  payment: {
    method: 'UPI',
    status: 'Paid',
    provider: 'Google Pay'
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
}

const Section = ({ title, icon, children }: { title?: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <motion.section className={styles.section} variants={stagger.item}>
    {title && (
      <div className={styles.sectionHeader}>
        {icon && <span className={styles.sectionIcon}>{icon}</span>}
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
    )}
    <div className={styles.sectionBody}>{children}</div>
  </motion.section>
)

const InfoRow = ({ 
  label, 
  value, 
  accent, 
  compact, 
  statusBadge 
}: { 
  label: string; 
  value: string; 
  accent?: boolean; 
  compact?: boolean; 
  statusBadge?: boolean;
}) => (
  <div className={`${styles.infoRow} ${compact ? styles.infoRowCompact : ''}`}>
    <span className={styles.infoLabel}>{label}</span>
    {statusBadge ? (
      <span className={styles.statusBadgePaid}>{value}</span>
    ) : (
      <span className={`${styles.infoValue} ${accent ? styles.infoAccent : ''}`}>{value}</span>
    )}
  </div>
)

// ─── Main Component ─────────────────────────────────────────────────────────

export function OrderSuccessPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { items } = useCart()
  
  const [showCelebration, setShowCelebration] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const { currentReaction, triggerReaction, tapMascot, prefersReducedMotion } = useMascotOrchestrator()

  // Generate dual-side confetti blast (left & right cannons)
  const [confettiBlast, setConfettiBlast] = useState<any[]>([]);

  useEffect(() => {
    const COLORS = ['#F20D6F', '#FFC700', '#07C2BB', '#F53687', '#10B981', '#8B5CF6', '#3B82F6', '#FF9F1C', '#FFFFFF'];
    const SHAPES = ['square', 'rectangle', 'circle'];

    const leftCannon = Array.from({ length: 70 }).map((_, i) => {
      const angle = (Math.random() * 55 - 75) * (Math.PI / 180); // -75deg to -20deg (upward-right)
      const dist = 35 + Math.random() * 55; // 35-90 distance
      const targetX = Math.cos(angle) * dist;
      const targetY = Math.sin(angle) * dist;

      return {
        id: `L-${i}`,
        startX: 0,
        startY: 85,
        targetX,
        targetY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        size: 8 + Math.random() * 10,
        rotX: Math.random() * 1080 - 540,
        rotY: Math.random() * 1080 - 540,
        delay: Math.random() * 0.35,
        duration: 1.6 + Math.random() * 1.4
      };
    });

    const rightCannon = Array.from({ length: 70 }).map((_, i) => {
      const angle = (Math.random() * 55 - 160) * (Math.PI / 180); // -160deg to -105deg (upward-left)
      const dist = 35 + Math.random() * 55;
      const targetX = Math.cos(angle) * dist;
      const targetY = Math.sin(angle) * dist;

      return {
        id: `R-${i}`,
        startX: 100,
        startY: 85,
        targetX,
        targetY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        size: 8 + Math.random() * 10,
        rotX: Math.random() * 1080 - 540,
        rotY: Math.random() * 1080 - 540,
        delay: Math.random() * 0.35,
        duration: 1.6 + Math.random() * 1.4
      };
    });

    setConfettiBlast([...leftCannon, ...rightCannon]);
  }, []);
  const handleMascotClick = () => {
    tapMascot()
  };

  useEffect(() => {
    // Check if we came from checkout
    const fromCheckout = location.state?.fromCheckout
    const sessionKey = `celebration-shown-${id}`
    const alreadyShown = sessionStorage.getItem(sessionKey)

    if (fromCheckout && !alreadyShown) {
      setShowCelebration(true)
      sessionStorage.setItem(sessionKey, 'true')
      
      // We don't trigger the reaction here immediately since the provider will see the route change,
      // but it's safe to trigger it to ensure the checkout success specifically plays on the modal
      triggerReaction('checkout:success')
    }
    
    // Simulate slight load time for data
    const readyTimer = setTimeout(() => setIsReady(true), 300)
    
    // Auto-close celebration after 4.5 seconds
    let closeTimer: ReturnType<typeof setTimeout>
    if (fromCheckout && !alreadyShown) {
      closeTimer = setTimeout(() => {
        handleDismiss()
      }, 4500)
    }

    return () => {
      clearTimeout(readyTimer)
      if (closeTimer) clearTimeout(closeTimer)
    }
  }, [id, location.state])

  const handleDismiss = () => {
    setShowCelebration(false)
    window.scrollTo(0, 0)
  }

  if (!isReady) return null // simple blank screen while checking state

  return (
    <div className={styles.page}>
      
      {/* ─── Celebration Modal ─── */}
      {createPortal(
        <AnimatePresence>
          {showCelebration && (
            <motion.div 
              className={styles.celebrationOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleDismiss} /* clicking background dismisses */
            >
              {/* Dual Side Confetti Cannon Blast Layer */}
              <div className={styles.sideCannonContainer}>
                {confettiBlast.map((p) => (
                  <motion.div
                    key={p.id}
                    className={styles.confettiParticle}
                    style={{
                      left: `${p.startX}vw`,
                      top: `${p.startY}vh`,
                      backgroundColor: p.color,
                      width: p.shape === 'rectangle' ? p.size * 0.6 : p.size,
                      height: p.shape === 'rectangle' ? p.size * 1.6 : p.size,
                      borderRadius: p.shape === 'circle' ? '50%' : '2px',
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotateX: 0, rotateY: 0 }}
                    animate={{
                      x: `${p.targetX}vw`,
                      y: [`0vh`, `${p.targetY}vh`, `${p.targetY + 25}vh`],
                      scale: [0, 1.3, 0.8],
                      opacity: [1, 1, 0],
                      rotateX: p.rotX,
                      rotateY: p.rotY,
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: [0.12, 0.8, 0.3, 1]
                    }}
                  />
                ))}
              </div>

              <motion.div 
                className={styles.celebrationModal}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.05 }}
                onClick={(e) => e.stopPropagation()} /* prevent overlay click */
              >
                
                <button 
                  className={styles.closeButton} 
                  onClick={handleDismiss}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>

                <div className={styles.mascotSuccessWrap}>
                  <div className={styles.mascotClip}>
                    <motion.div 
                      className={styles.mascotContainer}
                      initial={{ y: 150 }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
                      onClick={handleMascotClick}
                      style={{ cursor: 'pointer' }}
                    >
                      <CakePopMascot 
                        size="large" 
                        reaction={currentReaction || 'party'} 
                        speedMultiplier={prefersReducedMotion ? 1 : 2} 
                        hideArms={true}
                      />
                    </motion.div>
                  </div>
                  <motion.div 
                    className={styles.mascotHandRight} 
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                  />
                  <motion.div 
                    className={styles.mascotHandLeft} 
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.45 }}
                  />
                </div>

                <motion.h2 
                  className={styles.successHeading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                >
                  Order Placed Successfully!
                </motion.h2>

                <motion.p 
                  className={styles.successSubtext}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.55 }}
                >
                  Your sweet order is confirmed and we're getting it ready.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.65 }}
                >
                  <div className={styles.orderIdBadge}>Order #{id}</div>
                </motion.div>

                <motion.div 
                  className={styles.modalActions}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.75 }}
                >
                  <button className={styles.primaryCta} onClick={handleDismiss}>
                    View Order Details <ArrowRight size={16} />
                  </button>
                  <button className={styles.secondaryCta} onClick={() => navigate('/shop')}>
                    Continue Shopping
                  </button>
                </motion.div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}


      {/* ─── Background Order Details ─── */}
      <motion.div className={styles.content} variants={stagger.container} initial="hidden" animate="show">
        
        <div className={styles.mainColumn}>
          {/* Order Status */}
          <Section>
            {/* Auth Modal Animated Green Tick */}
            <div className={styles.bigTickWrapper}>
              <motion.div 
                className={styles.authTickCircle}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path 
                    d="M5 13L9 17L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                  />
                </svg>
              </motion.div>
              <h3 className={styles.bigTickTitle}>Order Confirmed!</h3>
              <p className={styles.bigTickSubtext}>We've received your order and started preparing it.</p>
            </div>

            {/* Horizontal Stepper with Yellow, Pink & Turquoise Green */}
            <div className={styles.colorfulStepperContainer}>
              <div className={styles.colorfulStepperTrack}>
                <div className={styles.colorfulStepperFill} />
              </div>

              <div className={styles.colorfulSteps}>
                {/* Step 1: Yellow */}
                <div className={`${styles.colorfulStep} ${styles.stepYellow}`}>
                  <div className={styles.colorfulNode}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className={styles.colorfulLabel}>Order Placed</span>
                </div>

                {/* Step 2: Pink */}
                <div className={`${styles.colorfulStep} ${styles.stepPink}`}>
                  <div className={styles.colorfulNode}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className={styles.colorfulLabel}>Confirmed</span>
                </div>

                {/* Step 3: Turquoise Green */}
                <div className={`${styles.colorfulStep} ${styles.stepTurquoise}`}>
                  <div className={styles.colorfulNode}>
                    <Package size={16} />
                  </div>
                  <span className={styles.colorfulLabel}>Preparing</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Delivery Address */}
          <Section title="Delivery Address" icon={<MapPin size={18} />}>
            <div className={styles.addressCard}>
              <div className={styles.addressType}>
                <MapPin size={14} />
                <span>{MOCK_SUCCESS_ORDER.address.type}</span>
              </div>
              <p className={styles.addressName}>{MOCK_SUCCESS_ORDER.address.recipientName}</p>
              <p className={styles.addressLine}>
                {MOCK_SUCCESS_ORDER.address.houseNo}<br />
                {MOCK_SUCCESS_ORDER.address.street}, {MOCK_SUCCESS_ORDER.address.area}<br />
                {MOCK_SUCCESS_ORDER.address.city}, {MOCK_SUCCESS_ORDER.address.state} – {MOCK_SUCCESS_ORDER.address.pincode}
              </p>
              <p className={styles.addressPhone}>
                <Phone size={12} /> {MOCK_SUCCESS_ORDER.address.phone}
              </p>
            </div>
            {MOCK_SUCCESS_ORDER.estimatedDelivery && (
              <div className={styles.metaRowGroup}>
                <InfoRow label="Estimated Delivery" value={`${MOCK_SUCCESS_ORDER.estimatedDelivery}, ${MOCK_SUCCESS_ORDER.estimatedTime}`} accent compact />
              </div>
            )}
          </Section>

          {/* Order Items */}
          <Section title={`Order Items (${MOCK_SUCCESS_ORDER.totalProducts} items)`} icon={<Box size={18} />}>
            {MOCK_SUCCESS_ORDER.items.map(item => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemIcon}>{item.icon}</div>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>Qty: {item.qty} × Rs.{item.unitPrice}</span>
                </div>
                <div className={styles.itemPriceCol}>
                  <span className={styles.itemSubtotal}>Rs.{item.subtotal}</span>
                </div>
              </div>
            ))}
          </Section>
        </div>

        <div className={styles.sideColumn}>
          {/* Price Details */}
          <Section title="Payment Summary" icon={<Receipt size={18} />}>
            <InfoRow label="Subtotal" value={`Rs.${MOCK_SUCCESS_ORDER.price.itemSubtotal}`} />
            <InfoRow label="Delivery" value={`Rs.${MOCK_SUCCESS_ORDER.price.deliveryFee}`} />
            {MOCK_SUCCESS_ORDER.price.couponDiscount > 0 && (
              <InfoRow label="Discount" value={`-Rs.${MOCK_SUCCESS_ORDER.price.couponDiscount}`} />
            )}
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>Rs.{MOCK_SUCCESS_ORDER.price.amountPaid}</span>
            </div>
            
            <div className={styles.paymentMetaBox}>
               <InfoRow label="Payment Method" value={MOCK_SUCCESS_ORDER.payment.method} compact />
               <InfoRow label="Status" value="Paid" statusBadge compact />
            </div>
          </Section>

          <div className={styles.globalActions}>
             <Link to={`/orders/${id}`} className={styles.trackBtn}>
               Track Order <Truck size={16} />
             </Link>
             <button onClick={() => setShowInvoice(true)} className={styles.invoiceBtn}>
               <Receipt size={18} /> View Invoice
             </button>
             <Link to="/shop" className={styles.continueBtn}>
               Continue Shopping
             </Link>
          </div>
        </div>

      </motion.div>

      <InvoiceViewer 
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        data={mapOrderToInvoiceData({ ...MOCK_SUCCESS_ORDER, id: id || '0' })}
      />
    </div>
  )
}
