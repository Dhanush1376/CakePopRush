import React, { useState, useEffect } from 'react'
import { ChevronLeft, Package, ChevronRight, ShoppingBag, CheckCircle2, Truck, MessageCircle, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './OrdersPage.module.css'

import { Order } from '@/types/order'
import { orderData } from '@/features/orders'
import { ProfileLayout } from '@/components/layout/ProfileLayout'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
  pending:           { label: 'Order Pending',   color: '#D97706', bg: '#FFFBEB', step: 0 },
  'order confirmed': { label: 'Order Pending',   color: '#D97706', bg: '#FFFBEB', step: 0 },
  confirmed:         { label: 'Order Pending',   color: '#D97706', bg: '#FFFBEB', step: 0 },
  'not dispatched':  { label: 'Order Pending',   color: '#D97706', bg: '#FFFBEB', step: 0 },
  'being baked':     { label: 'Being Baked',     color: '#B45309', bg: '#FEF3C7', step: 2 },
  preparing:         { label: 'Being Baked',     color: '#B45309', bg: '#FEF3C7', step: 2 },
  ready_for_pickup:  { label: 'Being Baked',     color: '#B45309', bg: '#FEF3C7', step: 2 },
  assigned:          { label: 'Being Baked',     color: '#B45309', bg: '#FEF3C7', step: 2 },
  agent_accepted:    { label: 'Being Baked',     color: '#B45309', bg: '#FEF3C7', step: 2 },
  processing:        { label: 'Being Baked',     color: '#B45309', bg: '#FEF3C7', step: 2 },
  dispatched:        { label: 'Dispatched',      color: '#EC4899', bg: '#FFF0F5', step: 3 },
  shipped:           { label: 'Dispatched',      color: '#EC4899', bg: '#FFF0F5', step: 3 },
  picked_up:         { label: 'Dispatched',      color: '#EC4899', bg: '#FFF0F5', step: 3 },
  out_for_delivery:  { label: 'Dispatched',      color: '#EC4899', bg: '#FFF0F5', step: 3 },
  arrived:           { label: 'Dispatched',      color: '#EC4899', bg: '#FFF0F5', step: 3 },
  completed:         { label: 'Delivered',       color: '#059669', bg: '#D1FAE5', step: 4 },
  delivered:         { label: 'Delivered',       color: '#059669', bg: '#D1FAE5', step: 4 },
  otp_verified:      { label: 'Delivered',       color: '#059669', bg: '#D1FAE5', step: 4 },
  cancelled:         { label: 'Cancelled',       color: '#EF4444', bg: '#FEE2E2', step: 0 },
}

