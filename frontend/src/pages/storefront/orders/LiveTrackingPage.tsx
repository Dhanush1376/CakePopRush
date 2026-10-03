import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, HelpCircle, Navigation, Phone, MessageCircle, CheckCircle2, ChevronDown, ChevronUp, Heart, Check, Gift, Clock, FileText, ChefHat, Truck, PackageCheck, Package, XCircle, AlertCircle, Maximize2, Minimize2, MapPin } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import styles from './LiveTrackingPage.module.css';
import { DeliveryMap, DeliveryMapRef } from './components/DeliveryMap';
import { useLiveTracking } from './hooks/useLiveTracking';
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer';
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper';
import { orderData } from '@/features/orders';
import { CakePopMascot, MascotReaction } from '@/components/mascot';

const formatAddress = (order: any, destinationAddress?: any): string => {
  const addr = order?.shippingAddress || order?.delivery?.addressSnapshot || order?.address || destinationAddress;
  if (!addr) return 'Delivery address on file';
  if (typeof addr === 'string') return addr;

  const streetParts = [
    addr.line1,
    addr.street,
    addr.houseNo,
    addr.building,
  ].filter(Boolean);
  const primaryStreet = streetParts.length > 0 ? streetParts[0] : '';

  const secondaryParts = [
    addr.line2,
    addr.area,
    addr.landmark ? `Near ${addr.landmark.replace(/^near\s+/i, '')}` : '',
  ].filter(Boolean);

  const cityStateZip = [
    [addr.city, addr.state].filter(Boolean).join(', '),
    addr.pincode || addr.zipCode || addr.postalCode ? `- ${addr.pincode || addr.zipCode || addr.postalCode}` : '',
  ].filter(Boolean).join(' ');

  const allParts = [
    primaryStreet,
    ...secondaryParts,
    cityStateZip,
  ].filter(Boolean);

  const formatted = allParts.join(', ').replace(/,\s*-/, ' -');
  if (!formatted) return 'Delivery address on file';

  const type = addr.type ? String(addr.type).charAt(0).toUpperCase() + String(addr.type).slice(1).toLowerCase() : '';
  return type ? `${type} • ${formatted}` : formatted;
};

interface TypingTextProps {
  text?: string;
  texts?: string[];
  words?: string[];
  speed?: number;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDelay?: number;
}

