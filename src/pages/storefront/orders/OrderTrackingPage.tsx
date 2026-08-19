import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft, MessageCircle, Package, Truck, MapPin, Phone, Star, Receipt,
  Clock, FileText, AlertCircle, Download, Box, ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import { OrderDetail } from '@/features/orders/types';
import { orderData } from '@/features/orders';
import { getTrackingSteps, STATUS_INDEX } from '@/features/orders/utils/trackingSteps';
import { InvoiceViewer, downloadInvoicePDF } from '@/components/invoice/InvoiceViewer'
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper'
import { productData } from '@/features/products'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import styles from './OrderTrackingPage.module.css'
// ─── Helpers ────────────────────────────────────────────────────────────────

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
}

// ─── Section Component ──────────────────────────────────────────────────────

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <motion.section className={styles.section} variants={stagger.item}>
    <div className={styles.sectionHeader}>
      <span className={styles.sectionIcon}>{icon}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </motion.section>
)

const InfoRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={`${styles.infoValue} ${accent ? styles.infoAccent : ''}`}>{value}</span>
  </div>
)

const OrderTrackingSkeleton = () => (
  <div className={styles.page}>
    <header className={styles.header}>
      <Skeleton variant="text" width={80} height={24} />
      <Skeleton variant="text" width={100} height={24} />
    </header>
    <div className={styles.content}>
      <Skeleton variant="rounded" height={280} className={styles.section} />
      <Skeleton variant="rounded" height={380} className={styles.section} />
      <Skeleton variant="rounded" height={180} className={styles.section} />
      <Skeleton variant="rounded" height={200} className={styles.section} />
      <Skeleton variant="rounded" height={260} className={styles.section} />
      <Skeleton variant="rounded" height={56} className={styles.collapsibleBox} />
    </div>
  </div>
)

// ─── Main Component ─────────────────────────────────────────────────────────

