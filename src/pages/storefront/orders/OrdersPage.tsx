import React, { useState } from 'react'
import { ChevronLeft, Package, ChevronRight, ShoppingBag, Heart, Star, Sparkles, Coffee, Gift, Leaf, CheckCircle2, Truck, MessageCircle, Clock } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styles from './OrdersPage.module.css'

// ─── Mock Data ──────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered'

interface OrderItem {
  name: string
  qty: number
  price: number
  image: string
}

export interface Order {
  id: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  estimatedDelivery?: string
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'CPR-20482',
    date: 'Aug 8, 2026',
    status: 'delivered',
    estimatedDelivery: 'Aug 9, 2026',
    items: [
      { name: 'Strawberry Velvet Cake Pop', qty: 2, price: 149, image: '/images/Products/mini valentine cake.jpeg' },
      { name: 'Chocolate Truffle Delight', qty: 1, price: 189, image: '/images/Products/Dark choclate cakepops.jpeg' },
    ],
    total: 487,
  },
  {
    id: 'CPR-20391',
    date: 'Aug 6, 2026',
    status: 'shipped',
    estimatedDelivery: 'Aug 10, 2026',
    items: [
      { name: 'Rainbow Sprinkle Pop', qty: 3, price: 129, image: '/images/Products/White choclate cakepops.jpeg' },
    ],
    total: 387,
  },
  {
    id: 'CPR-20210',
    date: 'Aug 3, 2026',
    status: 'confirmed',
    estimatedDelivery: 'Aug 12, 2026',
    items: [
      { name: 'Caramel Drizzle Pop', qty: 2, price: 159, image: '/images/Products/Milk choclate cakepops.jpeg' },
      { name: 'Birthday Bliss Cake Pop', qty: 2, price: 179, image: '/images/Products/asorted flavours of cookies.jpeg' },
    ],
    total: 676,
  },
  {
    id: 'CPR-20105',
    date: 'Jul 28, 2026',
    status: 'pending',
    items: [
      { name: 'Matcha Zen Pop', qty: 4, price: 139, image: '/images/Products/pista flavoured rainbow chips.jpeg' },
    ],
    total: 556,
  },
]

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; step: number }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', step: 1 },
  confirmed: { label: 'Confirmed', color: '#0891B2', bg: '#CFFAFE', step: 2 },
  shipped:   { label: 'Shipped',   color: 'var(--color-brand-pink)', bg: '#FFF0F5', step: 3 },
  delivered: { label: 'Delivered', color: '#059669', bg: '#D1FAE5', step: 4 },
}

const STEPS = [
  { label: 'Placed', icon: <ShoppingBag size={12} strokeWidth={2.5} />, color: '#FFC700' },
  { label: 'Confirmed', icon: <CheckCircle2 size={12} strokeWidth={2.5} />, color: '#F20D6F' },
  { label: 'Shipped', icon: <Truck size={12} strokeWidth={2.5} />, color: '#07C2BB' },
  { label: 'Delivered', icon: <Package size={12} strokeWidth={2.5} />, color: '#059669' },
]

const TABS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped',   label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const OrderCard = ({ order }: { order: Order }) => {
  const navigate = useNavigate()
  const cfg = STATUS_CONFIG[order.status]
  const firstItem = order.items[0]
  
  // Choose an icon based on status
  let StatusIcon = Package;
  if (order.status === 'pending') StatusIcon = Clock;
  else if (order.status === 'confirmed') StatusIcon = CheckCircle2;
  else if (order.status === 'shipped') StatusIcon = Truck;
  else if (order.status === 'delivered') StatusIcon = CheckCircle2;

  // Format date to remove year if it's "Aug 8, 2026" -> "Aug 8"
  const shortDate = order.date.split(',')[0]

  return (
    <div 
      className={styles.minimalCard} 
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      <div className={styles.minimalHeader}>
        <div className={styles.minimalStatus}>
          <StatusIcon size={16} color={cfg.color} strokeWidth={2.5} />
          <span className={styles.minimalStatusText} style={{ color: cfg.color }}>
            {cfg.label.toUpperCase()}
          </span>
          <span className={styles.minimalDate}>on {shortDate}</span>
        </div>
        <button className={styles.minimalActionBtn}>
          {order.status === 'delivered' ? 'REVIEW' : 'TRACK'}
        </button>
      </div>

      <div className={styles.minimalBody}>
        <div className={styles.minimalImageContainer}>
          <img src={firstItem.image} alt={firstItem.name} className={styles.minimalImage} />
        </div>
        
        <div className={styles.minimalContent}>
          <span className={styles.minimalBrand}>CAKEPOPRUSH COLLECTION</span>
          <h4 className={styles.minimalItemName}>{firstItem.name}</h4>
          <p className={styles.minimalVariant}>Variant: Default <span className={styles.minimalDivider}>|</span> Qty: {firstItem.qty}</p>
          <span className={styles.minimalPrice}>Rs.{firstItem.price * firstItem.qty}</span>
        </div>
        
        <div className={styles.minimalChevron}>
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  )
}

const EmptyState = () => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}><Package size={48} strokeWidth={1} /></div>
    <h3 className={styles.emptyTitle}>No orders yet!</h3>
    <p className={styles.emptyText}>Looks like you have not ordered any cake pops yet. Time to treat yourself!</p>
    <Link to="/shop" className={styles.shopBtn}>
      <ShoppingBag size={16} />
      Browse Treats
    </Link>
  </div>
)

// ─── Main Page ───────────────────────────────────────────────────────────────
export const OrdersPage = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>((location.state as any)?.tab || 'all')
  const filtered = activeTab === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === activeTab)

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <header className={styles.header}>
        <Link to="/profile" className={styles.backBtn}>
          <ChevronLeft size={20} strokeWidth={2.5} />
          <span>BACK</span>
        </Link>
        <button className={styles.helpBtn}>
          <MessageCircle size={18} strokeWidth={2} />
          <span>NEED HELP?</span>
        </button>
      </header>

      <div className={styles.tabsWrapper}>
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className={styles.tabCount}>
                  {MOCK_ORDERS.filter(o => o.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  )
}