const getOrderStatusConfig = (order: Order) => {
  const normStatus = (order.status || order.orderStatus || order.internalStatus || '').toLowerCase().trim();
  const rawInternal = (order.internalStatus || '').toUpperCase().trim();
  
  const isCancelled = normStatus.includes('cancel') || (order as any)?.isCancelled === true;
  if (isCancelled) {
    return STATUS_CONFIG['cancelled'];
  }

  const isCompleted = normStatus === 'delivered' || normStatus === 'completed' || normStatus === 'otp_verified';
  if (isCompleted) {
    return STATUS_CONFIG['delivered'];
  }

  const isDispatched = Boolean(
    normStatus === 'dispatched' || 
    normStatus === 'shipped' || 
    normStatus === 'picked_up' || 
    normStatus === 'out_for_delivery' ||
    normStatus === 'arrived' ||
    rawInternal === 'DISPATCHED' ||
    order?.statusHistory?.some((h: any) => ['DISPATCHED', 'SHIPPED', 'PICKED_UP'].includes((h?.status || '').toUpperCase()))
  );
  if (isDispatched) {
    return STATUS_CONFIG['dispatched'];
  }

  // "Being Baked" step is ONLY active once the admin approves or kitchen begins
  const isBeingBaked = Boolean(
    normStatus === 'being baked' || 
    normStatus === 'preparing' || 
    normStatus === 'processing' || 
    normStatus === 'ready_for_pickup' || 
    normStatus === 'assigned' || 
    normStatus === 'agent_accepted' ||
    ['PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'AGENT_ACCEPTED'].includes(rawInternal) ||
    order?.statusHistory?.some((h: any) => ['BEING BAKED', 'PREPARING'].includes((h?.status || '').toUpperCase()))
  );
  if (isBeingBaked) {
    return STATUS_CONFIG['being baked'];
  }

  // If not completed, not cancelled, not dispatched, and not yet being baked, the order is PENDING admin approval
  return STATUS_CONFIG['pending'];
};

const OrderCard = ({ order }: { order: Order }) => {
  const navigate = useNavigate()
  const cfg = getOrderStatusConfig(order)
  const firstItem = order.items?.[0]
  
  if (!firstItem) return null

  // Choose an icon based on canonical status
  let StatusIcon = Package;
  if (cfg.label === 'Order Pending' || cfg.label === 'Being Baked') StatusIcon = Clock;
  else if (cfg.label === 'Dispatched') StatusIcon = Truck;
  else if (cfg.label === 'Delivered') StatusIcon = CheckCircle2;

  // Format date to remove year if it's "Aug 8, 2026" -> "Aug 8"
  const shortDate = order.date?.split(',')[0] || ''
  const isCompleted = cfg.label === 'Delivered'
  const isDispatched = cfg.label === 'Dispatched'

  return (
    <div 
      className={styles.minimalCard} 
      onClick={() => navigate(`/orders/${order.id}`, { state: { order } })}
    >
      <div 
        className={styles.minimalHeader}
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
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${order.id}`, { state: { order } });
          }}
        >
          {isCompleted ? 'REVIEW' : 'TRACK'}
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
          <div className={styles.minimalPriceContainer}>
            <span className={styles.minimalPrice}>Rs.{(firstItem.price || 0) * (firstItem.qty || 1)}</span>
            <span className={styles.minimalOriginalPrice}>Rs.{Math.round((firstItem.price || 0) / 0.8) * (firstItem.qty || 1)}</span>
          </div>

          {/* Customer OTP badge exclusively displayed during DISPATCHED state */}
          {isDispatched && (order.deliveryOtp || order.id) && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FDF2F8',
              border: '1px dashed #F472B6',
              borderRadius: '6px',
              padding: '3px 8px',
              marginTop: '6px',
              width: 'fit-content'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#9D174D' }}>DELIVERY OTP:</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#831843', letterSpacing: '2px', fontFamily: 'monospace' }}>
                {order.deliveryOtp || order.id?.replace(/\D/g, '').slice(-4)}
              </span>
            </div>
          )}
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

const OrderSkeleton = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className={`${styles.skeletonIcon} ${styles.skeletonShimmer}`} />
        <div className={`${styles.skeletonText} ${styles.skeletonShimmer}`} style={{ width: '60px' }} />
        <div className={`${styles.skeletonText} ${styles.skeletonShimmer}`} style={{ width: '80px', marginLeft: '8px' }} />
      </div>
      <div className={`${styles.skeletonBtn} ${styles.skeletonShimmer}`} />
    </div>
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeletonImage} ${styles.skeletonShimmer}`} />
      <div className={styles.skeletonContent}>
        <div className={`${styles.skeletonText} ${styles.skeletonShimmer}`} style={{ width: '40%' }} />
        <div className={`${styles.skeletonTextLg} ${styles.skeletonShimmer}`} style={{ width: '70%' }} />
        <div className={`${styles.skeletonText} ${styles.skeletonShimmer}`} style={{ width: '60%' }} />
        <div className={`${styles.skeletonTextLg} ${styles.skeletonShimmer}`} style={{ width: '30%' }} />
      </div>
    </div>
  </div>
)

// ─── Main Page ───────────────────────────────────────────────────────────────
export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    orderData.getOrders().then(data => {
      // Small timeout to actually see the skeleton
      setTimeout(() => {
        setOrders(data)
        setIsLoading(false)
      }, 500)
    })
  }, [])

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

        <div className={styles.list}>
          {isLoading ? (
            <>
              <OrderSkeleton />
              <OrderSkeleton />
              <OrderSkeleton />
            </>
          ) : orders.length > 0 ? (
            orders.map(order => <OrderCard key={order.id} order={order} />)
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </ProfileLayout>
  )
}