export const OrderTrackingPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setIsDownloading(true)
    try {
      const data = mapOrderToInvoiceData(order)
      await downloadInvoicePDF(data)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = id ? orderData.getOrderById(id) : null
      setOrder(found || null)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [id])

  if (loading) {
    return <OrderTrackingSkeleton />
  }

  if (!order) {
    return (
      <div className={styles.errorState}>
        <Package size={48} className={styles.errorIcon} />
        <h3>Order Not Found</h3>
        <p>We couldn't find an order with ID "{id}".</p>
        <Link to="/orders" className={styles.backLink}>Go Back to Orders</Link>
      </div>
    )
  }

  const currentStepIndex = STATUS_INDEX[order.status] ?? 0

  return (
    <ProfileLayout isMobileStandalone={true}>
      <motion.div
        className={styles.page}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ─── Header ─── */}
        <header className={styles.header}>
          <Link to="/orders" className={styles.backBtn} aria-label="Go back to orders">
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span>BACK</span>
          </Link>
          <button className={styles.helpBtn} aria-label="Get help with order">
            <MessageCircle size={18} strokeWidth={2} />
            <span>NEED HELP?</span>
          </button>
        </header>

        <motion.div className={styles.content} variants={stagger.container} initial="hidden" animate="show">

          {/* ─── 1. Order Info Card ─── */}
          <Section title="Order Information" icon={<FileText size={18} />}>
            <InfoRow label="Order ID" value={order.id} accent />
            <InfoRow label="Order Date" value={order.date} />
            <InfoRow label="Order Time" value={order.time} />
            <InfoRow label="Order Type" value={order.orderType} />
            <InfoRow label="Status" value={order.status.charAt(0).toUpperCase() + order.status.slice(1)} />
            {order.estimatedDelivery && <InfoRow label="Est. Delivery" value={`${order.estimatedDelivery}`} />}
            {order.estimatedTime && <InfoRow label="Est. Time" value={order.estimatedTime} />}
            {order.actualDelivery && <InfoRow label="Delivered At" value={order.actualDelivery} accent />}
          </Section>

          {/* ─── 2. Order Tracking Timeline ─── */}
          <Section title="Order Status" icon={<Clock size={18} />}>
            <div className={styles.timeline}>
              {getTrackingSteps(order.status).map((step: any, index: number) => {
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.status} className={`${styles.timelineStep} ${isCurrent ? styles.currentStep : ''}`}>
                    <div className={styles.stepIndicator}>
                      <div
                        className={`${styles.stepIcon} ${isCompleted || isCurrent ? styles.activeIcon : styles.upcomingIcon}`}
                        style={isCompleted || isCurrent ? { background: step.color, color: 'white', boxShadow: isCurrent ? `0 0 0 4px ${step.color}33` : 'none' } : {}}
                        aria-label={`${step.label}: ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                      >
                        {step.icon}
                      </div>
                      {index < getTrackingSteps(order.status).length - 1 && (
                        <div
                          className={styles.stepConnector}
                          style={isCompleted ? { background: step.color } : {}}
                        />
                      )}
                    </div>
                    <div className={styles.stepContent}>
                      <h4 className={styles.stepLabel} style={isCurrent ? { color: step.color } : {}}>{step.label}</h4>
                      <p className={styles.stepDesc}>{step.desc}</p>
                      {isCurrent && order.estimatedDelivery && (
                        <span className={styles.stepTime} style={{ background: `${step.color}15`, color: step.color }}>
                          Est. {order.estimatedDelivery}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* ─── 3. Delivery Agent (conditional) ─── */}
          {order.agent && (
            <Section title="Delivery Agent" icon={<Truck size={18} />}>
              <div className={styles.agentCard}>
                <div className={styles.agentAvatar}>
                  <img src={order.agent.avatar} alt={order.agent.name} />
                </div>
                <div className={styles.agentInfo}>
                  <h4>{order.agent.name}</h4>
                  <div className={styles.agentRating}>
                    <Star size={12} fill="var(--color-brand-yellow)" color="var(--color-brand-yellow)" />
                    <span>{order.agent.rating}</span>
                  </div>
                </div>
                <div className={styles.agentActions}>
                  <button className={styles.agentBtn} aria-label="Message agent"><MessageCircle size={16} /></button>
                  <button className={styles.agentBtn} aria-label="Call agent"><Phone size={16} /></button>
                </div>
              </div>
            </Section>
          )}

          {/* ─── 4. Delivery Address ─── */}
          <Section title="Delivery Address" icon={<MapPin size={18} />}>
            <div className={styles.addressCard}>
              <div className={styles.addressHeader}>
                <p className={styles.addressName}>{order.address.recipientName}</p>
                <div className={styles.addressType}>
                  <MapPin size={14} />
                  <span>{order.address.type}</span>
                </div>
              </div>
              <p className={styles.addressLine}>
                {order.address.houseNo}{order.address.building ? `, ${order.address.building}` : ''}<br />
                {order.address.street}, {order.address.area}<br />
                {order.address.city}, {order.address.state} – {order.address.pincode}
              </p>
              <p className={styles.addressPhone}>
                <Phone size={12} /> {order.address.phone}
              </p>
              {order.address.instructions && (
                <div className={styles.addressInstructions}>
                  <AlertCircle size={12} />
                  <span>{order.address.instructions}</span>
                </div>
              )}
            </div>
          </Section>

          {/* ─── 5. Order Items ─── */}
          <Section title={`Order Items (${order.totalProducts} products, ${order.totalQuantity} items)`} icon={<Box size={18} />}>
            {order.items.map((item: any) => {
              const product = productData.getProductById(item.id);
              const imageUrl = item.image || product?.images?.[0]?.url;
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
                  <span className={styles.itemMeta}>
                    {item.variant && `${item.variant}`}{item.size && ` · ${item.size}`}
                  </span>
                  <span className={styles.itemQty}>Qty: {item.qty} × Rs.{item.unitPrice}</span>
                </div>
                <div className={styles.itemPriceCol}>
                  {item.discount > 0 && <span className={styles.itemDiscount}>-Rs.{item.discount}</span>}
                  <span className={styles.itemSubtotal}>Rs.{item.subtotal}</span>
                </div>
              </div>
            )})}
          </Section>

          {/* ─── 6. Price Details ─── */}
          <Section title="Price Details" icon={<Receipt size={18} />}>
            <InfoRow label="Item Subtotal" value={`Rs.${order.price.itemSubtotal}`} />
            {order.price.productDiscount > 0 && <InfoRow label="Product Discount" value={`-Rs.${order.price.productDiscount}`} />}
            {order.price.couponDiscount > 0 && <InfoRow label="Coupon Discount" value={`-Rs.${order.price.couponDiscount}`} />}
            <InfoRow label="Delivery Fee" value={order.price.deliveryFee === 0 ? 'FREE' : `Rs.${order.price.deliveryFee}`} />
            <InfoRow label="Packaging Fee" value={`Rs.${order.price.packagingFee}`} />
            <InfoRow label="Taxes" value={`Rs.${order.price.taxes}`} />
            {order.price.totalDiscount > 0 && (
              <div className={styles.discountRow}>
                <span>Total Savings</span>
                <span>-Rs.{order.price.totalDiscount}</span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>Amount Paid</span>
              <span>Rs.{order.price.amountPaid}</span>
            </div>
          </Section>

          {/* ─── Collapsible: Payment, Customer, Notes, Invoice ─── */}
          <div className={styles.collapsibleBox}>
            <button 
              className={styles.collapsibleHeader} 
              onClick={() => setMoreDetailsOpen(!moreDetailsOpen)}
            >
              <div className={styles.collapsibleTitle}>
                <div className={styles.sectionIcon} style={{ width: 24, height: 24 }}><FileText size={14} /></div>
                <span>More Details</span>
              </div>
              <ChevronDown 
                size={18} 
                className={styles.chevron}
                style={{ transform: moreDetailsOpen ? 'rotate(180deg)' : 'none' }} 
              />
            </button>
            
            <AnimatePresence>
              {moreDetailsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className={styles.collapsibleContent}>
                    
                    <div className={styles.subSection}>
                      <h4 className={styles.subSectionTitle}>Payment Information</h4>
                      <InfoRow label="Method" value={order.payment.method} />
                      <InfoRow label="Provider" value={order.payment.provider} />
                      <InfoRow label="Status" value={order.payment.status} accent />
                      <InfoRow label="Transaction ID" value={order.payment.transactionId} />
                      <InfoRow label="Date" value={`${order.payment.date}, ${order.payment.time}`} />
                      <InfoRow label="Amount" value={`Rs.${order.payment.amountPaid}`} accent />
                    </div>

                    <div className={styles.subSection}>
                      <h4 className={styles.subSectionTitle}>Customer Information</h4>
                      <InfoRow label="Name" value={order.customer.name} />
                      <InfoRow label="Email" value={order.customer.email} />
                      <InfoRow label="Phone" value={order.customer.phone} />
                    </div>

                    {(order.notes || order.giftMessage) && (
                      <div className={styles.subSection}>
                        <h4 className={styles.subSectionTitle}>Order Notes</h4>
                        {order.notes && <InfoRow label="Special Request" value={order.notes} />}
                        {order.giftMessage && <InfoRow label="Gift Message" value={order.giftMessage} />}
                      </div>
                    )}

                    <div className={styles.subSection}>
                      <h4 className={styles.subSectionTitle}>Invoice</h4>
                      <InfoRow label="Invoice No." value={order.invoiceNumber} />
                      <InfoRow label="Invoice Date" value={order.invoiceDate} />
                      <InfoRow label="Billing Name" value={order.customer.name} />
                      <button 
                        onClick={() => setShowInvoice(true)}
                        className={styles.invoiceBtn}
                      >
                        <FileText size={16} /> View Invoice
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>

        <InvoiceViewer 
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          data={mapOrderToInvoiceData(order)}
        />
      </motion.div>
    </ProfileLayout>
  )
}
