import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft, MessageCircle, Package, Truck, CheckCircle2,
  ShoppingBag, MapPin, Phone, Star, CreditCard, Receipt,
  Clock, User, Mail, FileText, AlertCircle, RotateCcw,
  Download, RefreshCw, ChefHat, PackageCheck, Box, ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import { MOCK_ORDERS } from './OrdersPage'
import styles from './OrderTrackingPage.module.css'

// ─── Rich Order Data Model ──────────────────────────────────────────────────

interface TrackingStep {
  status: string
  label: string
  desc: string
  date?: string
  time?: string
  icon: React.ReactNode
  color: string
}

interface OrderItemDetail {
  id: string
  name: string
  variant?: string
  size?: string
  qty: number
  unitPrice: number
  discount: number
  subtotal: number
  icon: React.ReactNode
}

interface DeliveryAddress {
  recipientName: string
  phone: string
  houseNo: string
  building?: string
  street: string
  area: string
  city: string
  state: string
  pincode: string
  type: 'Home' | 'Work' | 'Other'
  instructions?: string
}

interface PriceBreakdown {
  itemSubtotal: number
  productDiscount: number
  couponDiscount: number
  deliveryFee: number
  packagingFee: number
  taxes: number
  totalDiscount: number
  amountPaid: number
}

