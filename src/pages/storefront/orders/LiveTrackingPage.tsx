import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, HelpCircle, Navigation, Phone, MessageCircle, Star, CheckCircle2, ChevronDown, Share2, Heart, Check, Gift, Clock, FileText, ChefHat, Truck, PackageCheck, Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import styles from './LiveTrackingPage.module.css';
import { DeliveryMap, DeliveryMapRef } from './components/DeliveryMap';
import { useLiveTracking } from './hooks/useLiveTracking';
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer';
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper';
import { orderData } from '@/features/orders';

export const LiveTrackingPage = () => {
  const { id = 'CPR-20482' } = useParams();
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  
  const accordionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    orderData.getOrderById(id).then(found => {
      setOrder(found || null);
    });
  }, [id]);
  
  const mapRef = useRef<DeliveryMapRef>(null);
  const trackingState = useLiveTracking(id);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.recenter();
    }
  };

  // Map live tracking status to a simplified 4-step flow
  let currentStepIndex = 1;
  if (trackingState.status === 'delivered') currentStepIndex = 3;
  else if (trackingState.status === 'on_the_way' || trackingState.status === 'arriving' || trackingState.status === 'picked_up') currentStepIndex = 2;
  else if (trackingState.status === 'ready') currentStepIndex = 1;
  
  const liveTrackingSteps = [
    { status: 'confirmed', label: 'Order Confirmed', Icon: FileText, color: '#F59E0B' },
    { status: 'preparing', label: 'Being Baked', Icon: ChefHat, color: '#F20D6F' },
    { status: 'shipped', label: 'Dispatched', Icon: Truck, color: '#06B6D4' },
    { status: 'delivered', label: 'Delivered', Icon: PackageCheck, color: '#10B981' }
  ];

  return (
    <div className={styles.page}>
      
      {/* Map Section (Full Width Background) */}
      <div className={styles.mapContainer}>
        {/* Real Interactive Map Component */}
        <DeliveryMap state={trackingState} isSheetExpanded={isSheetExpanded} ref={mapRef} />
      </div>

      {/* Map UI Overlay Wrapper (Constrained width on desktop) */}
      <div className={styles.mapOverlayWrapper}>
        {/* Header (Overlay on map) */}
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/orders" className={styles.backBtn} aria-label="Go back">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </Link>
            <button className={styles.backBtn} onClick={() => alert('Sharing Live Tracking Link...')} aria-label="Share tracking">
              <Share2 size={16} strokeWidth={2.5} />
            </button>
          </div>
          <button className={styles.helpBtn}>
            <HelpCircle size={16} /> Help
          </button>
        </header>

        {/* Click-to-close Overlay (Scrim) */}
        <AnimatePresence>
          {isSheetExpanded && (
            <motion.div 
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetExpanded(false)}
              style={{
                position: 'fixed', // changed to fixed so scrim covers whole screen regardless of wrapper
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.2)',
                zIndex: 5,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            />
          )}
        </AnimatePresence>

        {/* ETA Card */}
        <div className={styles.etaCard}>
          {(!trackingState.eta && trackingState.status !== 'delivered') ? (
            <>
              <div className={styles.etaLabel}>
                <ClockIcon size={14} style={{ opacity: 0.5 }} /> <span style={{ opacity: 0.5 }}>Calculating...</span>
              </div>
              <div className={`${styles.etaSkeletonTime} ${styles.skeletonShimmer}`} />
              <div className={`${styles.etaSkeletonStatus} ${styles.skeletonShimmer}`} />
            </>
          ) : (
            <>
              <div className={styles.etaLabel}>
                <ClockIcon size={14} /> {trackingState.status === 'delivered' ? 'Delivered' : 'Arriving in'}
              </div>
              <div className={styles.etaTime}>
                {trackingState.status === 'delivered' 
                  ? 'Now' 
                  : `${trackingState.eta?.minMinutes}-${trackingState.eta?.maxMinutes} min`}
              </div>
              <div className={styles.liveTrackingStatus} style={{ color: trackingState.isLive ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {trackingState.isLive && <div className={styles.pulseDot} />} 
                {trackingState.isLive ? 'Live tracking active' : (trackingState.status === 'delivered' ? 'Order delivered' : 'Location updating...')}
              </div>
            </>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className={styles.mapActionFabs}>
          <button className={styles.mapFab} onClick={() => alert('Calling Delivery Agent...')}>
            <Phone size={16} />
          </button>
        </div>

        {/* Recenter GPS Button */}
        <button className={styles.recenterBtn} onClick={handleRecenter}>
          <Navigation size={14} /> Recenter
        </button>
      </div>

      {/* Bottom Sheet */}
      <motion.div 
        className={styles.bottomSheet}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={(event, info) => {
          if (info.offset.y < -30 || info.velocity.y < -300) {
            setIsSheetExpanded(true);
          } else if (info.offset.y > 30 || info.velocity.y > 300) {
            setIsSheetExpanded(false);
          }
        }}
        onWheel={(e) => {
          if (!isSheetExpanded && e.deltaY > 0) {
            setIsSheetExpanded(true);
          }
        }}
        initial={false}
        style={{ 
          height: '75vh',
        }}
        animate={{ y: isSheetExpanded ? 0 : '40vh' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div 
          className={styles.dragHandleArea} 
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          style={{ touchAction: 'none' }}
        >
          <div className={styles.dragHandle} />
        </div>

        <div 
          ref={scrollContainerRef}
          className={styles.trackingLayout}
          onTouchStart={(e) => {
            setTouchStartY(e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            if (isSheetExpanded && scrollContainerRef.current) {
              const currentY = e.touches[0].clientY;
              // If pulling down and we are at the top of the scroll container
              if (currentY > touchStartY && scrollContainerRef.current.scrollTop <= 0) {
                if (currentY - touchStartY > 60) { // 60px threshold
                  setIsSheetExpanded(false);
                }
              }
            }
          }}
          onWheel={(e) => {
            if (isSheetExpanded && e.deltaY < 0 && scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 0) {
              setIsSheetExpanded(false);
            }
          }}
          onPointerDown={(e) => {
            // Stop framer-motion drag when touching the scrollable content
            e.stopPropagation();
          }}
          style={{
            height: 'calc(100% - 24px)',
            overflowY: isSheetExpanded ? 'auto' : 'hidden',
            touchAction: isSheetExpanded ? 'pan-y' : 'none',
            paddingBottom: '40px'
          }}
        >
          {/* Left / Top: Timeline & Driver */}
          <div>
            {/* Main Status Title */}
            <h2 className={styles.mainStatusTitle}>Your treat is on the way!</h2>

            {/* Driver Info */}
            <div className={styles.driverInfoRow}>
              <div className={styles.driverAvatar}>
                <img 
                  src={order?.agent?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${order?.agent?.name || 'Rahul'}&backgroundColor=F59E0B`} 
                  alt={order?.agent?.name || "Rahul"} 
                  onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${order?.agent?.name || 'Rahul'}&background=F59E0B&color=fff` }} 
                />
              </div>
              <div className={styles.driverDetails}>
                <h4 className={styles.driverNameTitle}>{order?.agent?.name || 'Rahul'} is delivering your order</h4>
                <div className={styles.driverStats}>
                  <div className={styles.statRow}>
                    <Star size={14} fill="#FFC107" color="#FFC107" /> {order?.agent?.rating || 4.8}
                  </div>
                  <span style={{ color: '#E0E0E0' }}>|</span>
                  <div className={styles.statRow}>
                    {order?.agent?.phone || '+91 98765 43210'}
                  </div>
                </div>
              </div>
              <div className={styles.driverActions}>
                <button className={styles.iconBtn}><Phone size={18} /></button>
                <button className={styles.iconBtn}><MessageCircle size={18} /></button>
              </div>
            </div>

            {/* Order Status Timeline Box */}
            <div className={styles.statusBox}>
              <div className={styles.statusBoxHeader}>
                <div className={styles.deliveryAddressContainer}>
                  <span className={styles.deliveryLabel}>Delivering to</span>
                  <span className={styles.deliveryAddress}>
                    {order?.address ? 
                      `${order.address.type || 'Home'} - ${order.address.houseNo}${order.address.building ? `, ${order.address.building}` : ''}, ${order.address.street}, ${order.address.area}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` 
                      : 'Loading Address...'}
                  </span>
                </div>
              </div>
              <div className={styles.statusBoxBody} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.timeline} style={{ flex: 1 }}>
                  {liveTrackingSteps.map((step, index: number) => {
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex

                    return (
                      <div key={step.status} className={`${styles.timelineStep} ${isCurrent ? styles.currentStep : isCompleted ? styles.completedStep : styles.upcomingStep}`}>
                        <div className={styles.stepIndicator}>
                          <div
                            className={`${styles.stepIcon} ${isCurrent ? styles.currentIcon : isCompleted ? styles.completedIcon : styles.upcomingIcon}`}
                            style={isCompleted || isCurrent ? { background: step.color, color: 'white', boxShadow: isCurrent ? `0 0 0 4px ${step.color}33` : 'none' } : {}}
                            aria-label={`${step.label}: ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                          >
                            {isCompleted ? <Check size={10} strokeWidth={3} /> : <step.Icon size={isCurrent ? 14 : 10} />}
                          </div>
                          {index < liveTrackingSteps.length - 1 && (
                            <div
                              className={styles.stepConnector}
                              style={isCompleted ? { background: step.color } : {}}
                            />
                          )}
                        </div>
                        <div className={styles.stepContent}>
                          <h4 className={styles.stepLabel} style={isCurrent ? { color: step.color } : {}}>{step.label}</h4>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* OTP Block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#F8F9FA', padding: '16px 20px', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>DELIVERY OTP</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-chocolate)', letterSpacing: '4px', marginTop: '4px', fontFamily: 'monospace' }}>
                    {order?.id ? order.id.replace(/\D/g, '').slice(-4) : '8273'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items Box */}
            <div className={styles.statusBox} style={{ marginTop: '16px' }}>
              <div className={styles.statusBoxHeader} style={{ padding: '12px 16px 4px' }}>
                <div className={styles.statusBoxHeaderLeft}>
                  <h2 className={styles.statusBoxTitle} style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                    ORDER ITEMS {order && `(${order.totalProducts} PRODUCTS, ${order.totalQuantity} ITEMS)`}
                  </h2>
                </div>
              </div>
              <div className={styles.statusBoxBody} style={{ padding: '0 16px 8px' }}>
                {order?.items?.map((item: any) => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemIcon}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = item.name.charAt(0) }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#9CA3AF', fontSize: '16px', fontWeight: 'bold' }}>
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemMeta}>{item.variant}</span>
                      <span className={styles.itemQty}>Qty: {item.qty || item.quantity} × Rs.{item.unitPrice || item.price}</span>
                    </div>
                    <div className={styles.itemPriceCol}>
                      <span className={styles.itemSubtotal}>Rs.{item.subtotal || ((item.unitPrice || item.price) * (item.qty || item.quantity))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Details Box */}
            <div className={styles.statusBox} style={{ marginTop: '16px' }}>
              <div className={styles.statusBoxHeader} style={{ padding: '12px 16px 8px', borderBottom: '1px solid #EAEAEA' }}>
                <div className={styles.statusBoxHeaderLeft}>
                  <h2 className={styles.statusBoxTitle} style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>PRICE DETAILS</h2>
                </div>
              </div>
              <div className={styles.statusBoxBody} style={{ padding: '8px 16px 16px' }}>
                {order && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                      <span>Item Subtotal</span>
                      <span style={{ fontWeight: 600 }}>Rs.{order.price?.itemSubtotal || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                      <span>Delivery Fee</span>
                      <span style={{ fontWeight: 600 }}>Rs.{order.price?.deliveryFee || 0}</span>
                    </div>
                    {order.price?.packagingFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                        <span>Packaging Fee</span>
                        <span style={{ fontWeight: 600 }}>Rs.{order.price?.packagingFee}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                      <span>Taxes</span>
                      <span style={{ fontWeight: 600 }}>Rs.{order.price?.taxes || 0}</span>
                    </div>
                    {(order.price?.couponDiscount || 0) > 0 && (
                      <div className={styles.discountRow}>
                        <span>Total Savings</span>
                        <span>-Rs.{order.price?.couponDiscount}</span>
                      </div>
                    )}
                    <div className={styles.totalRow}>
                      <span>Amount Paid</span>
                      <span>Rs.{order.price?.amountPaid || (order.price?.itemSubtotal + (order.price?.deliveryFee || 0) + (order.price?.packagingFee || 0) + (order.price?.taxes || 0) - (order.price?.couponDiscount || 0))}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right / Bottom: Promo & Accordion */}
          <div>
            <div className={styles.promoCard} style={{ background: '#FFF0F5', border: 'none', borderRadius: '16px', boxShadow: 'none' }}>
              <h4 className={styles.promoTitle} style={{ color: 'var(--color-chocolate)' }}>Love our service?</h4>
              <p className={styles.promoDesc} style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>Rate your experience</p>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0, 
                      cursor: 'pointer', 
                      color: (hoverRating || rating) >= star ? '#F59E0B' : 'white',
                      transition: 'transform 0.2s',
                      transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)'
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star 
                      size={28} 
                      fill={(hoverRating || rating) >= star ? 'currentColor' : 'white'} 
                      stroke={(hoverRating || rating) >= star ? 'currentColor' : '#FCA5A5'}
                      strokeWidth={1.5} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Order Details Accordion */}
            <div ref={accordionRef} className={styles.orderDetailsCard} style={{ marginTop: '16px', borderRadius: '12px', border: '1px solid #EAEAEA', boxShadow: 'none' }}>
              <button 
                className={styles.orderDetailsHeader}
                onClick={() => {
                  const willOpen = !orderDetailsOpen;
                  setOrderDetailsOpen(willOpen);
                  if (willOpen) {
                    setTimeout(() => {
                      accordionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 150);
                  }
                }}
                style={{ padding: '12px 16px', borderBottom: orderDetailsOpen ? '1px solid #EAEAEA' : 'none' }}
              >
                <div className={styles.statusBoxHeaderLeft}>
                  <div className={styles.statusBoxIcon}>
                    <ClipboardListIcon size={16} strokeWidth={2.5} />
                  </div>
                  <h2 className={styles.statusBoxTitle} style={{ fontSize: '10px', color: 'var(--color-chocolate)' }}>ORDER INFORMATION</h2>
                </div>
                <ChevronDown size={18} style={{ transform: orderDetailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--color-chocolate)' }} />
              </button>
              
              <AnimatePresence>
                {orderDetailsOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className={styles.orderDetailsContent} style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {order && (
                        <>
                          <div className={styles.subSection}>
                            <h4 className={styles.subSectionTitle}>Payment Information</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Method</span>
                              <span style={{ fontWeight: 600 }}>{order.payment?.method || 'UPI'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Provider</span>
                              <span style={{ fontWeight: 600 }}>{order.payment?.provider || 'Google Pay'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Status</span>
                              <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{order.payment?.status || order.paymentStatus || 'Paid'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Transaction ID</span>
                              <span style={{ fontWeight: 600 }}>{order.payment?.transactionId || 'TXN-9823749823'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Date</span>
                              <span style={{ fontWeight: 600 }}>{order.payment?.date || order.date || 'Aug 8, 2026'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Amount</span>
                              <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Rs.{order.payment?.amount || order.price?.amountPaid || '527'}</span>
                            </div>
                          </div>
    
                          <div className={styles.subSection}>
                            <h4 className={styles.subSectionTitle}>Customer Information</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Name</span>
                              <span style={{ fontWeight: 600 }}>{order.address?.recipientName || (typeof order.customer === 'object' ? order.customer?.name : order.customer) || 'Customer'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Email</span>
                              <span style={{ fontWeight: 600 }}>{(typeof order.customer === 'object' ? order.customer?.email : order.email) || 'customer@example.com'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Phone</span>
                              <span style={{ fontWeight: 600 }}>{order.address?.phone || (typeof order.customer === 'object' ? order.customer?.phone : '') || '+91 99999 99999'}</span>
                            </div>
                          </div>
    
                          {(order.notes || order.giftMessage) && (
                            <div className={styles.subSection}>
                              <h4 className={styles.subSectionTitle}>Order Notes</h4>
                              {order.notes && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                                  <span>Special Request</span>
                                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{order.notes}</span>
                                </div>
                              )}
                              {order.giftMessage && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                                  <span>Gift Message</span>
                                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{order.giftMessage}</span>
                                </div>
                              )}
                            </div>
                          )}
    
                          <div className={styles.subSection}>
                            <h4 className={styles.subSectionTitle}>Invoice</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Invoice No.</span>
                              <span style={{ fontWeight: 600 }}>INV-{order.id?.replace('#', '') || 'CPR-20482'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Invoice Date</span>
                              <span style={{ fontWeight: 600 }}>{order.date || 'Aug 9, 2026'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Billing Name</span>
                              <span style={{ fontWeight: 600 }}>{order.address?.recipientName || (typeof order.customer === 'object' ? order.customer?.name : order.customer) || 'Customer'}</span>
                            </div>
                            <button className={styles.invoiceBtn} onClick={() => setShowInvoice(true)}>
                              <FileText size={16} /> View Invoice
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </motion.div>
      
      {/* Invoice Viewer Modal */}
      {order && (
        <InvoiceViewer 
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          data={mapOrderToInvoiceData(order)}
        />
      )}
    </div>
  );
};

// Subcomponent for Timeline Step
const TimelineStep = ({ 
  title, desc, time, status, icon, isLast = false 
}: { 
  title: string, desc: React.ReactNode, time: string, status: 'completed'|'current'|'upcoming', icon: React.ReactNode, isLast?: boolean 
}) => {
  return (
    <div className={styles.timelineStep}>
      <div className={styles.stepIndicator}>
        <div className={`${styles.stepIcon} ${styles[status]}`}>
          {icon}
        </div>
        {!isLast && <div className={`${styles.stepLine} ${status === 'completed' ? styles.completed : ''}`} />}
      </div>
      <div className={styles.stepContent}>
        <div className={styles.stepHeader}>
          <div>
            <h4 className={`${styles.stepTitle} ${styles[status]}`}>{title}</h4>
            <p className={styles.stepDesc}>{desc}</p>
          </div>
          {time && <span className={`${styles.stepTime} ${styles[status]}`}>{time}</span>}
        </div>
      </div>
      
    </div>
  );
};


// Missing Icons Mocked (Since lucide doesn't have exact matches for some of these specific ones in the screenshot)
const ClockIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const StoreIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const HomeIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
);
const ClipboardListIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
);
const ChefHatIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>
);
const PackageIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
);
const ScooterIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M12 17h5"/><path d="M16 11V7l-3 4-2-1-3 3"/><path d="M2 12h2l2 5"/></svg>
);
const MapPinIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
