import React, { useState } from 'react'
import { ChevronLeft, Package, ChevronRight, ShoppingBag, CheckCircle2, Truck, MessageCircle, Clock } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styles from './OrdersPage.module.css'

import { Order } from '@/types/order'
import { orderData } from '@/features/orders'
import { OrderStatus } from '@/features/orders/data/mockOrders'
import { ProfileLayout } from '@/components/layout/ProfileLayout'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; step: number }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', step: 1 },
  confirmed: { label: 'Confirmed', color: '#0891B2', bg: '#CFFAFE', step: 2 },
  shipped:   { label: 'Shipped',   color: '#F20D6F', bg: '#FFF0F5', step: 3 },
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
  const cfg = STATUS_CONFIG[order.status as OrderStatus]
  const firstItem = order.items?.[0]
  
  if (!firstItem) return null

  // Choose an icon based on status
  let StatusIcon = Package;
  if (order.status === 'pending') StatusIcon = Clock;
  else if (order.status === 'confirmed') StatusIcon = CheckCircle2;
  else if (order.status === 'shipped') StatusIcon = Truck;
  else if (order.status === 'delivered') StatusIcon = CheckCircle2;

  // Format date to remove year if it's "Aug 8, 2026" -> "Aug 8"
  const shortDate = order.date?.split(',')[0] || ''

  return (
    <div 
      className={styles.minimalCard} 
      onClick={() => navigate(`/orders/${order.id}`)}
      style={{
        borderColor: `${cfg.color}40`
      }}
    >
      <div 
        className={styles.minimalHeader}
        style={{
          background: `linear-gradient(135deg, ${cfg.bg} 0%, white 100%)`
        }}
      >
        <div className={styles.minimalStatus}>
          <StatusIcon size={16} color={cfg.color} strokeWidth={2.5} />
          <span className={styles.minimalStatusText} style={{ color: cfg.color }}>
            {cfg.label.toUpperCase()}
          </span>
          <span className={styles.minimalDate}>on {shortDate}</span>
        </div>
        <button 
          className={styles.minimalActionBtn}
          style={{ '--btn-color': cfg.color } as React.CSSProperties}
        >
          {order.status === 'delivered' ? 'REVIEW' : 'TRACK'}
        </button>
      </div>

      <div className={styles.minimalBody}>
        <div className={styles.minimalImageContainer}>
          <img src={firstItem.image} alt={firstItem.name} className={styles.minimalImage} />
        </div>
        
        <div className={styles.minimalContent}>
          <span className={styles.minimalBrand}>{firstItem.category?.toUpperCase() || 'CAKEPOPRUSH COLLECTION'}</span>
          <h4 className={styles.minimalItemName}>{firstItem.name}</h4>
          <p className={styles.minimalVariant}>Variant: Default <span className={styles.minimalDivider}>|</span> Qty: {firstItem.qty || 1}</p>
          <span className={styles.minimalPrice}>₹ {(firstItem.price || 0) * (firstItem.qty || 1)}</span>
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
    ? orderData.getOrders()
    : orderData.getOrders().filter(o => o.status === activeTab)

  return (
    <ProfileLayout isMobileStandalone={true}>
      <div className={styles.page}>
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
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              let activeStyle: React.CSSProperties = {};
              
              if (isActive) {
                if (tab.key === 'all') {
                  activeStyle = {
                    background: 'var(--color-brand-pink)',
                    borderColor: 'var(--color-brand-pink)',
                    color: 'white',
                  };
                } else {
                  const cfg = STATUS_CONFIG[tab.key];
                  activeStyle = {
                    background: `linear-gradient(135deg, ${cfg.bg} 0%, white 100%)`,
                    borderColor: `${cfg.color}40`,
                    color: cfg.color,
                  };
                }
              }
              
              const tabColor = tab.key === 'all' ? 'var(--color-brand-pink)' : STATUS_CONFIG[tab.key].color;
              
              return (
                <button
                  key={tab.key}
                  className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                  style={{
                    ...activeStyle,
                    '--tab-color': tabColor,
                  } as React.CSSProperties}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  {tab.key !== 'all' && (
                    <span className={styles.tabCount} style={isActive ? { background: `${STATUS_CONFIG[tab.key].color}20` } : undefined}>
                      {orderData.getOrders().filter(o => o.status === tab.key).length}
                    </span>
                  )}
                </button>
              )
            })}
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
    </ProfileLayout>
  )
}