const TypingText = ({
  text,
  texts,
  words,
  speed = 40,
  typingSpeed = 40,
  deletingSpeed = 22,
  pauseDelay = 1800,
}: TypingTextProps) => {
  const phraseList = words || texts || (text ? [text] : []);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const tSpeed = typingSpeed || speed;

  useEffect(() => {
    if (phraseList.length === 0) return;
    const currentPhrase = phraseList[phraseIndex % phraseList.length];

    if (phraseList.length === 1) {
      if (displayed.length < currentPhrase.length) {
        const timer = setTimeout(() => {
          setDisplayed(currentPhrase.slice(0, displayed.length + 1));
        }, tSpeed);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (!isDeleting) {
      if (displayed.length < currentPhrase.length) {
        const timer = setTimeout(() => {
          setDisplayed(currentPhrase.slice(0, displayed.length + 1));
        }, tSpeed);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      if (displayed.length > 0) {
        const timer = setTimeout(() => {
          setDisplayed(currentPhrase.slice(0, displayed.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phraseList.length);
      }
    }
  }, [displayed, isDeleting, phraseIndex, phraseList, tSpeed, deletingSpeed, pauseDelay]);

  return <>{displayed}</>;
};

const PENDING_THOUGHTS: { text: string; reaction: MascotReaction }[] = [
  { text: 'Waiting for bakery confirmation...', reaction: 'pleadingCute' },
  { text: 'Bakery is reviewing your order...', reaction: 'happy' },
  { text: 'Baking will start shortly...', reaction: 'excited' },
];

const PendingMascotSection = ({ isSheetExpanded = false }: { isSheetExpanded?: boolean }) => {
  const [index, setIndex] = useState(0);

  const currentThought = PENDING_THOUGHTS[index % PENDING_THOUGHTS.length];

  // Rotate thought smoothly forward without backspacing or fading back
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PENDING_THOUGHTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ pointerEvents: 'auto' }}>
      {/* Speech Bubble Floating at the Upper-Left Corner of the Mascot */}
      <div 
        className={styles.speechBubbleCornerAnchor}
        style={{ 
          opacity: isSheetExpanded ? 0 : 1, 
          pointerEvents: isSheetExpanded ? 'none' : 'auto',
          transition: 'opacity 0.25s ease' 
        }}
      >
        <div className={`${styles.speechBubble} ${styles.pendingSpeechBubble}`}>
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
            >
              {currentThought.text}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Mascot Peeking Behind Top Rim of the Pull-Over Sheet */}
      <motion.div
        className={styles.mascotStickyContainer}
        animate={{ x: '-50%', y: [0, -3.5, 0] }}
        style={{ x: '-50%' }}
        transition={{ duration: 3.8, ease: 'easeInOut', repeat: Infinity }}
      >
        <CakePopMascot
          size="medium"
          hideArms={true}
          reaction={currentThought.reaction}
        />
      </motion.div>
      <motion.div
        className={styles.mascotHandLeft}
        animate={{ y: [0, -1, 0], rotate: -10 }}
        style={{ rotate: -10 }}
        transition={{ duration: 3.8, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        className={styles.mascotHandRight}
        animate={{ y: [0, -1, 0], rotate: 10 }}
        style={{ rotate: 10 }}
        transition={{ duration: 3.8, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
  );
};

const DELIVERED_THOUGHTS: { text: string; reaction: MascotReaction }[] = [
  { text: 'Yummy! Delivered fresh to you!', reaction: 'party' },
  { text: 'Hope you love every single bite!', reaction: 'heartEyes' },
  { text: 'Sweet cravings satisfied!', reaction: 'happy' },
  { text: 'Enjoy your delicious treats!', reaction: 'excited' },
];

const DeliveredMascotSection = ({ isSheetExpanded = false }: { isSheetExpanded?: boolean }) => {
  const [index, setIndex] = useState(0);

  const currentThought = DELIVERED_THOUGHTS[index % DELIVERED_THOUGHTS.length];

  // Rotate thought smoothly forward
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DELIVERED_THOUGHTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ pointerEvents: 'auto' }}>
      {/* Speech Bubble Floating at the Upper-Left Corner of the Mascot with Pop-up Animation */}
      <div 
        className={styles.speechBubbleCornerAnchor}
        style={{ 
          bottom: 'calc(100% + 116px)',
          opacity: isSheetExpanded ? 0 : 1, 
          pointerEvents: isSheetExpanded ? 'none' : 'auto',
          transition: 'opacity 0.25s ease' 
        }}
      >
        <motion.div 
          className={`${styles.speechBubble} ${styles.deliveredSpeechBubble}`}
          initial={{ scale: 0, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
            >
              {currentThought.text}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mascot Peeking Behind Top Rim with Pop-Up Spring Animation - shifted a little down */}
      <motion.div
        className={styles.mascotStickyContainer}
        initial={{ scale: 0.35, y: 70, opacity: 0 }}
        animate={{ 
          x: '-50%', 
          scale: 1, 
          y: [12, 8.5, 12], 
          opacity: 1 
        }}
        style={{ x: '-50%' }}
        transition={{ 
          scale: { type: 'spring', damping: 14, stiffness: 240, delay: 0.12 },
          opacity: { duration: 0.2, delay: 0.08 },
          y: { duration: 3.4, ease: 'easeInOut', repeat: Infinity, delay: 0.55 }
        }}
        onClick={() => setIndex((prev) => (prev + 1) % DELIVERED_THOUGHTS.length)}
      >
        <CakePopMascot
          size="medium"
          hideArms={true}
          reaction={currentThought.reaction}
        />
      </motion.div>

      {/* Hands clutching the top rim of the sheet with Pop-In Animation */}
      <motion.div
        className={styles.mascotHandLeft}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [4, 3, 4], rotate: -10 }}
        style={{ rotate: -10 }}
        transition={{ 
          scale: { type: 'spring', damping: 12, stiffness: 260, delay: 0.26 },
          opacity: { duration: 0.2, delay: 0.2 },
          y: { duration: 3.4, ease: 'easeInOut', repeat: Infinity, delay: 0.55 }
        }}
      />
      <motion.div
        className={styles.mascotHandRight}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [4, 3, 4], rotate: 10 }}
        style={{ rotate: 10 }}
        transition={{ 
          scale: { type: 'spring', damping: 12, stiffness: 260, delay: 0.26 },
          opacity: { duration: 0.2, delay: 0.2 },
          y: { duration: 3.4, ease: 'easeInOut', repeat: Infinity, delay: 0.55 }
        }}
      />
    </div>
  );
};

