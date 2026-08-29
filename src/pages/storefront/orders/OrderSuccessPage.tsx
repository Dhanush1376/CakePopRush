import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Receipt, Box, ArrowRight, X } from 'lucide-react'

import { CakePopMascot } from '@/components/mascot/CakePopMascot'
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator'
import { useCart } from '@/features/cart' // Used for empty cart fallback check if needed
import { orderData } from '@/features/orders'
import { MOCK_SUCCESS_ORDER } from '@/features/orders/data/mockOrderDetails'
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer'
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper'
import { productData } from '@/features/products'

import { OrderTimeline } from './components/OrderTimeline'
import { DeliveryCard } from './components/DeliveryCard'
import { PaymentSummaryCard } from './components/PaymentSummaryCard'

import styles from './OrderSuccessPage.module.css'


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
  const [order, setOrder] = useState<any | null>(null)
  const { currentReaction, playDirectEmotion, triggerReaction, tapMascot, prefersReducedMotion } = useMascotOrchestrator()

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
    }
    if (id) {
      orderData.getOrderById(id).then(found => {
        setOrder(found || MOCK_SUCCESS_ORDER)
        setIsReady(true)
      })
    } else {
      setOrder(MOCK_SUCCESS_ORDER)
      setIsReady(true)
    }
    
    // Auto-close celebration after 15 seconds to allow full chained sequence
    let closeTimer: ReturnType<typeof setTimeout>
    if (fromCheckout && !alreadyShown) {
      closeTimer = setTimeout(() => {
        handleDismiss()
      }, 15000)
    }

    return () => {
      if (closeTimer) clearTimeout(closeTimer)
    }
  }, [id, location.state])

  // Trigger the celebration sequence when the modal opens
  useEffect(() => {
    if (showCelebration) {
      triggerReaction('checkout:success');
    }
  }, [showCelebration, triggerReaction]);

  const handleDismiss = () => {
    setShowCelebration(false)
    window.scrollTo(0, 0)
  }

  if (!isReady || !order) return null // simple blank screen while checking state

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
                        reaction={currentReaction} 
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
            <OrderTimeline />
          </Section>

          {/* Delivery Address */}
          <Section title="Delivery Address" icon={<MapPin size={18} />}>
            <DeliveryCard 
              address={order.address}
              estimatedDelivery={order.estimatedDelivery}
              estimatedTime={order.estimatedTime}
              InfoRowComponent={InfoRow}
            />
          </Section>

          {/* Order Items */}
          <Section title={`Order Items (${order.totalProducts} items)`} icon={<Box size={18} />}>
            {order.items.map((item: any) => {
              const imageUrl = item.image;
              return (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemIcon}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    item.icon
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>Qty: {item.qty} × Rs.{item.unitPrice}</span>
                </div>
                <div className={styles.itemPriceCol}>
                  <span className={styles.itemSubtotal}>Rs.{item.subtotal}</span>
                </div>
              </div>
            )})}
          </Section>
        </div>

        <div className={styles.sideColumn}>
          {/* Price Details */}
          <Section title="Payment Summary" icon={<Receipt size={18} />}>
            <PaymentSummaryCard 
              price={order.price}
              payment={order.payment}
              InfoRowComponent={InfoRow}
            />
          </Section>

          <div className={styles.globalActions}>
             <Link to="/orders" className={styles.trackBtn}>
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
        data={mapOrderToInvoiceData({ ...order, id: id || '0' })}
      />
    </div>
  )
}