interface PaymentInfo {
  method: string
  status: string
  transactionId: string
  date: string
  time: string
  provider: string
  amountPaid: number
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface DeliveryAgent {
  name: string
  avatar: string
  rating: number
  phone: string
}

interface OrderDetail {
  id: string
  date: string
  time: string
  status: string
  orderType: 'Delivery' | 'Pickup'
  estimatedDelivery?: string
  estimatedTime?: string
  actualDelivery?: string
  items: OrderItemDetail[]
  totalProducts: number
  totalQuantity: number
  address: DeliveryAddress
  price: PriceBreakdown
  payment: PaymentInfo
  customer: CustomerInfo
  agent?: DeliveryAgent
  notes?: string
  giftMessage?: string
  invoiceNumber: string
  invoiceDate: string
}

// ─── Mock Detailed Order Data ───────────────────────────────────────────────

const MOCK_ORDER_DETAILS: Record<string, OrderDetail> = {
  'CPR-20482': {
    id: 'CPR-20482',
    date: 'Aug 8, 2026',
    time: '2:35 PM',
    status: 'delivered',
    orderType: 'Delivery',
    estimatedDelivery: 'Aug 9, 2026',
    estimatedTime: '3:00 PM – 5:00 PM',
    actualDelivery: 'Aug 9, 2026 at 4:12 PM',
    items: [
      { id: 'SKU-001', name: 'Strawberry Velvet Cake Pop', variant: 'Classic', size: 'Regular', qty: 2, unitPrice: 149, discount: 0, subtotal: 298, icon: <Star size={16} /> },
      { id: 'SKU-002', name: 'Chocolate Truffle Delight', variant: 'Premium', size: 'Large', qty: 1, unitPrice: 189, discount: 0, subtotal: 189, icon: <Star size={16} /> },
    ],
    totalProducts: 2,
    totalQuantity: 3,
    address: {
      recipientName: 'Dhanush',
      phone: '+91 98765 43210',
      houseNo: '12A',
      building: 'Sunshine Towers',
      street: 'MG Road',
      area: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      type: 'Home',
      instructions: 'Ring the bell twice. Gate code: 4521',
    },
    price: {
      itemSubtotal: 487,
      productDiscount: 0,
      couponDiscount: 50,
      deliveryFee: 40,
      packagingFee: 15,
      taxes: 35,
      totalDiscount: 50,
      amountPaid: 527,
    },
    payment: {
      method: 'UPI',
      status: 'Paid',
      transactionId: 'TXN-9823749823',
      date: 'Aug 8, 2026',
      time: '2:36 PM',
      provider: 'Google Pay',
      amountPaid: 527,
    },
    customer: {
      name: 'Dhanush',
      email: 'dhanush@gmail.com',
      phone: '+91 98765 43210',
    },
    notes: 'Please make the frosting extra thick!',
    giftMessage: 'Happy Birthday, Mom!',
    invoiceNumber: 'INV-CPR-20482',
    invoiceDate: 'Aug 9, 2026',
  },
  'CPR-20391': {
    id: 'CPR-20391',
    date: 'Aug 6, 2026',
    time: '11:20 AM',
    status: 'shipped',
    orderType: 'Delivery',
    estimatedDelivery: 'Aug 10, 2026',
    estimatedTime: '10:00 AM – 12:00 PM',
    items: [
      { id: 'SKU-003', name: 'Rainbow Sprinkle Pop', variant: 'Party Pack', size: 'Regular', qty: 3, unitPrice: 129, discount: 10, subtotal: 357, icon: <Star size={16} /> },
    ],
    totalProducts: 1,
    totalQuantity: 3,
    address: {
      recipientName: 'Dhanush',
      phone: '+91 98765 43210',
      houseNo: '12A',
      building: 'Sunshine Towers',
      street: 'MG Road',
      area: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      type: 'Home',
    },
    price: {
      itemSubtotal: 387,
      productDiscount: 30,
      couponDiscount: 0,
      deliveryFee: 40,
      packagingFee: 15,
      taxes: 28,
      totalDiscount: 30,
      amountPaid: 440,
    },
    payment: {
      method: 'Credit Card',
      status: 'Paid',
      transactionId: 'TXN-7812394812',
      date: 'Aug 6, 2026',
      time: '11:21 AM',
      provider: 'Visa ****4523',
      amountPaid: 440,
    },
    customer: {
      name: 'Dhanush',
      email: 'dhanush@gmail.com',
      phone: '+91 98765 43210',
    },
    agent: {
      name: 'Alex D.',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=F20D6F',
      rating: 4.9,
      phone: '+91 90000 12345',
    },
    invoiceNumber: 'INV-CPR-20391',
    invoiceDate: 'Aug 6, 2026',
  },
  'CPR-20210': {
    id: 'CPR-20210',
    date: 'Aug 3, 2026',
    time: '4:45 PM',
    status: 'confirmed',
    orderType: 'Delivery',
    estimatedDelivery: 'Aug 12, 2026',
    estimatedTime: '2:00 PM – 4:00 PM',
    items: [
      { id: 'SKU-004', name: 'Caramel Drizzle Pop', variant: 'Gourmet', size: 'Regular', qty: 2, unitPrice: 159, discount: 0, subtotal: 318, icon: <Star size={16} /> },
      { id: 'SKU-005', name: 'Birthday Bliss Cake Pop', variant: 'Celebration', size: 'Large', qty: 2, unitPrice: 179, discount: 0, subtotal: 358, icon: <Star size={16} /> },
    ],
    totalProducts: 2,
    totalQuantity: 4,
    address: {
      recipientName: 'Dhanush',
      phone: '+91 98765 43210',
      houseNo: '12A',
      building: 'Sunshine Towers',
      street: 'MG Road',
      area: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      type: 'Home',
    },
    price: {
      itemSubtotal: 676,
      productDiscount: 0,
      couponDiscount: 75,
      deliveryFee: 0,
      packagingFee: 20,
      taxes: 48,
      totalDiscount: 75,
      amountPaid: 669,
    },
    payment: {
      method: 'Wallet',
      status: 'Paid',
      transactionId: 'TXN-5529384712',
      date: 'Aug 3, 2026',
      time: '4:46 PM',
      provider: 'CakePopRush Wallet',
      amountPaid: 669,
    },
    customer: {
      name: 'Dhanush',
      email: 'dhanush@gmail.com',
      phone: '+91 98765 43210',
    },
    invoiceNumber: 'INV-CPR-20210',
    invoiceDate: 'Aug 3, 2026',
  },
  'CPR-20105': {
    id: 'CPR-20105',
    date: 'Jul 28, 2026',
    time: '9:15 AM',
    status: 'pending',
    orderType: 'Pickup',
    estimatedDelivery: 'Jul 29, 2026',
    estimatedTime: '10:00 AM – 11:00 AM',
    items: [
      { id: 'SKU-006', name: 'Matcha Zen Pop', variant: 'Classic', size: 'Regular', qty: 4, unitPrice: 139, discount: 0, subtotal: 556, icon: <Star size={16} /> },
    ],
    totalProducts: 1,
    totalQuantity: 4,
    address: {
      recipientName: 'Dhanush',
      phone: '+91 98765 43210',
      houseNo: '12A',
      building: 'Sunshine Towers',
      street: 'MG Road',
      area: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      type: 'Work',
    },
    price: {
      itemSubtotal: 556,
      productDiscount: 0,
      couponDiscount: 0,
      deliveryFee: 0,
      packagingFee: 10,
      taxes: 40,
      totalDiscount: 0,
      amountPaid: 606,
    },
    payment: {
      method: 'UPI',
      status: 'Paid',
      transactionId: 'TXN-1192837465',
      date: 'Jul 28, 2026',
      time: '9:16 AM',
      provider: 'PhonePe',
      amountPaid: 606,
    },
    customer: {
      name: 'Dhanush',
      email: 'dhanush@gmail.com',
      phone: '+91 98765 43210',
    },
    invoiceNumber: 'INV-CPR-20105',
    invoiceDate: 'Jul 28, 2026',
  },
}

// ─── Tracking Steps Config ──────────────────────────────────────────────────

const TRACKING_STEPS: TrackingStep[] = [
  { status: 'pending',   label: 'Order Placed',      desc: 'We have received your order',       icon: <ShoppingBag size={18} />,  color: '#FFC700' },
  { status: 'confirmed', label: 'Confirmed',          desc: 'Your order has been confirmed',     icon: <CheckCircle2 size={18} />, color: '#FF8F3D' },
  { status: 'preparing', label: 'Preparing',          desc: 'Our chefs are crafting your treats', icon: <ChefHat size={18} />,     color: '#F20D6F' },
  { status: 'packed',    label: 'Packed',              desc: 'Order is packed and ready',          icon: <PackageCheck size={18} />, color: '#6E56A3' },
  { status: 'shipped',   label: 'Out for Delivery',   desc: 'Your cake pops are on the way!',    icon: <Truck size={18} />,        color: '#07C2BB' },
  { status: 'delivered', label: 'Delivered',           desc: 'Enjoy your treats!',                icon: <Package size={18} />,      color: '#059669' },
]

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  packed: 3,
  shipped: 4,
  delivered: 5,
}

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = id ? MOCK_ORDER_DETAILS[id] : null
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
            {TRACKING_STEPS.map((step, index) => {
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
                    {index < TRACKING_STEPS.length - 1 && (
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
            <div className={styles.addressType}>
              <MapPin size={14} />
              <span>{order.address.type}</span>
            </div>
            <p className={styles.addressName}>{order.address.recipientName}</p>
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
          {order.items.map(item => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemIcon}>{item.icon}</div>
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
          ))}
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
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </motion.div>
  )
}