export const LiveTrackingPage = () => {
  const { id = '' } = useParams();
  const location = useLocation();
  const initialOrder = (location.state as any)?.order || null;
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isFullMap, setIsFullMap] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [order, setOrder] = useState<any>(initialOrder);
  const [isLoading, setIsLoading] = useState(!initialOrder);
  const touchStartYRef = useRef(0);
  const accordionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    if (!initialOrder) {
      setIsLoading(true);
    }
    orderData.getOrderById(id).then(found => {
      if (found) setOrder(found);
      else if (!initialOrder) setOrder(null);
    }).catch(() => {
      if (!initialOrder) setOrder(null);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [id]);

  // Real-time polling so customer page automatically updates when admin approves
  React.useEffect(() => {
    if (!id) return;
    const pollInterval = setInterval(() => {
      orderData.getOrderById(id).then((found: any) => {
        if (found) {
          setOrder((prev: any) => {
            const prevStatus = (prev?.status || prev?.orderStatus || prev?.internalStatus || '').toLowerCase();
            const newStatus = (found?.status || found?.orderStatus || found?.internalStatus || '').toLowerCase();
            const prevInternal = (prev?.internalStatus || '').toUpperCase();
            const newInternal = (found?.internalStatus || '').toUpperCase();
            if (prevStatus !== newStatus || prevInternal !== newInternal) {
              return found;
            }
            return prev;
          });
        }
      }).catch(() => {});
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [id]);

  const mapRef = useRef<DeliveryMapRef>(null);

  const normStatus = (order?.status || order?.orderStatus || order?.internalStatus || '').toLowerCase().trim();
  const rawInternal = (order?.internalStatus || '').toUpperCase().trim();
  const isCancelled = normStatus.includes('cancel') || (order as any)?.isCancelled === true;
  const isCompleted = !isCancelled && (normStatus === 'delivered' || normStatus === 'completed');

  // "Being Baked" step is ONLY active once the admin approves or kitchen begins
  const isBeingBaked = !isCancelled && !isCompleted && Boolean(
    normStatus === 'being baked' || 
    normStatus === 'preparing' || 
    normStatus === 'processing' || 
    normStatus === 'ready_for_pickup' || 
    normStatus === 'assigned' || 
    normStatus === 'agent_accepted' ||
    ['PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'AGENT_ACCEPTED'].includes(rawInternal) ||
    order?.statusHistory?.some((h: any) => ['BEING BAKED', 'PREPARING'].includes((h?.status || '').toUpperCase()))
  );

  const isDispatched = !isCancelled && !isCompleted && !isBeingBaked && Boolean(
    normStatus === 'dispatched' || 
    normStatus === 'shipped' || 
    normStatus === 'picked_up' || 
    normStatus === 'out_for_delivery' ||
    rawInternal === 'DISPATCHED' ||
    order?.statusHistory?.some((h: any) => ['DISPATCHED', 'SHIPPED', 'PICKED_UP'].includes((h?.status || '').toUpperCase()))
  );

  // If not completed, not cancelled, not dispatched, and not yet being baked, the order is PENDING admin approval
  const isPending = !isCancelled && !isCompleted && !isDispatched && !isBeingBaked;
  const isPreDispatch = isBeingBaked;

  const trackingState = useLiveTracking(id, isDispatched && !isLoading);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.recenter();
    }
  };

  const handleSupportWhatsApp = () => {
    const rawNumber = import.meta.env.VITE_SUPPORT_WHATSAPP || '919876543210';
    const cleanNumber = String(rawNumber).replace(/[^0-9]/g, '');
    const orderNum = ((order?.orderNumber || order?.id || id) as string || '').replace(/^#/, '');
    const message = encodeURIComponent(
      orderNum 
        ? `Hi CakePopRush Team, I need help regarding my Order #${orderNum}.`
        : `Hi CakePopRush Team, I need help regarding my order.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const googleMapsUrl = React.useMemo(() => {
    const hasCustomerCoords = typeof trackingState.customer?.latitude === 'number' && !isNaN(trackingState.customer.latitude);
    const hasRiderCoords = typeof trackingState.rider?.latitude === 'number' && !isNaN(trackingState.rider.latitude);

    if (hasRiderCoords && hasCustomerCoords) {
      return `https://www.google.com/maps/dir/?api=1&origin=${trackingState.rider!.latitude},${trackingState.rider!.longitude}&destination=${trackingState.customer!.latitude},${trackingState.customer!.longitude}&travelmode=driving`;
    }
    if (hasCustomerCoords) {
      return `https://www.google.com/maps/search/?api=1&query=${trackingState.customer!.latitude},${trackingState.customer!.longitude}`;
    }
    const rawAddr = formatAddress(order, trackingState.destinationAddress);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawAddr)}`;
  }, [trackingState.customer?.latitude, trackingState.customer?.longitude, trackingState.rider?.latitude, trackingState.rider?.longitude, order, trackingState.destinationAddress]);


  const currentAgent = trackingState.agent || order?.agent || (typeof order?.delivery?.agentId === 'object' ? order?.delivery?.agentId : null);

  // Map live tracking status to a simplified 4-step flow
  let currentStepIndex = 0;
  if (isCompleted) currentStepIndex = 3;
  else if (isDispatched) currentStepIndex = 2;
  else if (isBeingBaked) currentStepIndex = 1;
  else currentStepIndex = 0;
  
  const liveTrackingSteps = [
    { status: 'confirmed', label: isPending ? 'Pending' : 'Order Confirmed', Icon: isPending ? Clock : FileText, color: '#F59E0B' },
    { status: 'preparing', label: 'Being Baked', Icon: ChefHat, color: '#F20D6F' },
    { status: 'shipped', label: 'Dispatched', Icon: Truck, color: '#06B6D4' },
    { status: 'delivered', label: 'Delivered', Icon: PackageCheck, color: '#10B981' }
  ];

  return (
    <div className={styles.page}>
      
      {/* Map / Delivered / Pre-Dispatch / Pending Image Section (Full Viewport) */}
      <div className={styles.mapContainer}>
        {isCancelled ? (
          <div className={styles.cancelledBackground}>
            <motion.img
              src="/cancelled-order-map.png"
              alt="Cancelled Order Map Location"
              className={styles.cancelledMapImage}
              initial={{ scale: 1.0, opacity: 0.85 }}
              animate={{
                scale: isSheetExpanded ? 1.0 : 1.04,
                opacity: 0.95,
              }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 220,
                mass: 0.8,
              }}
            />
            <div className={styles.cancelledAmbientGlow} />
          </div>
        ) : isPending ? (
          <div className={styles.pendingBackground}>
            <motion.img
              src="/Pre-Dispatch Store Location Map.png"
              alt="Order Placed - Awaiting Bakery Confirmation"
              className={styles.pendingMapImage}
              initial={{ scale: 1.05, opacity: 0.85, x: 75 }}
              animate={{
                scale: isSheetExpanded ? 1.0 : 1.08,
                opacity: 0.92,
                x: isSheetExpanded ? 25 : 75,
              }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 220,
                mass: 0.8,
              }}
            />
            <div className={styles.pendingAmbientGlow} />
          </div>
        ) : isCompleted ? (
          <motion.img
            src="/Delivered Pic.png"
            alt="Order Delivered Successfully"
            className={styles.deliveredBgImage}
            initial={false}
            animate={{
              scale: isSheetExpanded ? 1.0 : 1.15,
              y: isSheetExpanded ? -10 : 0,
              x: isSheetExpanded ? 15 : 45,
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 220,
              mass: 0.8,
            }}
          />
        ) : isBeingBaked ? (
          <motion.img
            src="/Pre-Dispatch Store Location Map.png"
            alt="Order Preparing at Store - Being Baked"
            className={`${styles.deliveredBgImage} ${styles.pendingMapImage}`}
            initial={{ scale: 1.08, opacity: 0.85, x: 75 }}
            animate={{
              scale: isSheetExpanded ? 1.0 : 1.15,
              opacity: 1,
              x: isSheetExpanded ? 25 : 75,
              y: isSheetExpanded ? -10 : 0,
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 220,
              mass: 0.8,
            }}
          />
        ) : isLoading ? (
          <div className={styles.cancelledBackground} style={{ background: '#FFF5F8' }}>
            <div className={styles.cancelledAmbientGlow} />
          </div>
        ) : (
          <DeliveryMap state={trackingState} isSheetExpanded={isSheetExpanded} isFullMap={isFullMap} ref={mapRef} />
        )}
      </div>

      {/* Map UI Overlay Wrapper (Constrained width on desktop) */}
      <div 
        className={styles.mapOverlayWrapper}
        style={{
          '--sheet-collapsed-peek': isFullMap
            ? '58px'
            : isDesktop
            ? '33vh'
            : '37vh',
        } as React.CSSProperties}
      >
        {/* Header (Overlay on map) with sleek entrance animation */}
        <motion.header
          className={styles.header}
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/orders" className={styles.backBtn} aria-label="Go back" title="Back to Orders">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </Link>
            <div className={styles.headerTitleBox}>
              <h1 className={styles.headerOrderNumber}>
                Order #{((order?.orderNumber || order?.id || id) as string).replace(/^#/, '')}
              </h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.backBtn} 
              aria-label="Open in Google Maps" 
              title="Open in Google Maps"
            >
              <MapPin size={17} strokeWidth={2.4} style={{ color: '#EA4335' }} />
            </a>
            <button 
              className={styles.helpBtn} 
              onClick={handleSupportWhatsApp}
              aria-label="Contact support on WhatsApp"
              title="Contact Support on WhatsApp"
            >
              <HelpCircle size={15} /> Support
            </button>
          </div>
        </motion.header>

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
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.25)',
                zIndex: 10,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            />
          )}
        </AnimatePresence>

        {/* Floating ETA Card - Shown ONLY during active live delivery tracking */}
        <AnimatePresence>
          {!isSheetExpanded && !isLoading && !isCancelled && !isCompleted && !isPending && !isBeingBaked && (
            <motion.div
              key="etaCard"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.18 }}
              className={styles.etaCard}
            >
              {!trackingState.eta ? (
                <>
                  <div className={styles.etaLabel}>
                    <Clock size={14} style={{ opacity: 0.5 }} /> <span style={{ opacity: 0.5 }}>Calculating...</span>
                  </div>
                  <div className={`${styles.etaSkeletonTime} ${styles.skeletonShimmer}`} />
                  <div className={`${styles.etaSkeletonStatus} ${styles.skeletonShimmer}`} />
                </>
              ) : (
                <>
                  <div className={styles.etaLabel}>
                    <Clock size={14} /> Arriving in
                  </div>
                  <div className={styles.etaTime}>
                    {`${trackingState.eta?.minMinutes}-${trackingState.eta?.maxMinutes} min`}
                    {trackingState.route?.distanceFormatted && (
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary, #F20D6F)', marginLeft: '8px' }}>
                        ({trackingState.route.distanceFormatted})
                      </span>
                    )}
                  </div>
                  <div className={styles.liveTrackingStatus} style={{ color: trackingState.isLive ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    <div className={styles.pulseDot} /> 
                    <span>{trackingState.isLive ? 'Live tracking active' : 'Location updating...'}</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Actions: Call & Recenter GPS - Hidden when sheet expands, completed, pre-dispatch, pending, cancelled, or loading */}
        <AnimatePresence>
          {!isSheetExpanded && !isCompleted && !isBeingBaked && !isPending && !isCancelled && !isLoading && (
            <motion.div
              key="mapControls"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              <div className={styles.mapActionFabs}>
                <button
                  type="button"
                  className={styles.mapFab}
                  onClick={() => {
                    const phone = currentAgent?.phone;
                    if (phone) {
                      window.location.href = `tel:${phone.replace(/ /g, '')}`;
                    } else {
                      alert('Delivery partner contact is not available.');
                    }
                  }}
                  title="Call Delivery Agent"
                  aria-label="Call Delivery Agent"
                >
                  <Phone size={16} />
                </button>
              </div>

              <button
                type="button"
                className={styles.fullMapBtn}
                onClick={() => {
                  if (isSheetExpanded) setIsSheetExpanded(false);
                  setIsFullMap((prev) => !prev);
                }}
                title={isFullMap ? "Restore normal view" : "Expand to full map"}
                aria-label={isFullMap ? "Restore normal view" : "Expand to full map"}
              >
                {isFullMap ? (
                  <>
                    <Minimize2 size={14} /> Normal View
                  </>
                ) : (
                  <>
                    <Maximize2 size={14} /> Full Map
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles.recenterBtn}
                onClick={handleRecenter}
              >
                <Navigation size={14} /> Recenter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Sheet */}
      <motion.div 
        className={`${styles.bottomSheet} ${(isCancelled || isPending || isCompleted) ? styles.bottomSheetCancelled : ''}`}
        initial={{ y: (isCancelled || isPending || isCompleted) ? '35vh' : '65vh', opacity: 0 }}
        style={{ 
          height: '85vh',
        }}
        animate={{ 
          y: isSheetExpanded 
            ? ((isCancelled || isPending || isCompleted) ? 44 : 0) 
            : isFullMap
            ? 'calc(85vh - 58px)'
            : ((isCancelled || isPending || isCompleted) ? (isDesktop ? '44vh' : '32vh') : (isDesktop ? '52vh' : '48vh')), 
          opacity: 1 
        }}
        transition={{ type: 'spring', damping: 32, stiffness: 300, mass: 0.8 }}
        onTouchStart={(e) => {
          touchStartYRef.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const currentY = e.changedTouches[0].clientY;
          const diffY = touchStartYRef.current - currentY;
          const el = scrollContainerRef.current;
          const atTop = !el || el.scrollTop <= 5;

          if (isFullMap) {
            if (diffY > 15) setIsFullMap(false);
            return;
          }

          if (!isSheetExpanded) {
            if (diffY > 20) {
              setIsSheetExpanded(true);
            } else if (diffY < -20) {
              setIsFullMap(true);
            }
            return;
          }

          if (isSheetExpanded && atTop && diffY < -30) {
            setIsSheetExpanded(false);
          }
        }}
        onWheel={(e) => {
          const el = scrollContainerRef.current;
          const atTop = !el || el.scrollTop <= 5;

          if (isFullMap) {
            if (e.deltaY < -10) setIsFullMap(false);
          } else if (!isSheetExpanded) {
            if (e.deltaY > 15) setIsSheetExpanded(true);
            else if (e.deltaY < -15) setIsFullMap(true);
          } else if (isSheetExpanded && atTop && e.deltaY < -25) {
            setIsSheetExpanded(false);
          }
        }}
      >
        {isPending ? (
          <PendingMascotSection isSheetExpanded={isSheetExpanded} />
        ) : isCompleted ? (
          <DeliveredMascotSection isSheetExpanded={isSheetExpanded} />
        ) : isCancelled ? (
          <div style={{ pointerEvents: 'auto' }}>
            {/* Speech Bubble Floating Above Mascot */}
            <div 
              className={styles.speechBubbleCornerAnchor}
              style={{ 
                opacity: isSheetExpanded ? 0 : 1, 
                pointerEvents: isSheetExpanded ? 'none' : 'auto',
                transition: 'opacity 0.25s ease' 
              }}
            >
              <div className={`${styles.speechBubble} ${styles.cancelledSpeechBubble}`}>
                <span>I'm so sorry!</span>
              </div>
            </div>

            {/* Mascot Peeking Behind Top Rim of the Pull-Over Sheet */}
            <motion.div 
              className={styles.mascotStickyContainer}
              style={{ x: '-50%' }}
            >
              <CakePopMascot
                size="medium"
                hideArms={true}
                reaction="cryingFountain"
              />
            </motion.div>
            <div className={styles.mascotHandLeft} style={{ transform: 'rotate(-10deg)' }} />
            <div className={styles.mascotHandRight} style={{ transform: 'rotate(10deg)' }} />
          </div>
        ) : null}

        <div 
          className={`${styles.dragHandleArea} ${isFullMap ? styles.dragHandleAreaFullMap : ''}`} 
          onClick={() => {
            if (isFullMap) {
              setIsFullMap(false);
            } else {
              setIsSheetExpanded((prev) => !prev);
            }
          }}
          style={{ touchAction: 'none' }}
          title={isSheetExpanded ? 'Tap to collapse' : isFullMap ? 'Tap to restore' : 'Tap to expand'}
        >
          <div className={styles.dragHandle} />
          {isFullMap && (
            <div className={styles.fullMapSheetHint}>
              <ChevronUp size={13} />
              <span>Tap to restore order details</span>
            </div>
          )}
        </div>

        <div 
          ref={scrollContainerRef}
          className={`${styles.scrollContent} ${!isSheetExpanded ? styles.scrollContentCollapsed : ''}`}
        >
          <div className={styles.trackingLayout}>
          {/* Left / Top: Timeline & Driver */}
          <div>
            {/* Main Status Title */}
            {isCancelled ? (
              <h2 className={styles.mainStatusTitle} onClick={() => { if (isFullMap) setIsFullMap(false); else setIsSheetExpanded((prev) => !prev); }} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
                  <XCircle size={24} color="#DC2626" /> Order Cancelled
                </span>
              </h2>
            ) : isCompleted ? (
              <h2 className={styles.mainStatusTitle} onClick={() => { if (isFullMap) setIsFullMap(false); else setIsSheetExpanded((prev) => !prev); }} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                  <CheckCircle2 size={24} color="#059669" /> Order Delivered Successfully!
                </span>
              </h2>
            ) : isPending ? (
              <h2 className={styles.mainStatusTitle} onClick={() => { if (isFullMap) setIsFullMap(false); else setIsSheetExpanded((prev) => !prev); }} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
                  <Clock size={22} color="#D97706" style={{ flexShrink: 0 }} /> Order Awaiting Confirmation
                </span>
              </h2>
            ) : isBeingBaked ? (
              <h2 className={styles.mainStatusTitle} onClick={() => { if (isFullMap) setIsFullMap(false); else setIsSheetExpanded((prev) => !prev); }} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
                  <ChefHat size={24} color="#D97706" /> Order is Being Prepared
                </span>
              </h2>
            ) : isLoading ? (
              <div className={`${styles.mainStatusSkeleton} ${styles.skeletonShimmer}`} />
            ) : (
              <h2 
                className={styles.mainStatusTitle}
                onClick={() => {
                  if (isFullMap) setIsFullMap(false);
                  else setIsSheetExpanded((prev) => !prev);
                }}
                style={{ cursor: 'pointer' }}
                title={isSheetExpanded ? 'Tap to collapse' : 'Tap to expand'}
              >
                Your treat is on the way!
              </h2>
            )}

            {/* Driver / Kitchen Info / Cancellation */}
            {isCancelled ? (
              <div className={styles.driverInfoRow} style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '14px', padding: '14px 16px' }}>
                <div className={styles.driverAvatar} style={{ background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <AlertCircle size={22} color="#DC2626" />
                </div>
                <div className={styles.driverDetails}>
                  <h4 className={styles.driverNameTitle} style={{ color: '#991B1B' }}>
                    Order Has Been Cancelled
                  </h4>
                  <div className={styles.driverStats}>
                    <span style={{ fontSize: '13px', color: '#7F1D1D', lineHeight: 1.4 }}>
                      {order?.cancellationReason || order?.cancelReason || order?.cancellation?.reason || 'We are really sorry for the cancellation! Any amount paid has been refunded to your original payment method.'}
                    </span>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className={styles.driverInfoRow}>
                <div className={`${styles.driverAvatarSkeleton} ${styles.skeletonShimmer}`} />
                <div className={styles.driverDetails} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className={`${styles.driverNameSkeleton} ${styles.skeletonShimmer}`} />
                  <div className={`${styles.driverStatsSkeleton} ${styles.skeletonShimmer}`} />
                </div>
              </div>
            ) : isPending ? (
              <div className={styles.driverInfoRow} style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '14px', padding: '14px 16px' }}>
                <div className={styles.driverAvatar} style={{ background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <Clock size={22} color="#D97706" />
                </div>
                <div className={styles.driverDetails}>
                  <h4 className={styles.driverNameTitle} style={{ color: '#92400E' }}>Bakery Kitchen (CakePopRush)</h4>
                  <div className={styles.driverStats}>
                    <span style={{ fontSize: '13px', color: '#B45309' }}>
                      Your order is queued! The bakery team will confirm and start baking shortly.
                    </span>
                  </div>
                </div>
              </div>
            ) : isBeingBaked ? (
              <div className={styles.driverInfoRow}>
                <div className={styles.driverAvatar} style={{ background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <ChefHat size={22} color="#F20D6F" />
                </div>
                <div className={styles.driverDetails}>
                  <h4 className={styles.driverNameTitle}>Bakery Kitchen (CakePopRush)</h4>
                  <div className={styles.driverStats}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      Order is freshly baking. Delivery partner will be assigned upon dispatch.
                    </span>
                  </div>
                </div>
              </div>
            ) : currentAgent?.name ? (
              <div className={styles.driverInfoRow}>
                <div className={styles.driverAvatar}>
                  <img 
                    src={currentAgent.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(currentAgent.name)}&backgroundColor=F59E0B`} 
                    alt={currentAgent.name} 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentAgent.name)}&background=F59E0B&color=fff` }} 
                  />
                </div>
                <div className={styles.driverDetails}>
                  <h4 className={styles.driverNameTitle}>
                    {isCompleted
                      ? `${currentAgent.name} delivered your order`
                      : `${currentAgent.name} is delivering your order`}
                  </h4>
                  <div className={styles.driverStats}>
                    {currentAgent.phone && (
                      <div className={styles.statRow}>
                        {currentAgent.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.driverActions}>
                  {currentAgent.phone ? (
                    <>
                      <a 
                        href={`tel:${currentAgent.phone.replace(/ /g, '')}`} 
                        className={styles.iconBtn} 
                        title={`Call ${currentAgent.name}`}
                        aria-label={`Call ${currentAgent.name}`}
                      >
                        <Phone size={18} />
                      </a>
                      <a 
                        href={`https://wa.me/${currentAgent.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className={styles.iconBtn} 
                        title={`Chat with ${currentAgent.name}`}
                        aria-label={`Chat with ${currentAgent.name}`}
                      >
                        <MessageCircle size={18} />
                      </a>
                    </>
                  ) : (
                    <button className={styles.iconBtn} onClick={() => alert('Delivery partner contact is not available.')} title="Contact Partner">
                      <Phone size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.driverInfoRow}>
                <div className={styles.driverAvatar} style={{ background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <Truck size={22} color="#0284C7" />
                </div>
                <div className={styles.driverDetails}>
                  <h4 className={styles.driverNameTitle}>Delivery Partner</h4>
                  <div className={styles.driverStats}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      Assigned and on the way to deliver your order.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Status Timeline Box */}
            <div className={styles.statusBox}>
              <div className={styles.statusBoxHeader}>
                <div className={styles.deliveryAddressContainer}>
                  <span className={styles.deliveryLabel}>{isCancelled ? 'Destination Address' : 'Delivering to'}</span>
                  {isLoading ? (
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className={`${styles.addressSkeletonLine} ${styles.skeletonShimmer}`} style={{ width: '85%' }} />
                      <div className={`${styles.addressSkeletonLine} ${styles.skeletonShimmer}`} style={{ width: '55%' }} />
                    </div>
                  ) : (
                    <>
                      <span className={styles.deliveryAddress}>
                        {formatAddress(order, trackingState.destinationAddress)}
                      </span>
                      {trackingState.route?.distanceFormatted && isDispatched && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#0284C7', marginTop: '4px' }}>
                          <Truck size={13} /> Distance to destination: {trackingState.route.distanceFormatted}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className={styles.statusBoxBody} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isCancelled ? (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <XCircle size={18} color="#DC2626" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>Cancelled & Closed</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>This order will not be baked or dispatched</div>
                    </div>
                  </div>
                ) : isLoading ? (
                  <>
                    <div className={`${styles.timelineSkeletonBar} ${styles.skeletonShimmer}`} style={{ flex: 1 }} />
                    <div className={`${styles.badgeSkeleton} ${styles.skeletonShimmer}`} style={{ marginLeft: '16px' }} />
                  </>
                ) : (
                  <>
                    <div className={styles.timeline} style={{ flex: 1 }}>
                      {liveTrackingSteps.map((step, index: number) => {
                        const isStepCompleted = !isPending && index <= currentStepIndex;
                        const isStepCurrent = index === currentStepIndex;

                        return (
                          <div key={step.status} className={`${styles.timelineStep} ${isStepCurrent ? styles.currentStep : isStepCompleted ? styles.completedStep : styles.upcomingStep}`}>
                            <div className={styles.stepIndicator}>
                              <div
                                className={`${styles.stepIcon} ${isStepCurrent ? styles.currentIcon : isStepCompleted ? styles.completedIcon : styles.upcomingIcon}`}
                                style={isStepCompleted || isStepCurrent ? { background: step.color, color: 'white', boxShadow: isStepCurrent ? `0 0 0 4px ${step.color}33` : 'none' } : {}}
                                aria-label={`${step.label}: ${isStepCompleted ? 'completed' : isStepCurrent ? 'current' : 'upcoming'}`}
                              >
                                {isStepCompleted ? <Check size={10} strokeWidth={3} /> : <step.Icon size={isStepCurrent ? 14 : 10} />}
                              </div>
                              {index < liveTrackingSteps.length - 1 && (
                                <div
                                  className={styles.stepConnector}
                                  style={isStepCompleted ? { background: step.color } : {}}
                                />
                              )}
                            </div>
                            <div className={styles.stepContent}>
                              <h4 className={styles.stepLabel} style={isStepCurrent ? { color: step.color } : {}}>{step.label}</h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* OTP or Delivered / Being Baked / Pending Status Badge */}
                    {isCompleted ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ECFDF5', padding: '14px 18px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                        <span style={{ fontSize: '10px', color: '#047857', fontWeight: 700, letterSpacing: '0.5px' }}>DELIVERY STATUS</span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#065F46', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={16} strokeWidth={3} /> Delivered
                        </span>
                      </div>
                    ) : isDispatched ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#F8F9FA', padding: '16px 20px', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>DELIVERY OTP</span>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-chocolate)', letterSpacing: '4px', marginTop: '4px', fontFamily: 'monospace' }}>
                          {trackingState.deliveryOtp || (order as any)?.deliveryOtp || (order as any)?.delivery?.customerOtp || '------'}
                        </span>
                      </div>
                    ) : isBeingBaked ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFF1F2', padding: '14px 18px', borderRadius: '12px', border: '1px solid #FECDD3' }}>
                        <span style={{ fontSize: '10px', color: '#BE123C', fontWeight: 700, letterSpacing: '0.5px' }}>ORDER STATUS</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#9F1239', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ChefHat size={15} strokeWidth={2.5} /> Baking
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFBEB', padding: '14px 18px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                        <span style={{ fontSize: '10px', color: '#B45309', fontWeight: 700, letterSpacing: '0.5px' }}>ORDER STATUS</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#92400E', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={15} strokeWidth={2.5} /> Pending
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Order Items Box */}
            <div className={styles.statusBox} style={{ marginTop: '16px' }}>
              <div className={styles.statusBoxHeader} style={{ padding: '12px 16px 4px' }}>
                <div className={styles.statusBoxHeaderLeft}>
                  <h2 className={styles.statusBoxTitle} style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                    ORDER ITEMS {order?.items?.length ? `(${order.items.length} ${order.items.length === 1 ? 'PRODUCT' : 'PRODUCTS'})` : ''}
                  </h2>
                </div>
              </div>
              <div className={styles.statusBoxBody} style={{ padding: '0 16px 8px' }}>
                {isLoading ? (
                  [1, 2].map((i) => (
                    <div key={i} className={styles.itemCard} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                      <div className={`${styles.itemSkeletonImg} ${styles.skeletonShimmer}`} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className={`${styles.itemSkeletonTitle} ${styles.skeletonShimmer}`} />
                        <div className={`${styles.itemSkeletonSub} ${styles.skeletonShimmer}`} />
                      </div>
                      <div className={`${styles.itemSkeletonPrice} ${styles.skeletonShimmer}`} />
                    </div>
                  ))
                ) : (
                  order?.items?.map((item: any, idx: number) => {
                    const itemName = item.name || item.title || 'Cake Pop';
                    const itemQty = item.qty || item.quantity || 1;
                    const itemPrice = item.unitPrice || item.price || 0;
                    const itemSub = item.subtotal || (itemPrice * itemQty);
                    return (
                      <div key={item.id || item._id || idx} className={styles.itemCard}>
                        <div className={styles.itemIcon}>
                          {item.image ? (
                            <img src={item.image} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = itemName.charAt(0) }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#9CA3AF', fontSize: '16px', fontWeight: 'bold' }}>
                              {itemName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className={styles.itemDetails}>
                          <span className={styles.itemName}>{itemName}</span>
                          {item.variant && <span className={styles.itemMeta}>{item.variant}</span>}
                          <span className={styles.itemQty}>Qty: {itemQty} × Rs.{itemPrice}</span>
                        </div>
                        <div className={styles.itemPriceCol}>
                          <span className={styles.itemSubtotal}>Rs.{itemSub}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Price Details Box */}
            <div className={styles.statusBox} style={{ marginTop: '16px' }}>
              <div className={styles.statusBoxHeader} style={{ padding: '12px 16px 8px', borderBottom: '1px solid #E2E8F0' }}>
                <div className={styles.statusBoxHeaderLeft}>
                  <h2 className={styles.statusBoxTitle} style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>PRICE DETAILS</h2>
                </div>
              </div>
              <div className={styles.statusBoxBody} style={{ padding: '8px 16px 16px' }}>
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className={styles.skeletonShimmer} style={{ width: '80px', height: '14px' }} />
                      <div className={styles.skeletonShimmer} style={{ width: '45px', height: '14px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className={styles.skeletonShimmer} style={{ width: '70px', height: '14px' }} />
                      <div className={styles.skeletonShimmer} style={{ width: '40px', height: '14px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #F3F4F6' }}>
                      <div className={styles.skeletonShimmer} style={{ width: '90px', height: '16px' }} />
                      <div className={styles.skeletonShimmer} style={{ width: '60px', height: '16px' }} />
                    </div>
                  </div>
                ) : order && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                      <span>Item Subtotal</span>
                      <span style={{ fontWeight: 600 }}>Rs.{order.price?.itemSubtotal ?? order.pricing?.subtotal ?? order.subtotal ?? 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                      <span>Delivery Fee</span>
                      <span style={{ fontWeight: 600 }}>Rs.{order.price?.deliveryFee ?? order.pricing?.deliveryFee ?? 0}</span>
                    </div>
                    {(Number(order.price?.packagingFee || order.pricing?.packagingFee || 0) > 0) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                        <span>Packaging Fee</span>
                        <span style={{ fontWeight: 600 }}>Rs.{order.price?.packagingFee || order.pricing?.packagingFee}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                      <span>Taxes</span>
                      <span style={{ fontWeight: 600 }}>Rs.{order.price?.taxes ?? order.pricing?.tax ?? 0}</span>
                    </div>
                    {(Number(order.price?.couponDiscount || order.pricing?.discount || 0) > 0) && (
                      <div className={styles.discountRow}>
                        <span>Total Savings</span>
                        <span>-Rs.{order.price?.couponDiscount || order.pricing?.discount}</span>
                      </div>
                    )}
                    <div className={styles.totalRow}>
                      <span>Amount Paid</span>
                      <span>Rs.{order.price?.amountPaid ?? order.pricing?.finalTotal ?? order.total ?? 0}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right / Bottom: Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Order Details Accordion */}
            <div ref={accordionRef} className={styles.orderDetailsCard} style={{ marginTop: 0, borderRadius: '12px', border: '1px solid #CBD5E1', boxShadow: 'none' }}>
              <button 
                className={styles.orderDetailsHeader}
                onClick={() => {
                  const willOpen = !orderDetailsOpen;
                  setOrderDetailsOpen(willOpen);
                  if (!isSheetExpanded) {
                    setIsSheetExpanded(true);
                  }
                  if (willOpen) {
                    setTimeout(() => {
                      accordionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 200);
                  }
                }}
                style={{ padding: '12px 16px', borderBottom: orderDetailsOpen ? '1px solid #E2E8F0' : 'none' }}
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
                              <span style={{ fontWeight: 600 }}>{order.payment?.method || order.paymentMethod || 'Online'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Provider</span>
                              <span style={{ fontWeight: 600 }}>{order.payment?.provider || order.payment?.method || (order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Razorpay')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Status</span>
                              <span style={{ fontWeight: 600, color: isCancelled ? '#DC2626' : 'var(--color-success)' }}>
                                {isCancelled ? 'CANCELLED / REFUNDED' : (order.payment?.status || order.paymentStatus || 'PAID').toUpperCase()}
                              </span>
                            </div>
                            {(order.payment?.transactionId || order.payment?.paymentId || order.razorpayPaymentId) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                                <span>Transaction ID</span>
                                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{order.payment?.transactionId || order.payment?.paymentId || order.razorpayPaymentId}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Date</span>
                              <span style={{ fontWeight: 600 }}>{order.payment?.date || order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Amount</span>
                              <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Rs.{order.payment?.amount || order.price?.amountPaid || order.pricing?.finalTotal || order.total || 0}</span>
                            </div>
                          </div>
    
                          <div className={styles.subSection}>
                            <h4 className={styles.subSectionTitle}>Customer Information</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Name</span>
                              <span style={{ fontWeight: 600 }}>{order.address?.recipientName || (typeof order.customer === 'object' ? order.customer?.name : order.customer) || order.customerName || 'Valued Customer'}</span>
                            </div>
                            {((typeof order.customer === 'object' && order.customer?.email) || order.email) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                                <span>Email</span>
                                <span style={{ fontWeight: 600 }}>{(typeof order.customer === 'object' ? order.customer?.email : order.email)}</span>
                              </div>
                            )}
                            {(order.address?.phone || (typeof order.customer === 'object' && order.customer?.phone) || order.phone) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                                <span>Phone</span>
                                <span style={{ fontWeight: 600 }}>{order.address?.phone || (typeof order.customer === 'object' ? order.customer?.phone : '') || order.phone}</span>
                              </div>
                            )}
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
                              <span style={{ fontWeight: 600 }}>INV-{((order.orderNumber || order.id || id) as string).replace(/^#/, '')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Invoice Date</span>
                              <span style={{ fontWeight: 600 }}>{order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: 'var(--color-chocolate)' }}>
                              <span>Billing Name</span>
                              <span style={{ fontWeight: 600 }}>{order.address?.recipientName || (typeof order.customer === 'object' ? order.customer?.name : order.customer) || order.customerName || 'Valued Customer'}</span>
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
        </div>

      </motion.div>
      </div>
      
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
