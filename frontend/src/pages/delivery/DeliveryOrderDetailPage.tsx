import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Check,
  Share2,
  Store,
  Star,
  Bike,
  Sparkles,
  Loader2,
  FileText,
  ChefHat,
  Truck,
  PackageCheck,
  ArrowLeft,
  RefreshCw,
  X,
  XCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Link, useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import styles from './DeliveryOrderDetailPage.module.css';
import { DeliveryMap, DeliveryMapRef } from '@/pages/storefront/orders/components/DeliveryMap';
import { useLiveTracking } from '@/pages/storefront/orders/hooks/useLiveTracking';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import deliveryAgentService, { AssignedOrder } from '@/services/api/deliveryAgentService';
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer';
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper';
import { DeliveryOrderDetailSkeleton } from './components/DeliveryOrderDetailSkeleton';
import { OtpSuccessCelebration } from './components/OtpSuccessCelebration';
import { CakePopMascot } from '@/components/mascot';

const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  prod_cp_01: '/images/Products/Dark choclate cakepops.jpeg',
  prod_cp_02: '/images/Products/Red velvet cookies.jpeg',
  prod_cp_03: '/images/Products/mini valentine cake.jpeg',
  prod_cp_04: '/images/Products/asorted flavours of cookies.jpeg',
  prod_cp_05: '/images/Products/mini valentine cake.jpeg',
  prod_cp_06: '/images/Products/Milk choclate cakepops.jpeg',
  prod_cp_07: '/images/Products/White choclate cakepops.jpeg',
  'Strawberry Cream Frosting Pops': '/images/Products/mini valentine cake.jpeg',
  'Assorted Party Box (12 Pieces)': '/images/Products/asorted flavours of cookies.jpeg',
  'Classic Vanilla Bean Pops (Pack of 6)': '/images/Products/White choclate cakepops.jpeg',
  'Salted Caramel Drizzle Pops': '/images/Products/Milk choclate cakepops.jpeg',
  'Belgian Dark Chocolate Cake Pops': '/images/Products/Dark choclate cakepops.jpeg',
  'Red Velvet Swirl Pops': '/images/Products/Red velvet cookies.jpeg',
  'Sparkle Birthday Birthday Bouquet': '/images/Products/mini valentine cake.jpeg',
};

function getProductImage(item?: { image?: string; imageSrc?: string; productId?: string; name?: string }): string {
  if (item?.image) return item.image;
  if (item?.imageSrc) return item.imageSrc;
  if ((item as any)?.productImage) return (item as any).productImage;
  if (item?.productId && PRODUCT_IMAGE_FALLBACKS[item.productId]) return PRODUCT_IMAGE_FALLBACKS[item.productId];
  if (item?.name && PRODUCT_IMAGE_FALLBACKS[item.name]) return PRODUCT_IMAGE_FALLBACKS[item.name];
  if (item?.name) {
    const lower = item.name.toLowerCase();
    for (const [key, val] of Object.entries(PRODUCT_IMAGE_FALLBACKS)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        return val;
      }
    }
    if (lower.includes('dark') || lower.includes('belgian')) return '/images/Products/Dark choclate cakepops.jpeg';
    if (lower.includes('red velvet')) return '/images/Products/Red velvet cookies.jpeg';
    if (lower.includes('cookie') || lower.includes('party box')) return '/images/Products/asorted flavours of cookies.jpeg';
    if (lower.includes('brownie')) return '/images/Products/Chocolate biscoff brownie.jpeg';
    if (lower.includes('cupcake')) return '/images/Products/chocolate chip cupcakes.jpeg';
    if (lower.includes('vanilla') || lower.includes('white')) return '/images/Products/White choclate cakepops.jpeg';
    if (lower.includes('caramel') || lower.includes('milk')) return '/images/Products/Milk choclate cakepops.jpeg';
    if (lower.includes('strawberry') || lower.includes('sparkle') || lower.includes('bouquet')) return '/images/Products/mini valentine cake.jpeg';
  }
  return '/images/Products/mini valentine cake.jpeg';
}

const TypingText = ({ text, speed = 45 }: { text: string; speed?: number }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <>{displayed}</>;
};

export function DeliveryOrderDetailPage() {
  const { id = 'CPR-10482' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const previewAgentId = searchParams.get('previewAgentId');
  const previewAgentName = searchParams.get('agentName');
  const userRole = user?.role?.toLowerCase() || '';
  const isDeliveryRole = userRole === 'delivery_agent' || userRole === 'delivery';
  const isAdminPreview = false;

  useEffect(() => {
    if (user && !isDeliveryRole) {
      showToast('Access Denied: Only registered Delivery Agents can access delivery details.', 'error');
      navigate(['admin', 'owner', 'super_admin', 'main_admin', 'editor', 'viewer'].includes(userRole) ? '/admin' : '/', { replace: true });
    }
  }, [user, isDeliveryRole, userRole, navigate, showToast]);

  const stateOrder = (location.state as any)?.order;
  const [order, setOrder] = useState<AssignedOrder | null>(() => {
    if (stateOrder && (stateOrder._id === id || stateOrder.orderNumber === id || stateOrder.orderNumber === `#${id}` || stateOrder.orderNumber === `CPR-${id}` || id === 'CPR-10482')) {
      return stateOrder;
    }
    return null;
  });
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(() => !stateOrder);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isFullMap, setIsFullMap] = useState(false);
  const [isCodCollected, setIsCodCollected] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isPickingUp, setIsPickingUp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isOtpDrawerOpen, setIsOtpDrawerOpen] = useState(false);
  const [customerAvatarError, setCustomerAvatarError] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mapRef = useRef<DeliveryMapRef>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const touchStartYRef = useRef(0);
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Fetch real assigned order data
  useEffect(() => {
    if (!id) return;
    if (!order) {
      setIsLoading(true);
    }

    deliveryAgentService
      .getOrderDetail(id, location.search)
      .then((liveOrder) => {
        if (liveOrder) {
          setOrder(liveOrder);
          setIsCodCollected(liveOrder?.delivery?.isCodCollected || false);
          if ((liveOrder as any)?.delivery?.customerOtp) {
            setDevOtp(String((liveOrder as any).delivery.customerOtp));
          }
        } else if (!stateOrder) {
          setOrder(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load assigned delivery order:', err);
        if (!stateOrder) {
          setOrder(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Load profile
    deliveryAgentService
      .getProfile(location.search)
      .then((p) => setProfile(p))
      .catch(() => setProfile(null));
  }, [id, location.search]);

  const trackingState = useLiveTracking(id);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.recenter();
    }
  };
  const previewAgentPhone = searchParams.get('agentPhone');

  // Agent Identity (THIS GUY - The Logged In Delivery Agent or Supervised Agent)
  const agentName = previewAgentName || profile?.name || user?.name || 'Partner';
  const agentPhone = previewAgentPhone || profile?.phone || user?.phone || '';
  const agentInitials = agentName
    .trim()
    .split(/\s+/)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const normStatus = (order?.status || order?.orderStatus || '').toLowerCase().trim();
  const rawInternalStatus = String((order as any)?.internalStatus || (order as any)?.delivery?.status || normStatus).toUpperCase();
  const isCancelled = normStatus.includes('cancel') || rawInternalStatus.includes('CANCEL') || (order as any)?.isCancelled;
  const isCompleted = !isCancelled && (normStatus === 'delivered' || normStatus === 'completed' || rawInternalStatus === 'DELIVERED');
  const isAssigned = !isCancelled && rawInternalStatus === 'ASSIGNED';
  const isAccepted = !isCancelled && (rawInternalStatus === 'AGENT_ACCEPTED' || rawInternalStatus === 'ACCEPTED');
  const isPreDispatch = !isCancelled && (
    normStatus === 'not dispatched' || 
    normStatus === 'pending' || 
    normStatus === 'confirmed' || 
    normStatus === 'being baked' ||
    normStatus === 'preparing' ||
    normStatus === 'ready_for_pickup' ||
    isAssigned ||
    isAccepted
  );
  const isDispatched = !isCancelled && !isCompleted && !isPreDispatch;
  // Dynamically resolve customer shipping/delivery address from all possible sources
  const rawAddr =
    order?.shippingAddress ||
    (order as any)?.address ||
    (order as any)?.delivery?.addressSnapshot ||
    {};

  const customerName =
    rawAddr.recipientName ||
    rawAddr.customerName ||
    order?.customerName ||
    'Customer';

  const customerPhone =
    rawAddr.phone ||
    order?.customerPhone ||
    (order as any)?.customer?.phone ||
    '';

  const customerEmail =
    order?.customerEmail ||
    rawAddr?.email ||
    (order as any)?.customer?.email ||
    (order as any)?.user?.email ||
    '';

  // Customer Avatar resolution: checks backend populated user/customer avatar, order customerAvatar, and address snapshot
  const resolvedCustomerAvatar =
    (order as any)?.customerAvatar ||
    (order as any)?.customer?.avatar ||
    (order as any)?.user?.avatar ||
    (order as any)?.shippingAddress?.avatar ||
    (order as any)?.delivery?.addressSnapshot?.avatar ||
    '';

  const isCustomerCurrentUser = Boolean(
    user && (
      (user.phone && customerPhone && user.phone.replace(/\D/g, '') === customerPhone.replace(/\D/g, '')) ||
      (user.email && customerEmail && user.email.toLowerCase() === customerEmail.toLowerCase()) ||
      (user.name && customerName && user.name.toLowerCase() === customerName.toLowerCase())
    )
  );

  const customerAvatar = resolvedCustomerAvatar || (isCustomerCurrentUser ? (user?.avatar || '') : '');

  const customerInitials = customerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CU';

  const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const palettes = [
      'linear-gradient(135deg, #F20D6F 0%, #FF5F88 100%)', // Brand Pink
      'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)', // Purple
      'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)', // Blue
      'linear-gradient(135deg, #059669 0%, #34D399 100%)', // Emerald
      'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)', // Amber
      'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)', // Rose
      'linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)', // Cyan
    ];
    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
  };

  const addressStreet =
    rawAddr.line1 ||
    rawAddr.street ||
    rawAddr.addressLine ||
    (typeof rawAddr === 'string' ? rawAddr : '') ||
    [rawAddr.houseNo, rawAddr.building].filter(Boolean).join(', ');

  const addressLine2 = rawAddr.line2 || rawAddr.area || '';
  const addressCity = rawAddr.city || '';
  const addressState = rawAddr.state || '';
  const addressPincode = rawAddr.pincode || rawAddr.zipCode || rawAddr.postalCode || '';
  const landmark = rawAddr.landmark || '';
  const deliveryInstructions =
    rawAddr.deliveryInstructions ||
    rawAddr.instructions ||
    (order as any)?.delivery?.instructions ||
    '';

  const addressTypeRaw = rawAddr.type ? String(rawAddr.type) : 'Home';
  const addressType = addressTypeRaw.charAt(0).toUpperCase() + addressTypeRaw.slice(1).toLowerCase();

  // Clean full formatted delivery address without hardcoded dummy addresses
  const fullDeliveryAddress = [
    addressStreet,
    addressLine2,
    [addressCity, addressState].filter(Boolean).join(', '),
    addressPincode ? `- ${addressPincode}` : '',
  ]
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*-/, ' -') || 'Delivery address on file';

  // Dynamic Floating Map Badge Info (ETA, Routing, & Live State)
  const etaBadgeConfig = (() => {
    if (isCancelled) {
      return {
        icon: <XCircle size={13} color="#DC2626" />,
        label: 'Order Cancelled',
        labelColor: '#DC2626',
        value: 'Cancelled',
        valueColor: '#DC2626',
        statusText: 'Task Cancelled',
        statusColor: '#DC2626',
        dotClass: styles.pulseDotRed,
      };
    }

    if (isCompleted) {
      return {
        icon: <CheckCircle2 size={13} color="#059669" />,
        label: 'Delivery Status',
        labelColor: '#059669',
        value: 'Delivered',
        valueColor: '#059669',
        statusText: 'Task Completed',
        statusColor: '#059669',
        dotClass: styles.pulseDot,
      };
    }

    if (isPreDispatch) {
      if (isAssigned) {
        return {
          icon: <AlertCircle size={13} color="#D97706" />,
          label: 'Order Assignment',
          labelColor: '#D97706',
          value: 'Accept Needed',
          valueColor: '#92400E',
          statusText: 'Awaiting Acceptance',
          statusColor: '#D97706',
          dotClass: styles.pulseDotAmber,
        };
      }
      return {
        icon: <Store size={13} color="#D97706" />,
        label: 'Bakery Pickup',
        labelColor: '#D97706',
        value: 'Ready for Pickup',
        valueColor: '#92400E',
        statusText: 'Proceed to Kitchen',
        statusColor: '#D97706',
        dotClass: styles.pulseDotAmber,
      };
    }

    // Actively Dispatched - En route to customer
    const durMins = trackingState.route?.durationSeconds
      ? Math.max(2, Math.round(trackingState.route.durationSeconds / 60))
      : (order as any)?.delivery?.estimatedMinutes || null;

    let etaDisplay = '10–15 min';
    if (trackingState.eta) {
      etaDisplay = `${trackingState.eta.minMinutes}–${trackingState.eta.maxMinutes} min`;
    } else if (durMins) {
      etaDisplay = `${durMins}–${durMins + 4} min`;
    }

    const distanceBadge = trackingState.route?.distanceFormatted ? (
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary, #F20D6F)', marginLeft: '6px' }}>
        ({trackingState.route.distanceFormatted})
      </span>
    ) : null;

    return {
      icon: <Clock size={13} color="#831843" />,
      label: 'Est. Arrival',
      labelColor: '#7A5E68',
      value: (
        <>
          <span>{etaDisplay}</span>
          {distanceBadge}
        </>
      ),
      valueColor: '#1F0E06',
      statusText: trackingState.isLive ? 'GPS Live Routing' : 'Live Tracking Active',
      statusColor: '#059669',
      dotClass: styles.pulseDot,
    };
  })();

  const destinationAddress = [
    addressStreet,
    addressLine2,
    addressCity,
    addressState,
    addressPincode,
  ]
    .filter(Boolean)
    .join(', ') || 'Local Delivery';

  // Google Maps navigation link
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    [destinationAddress, landmark].filter(Boolean).join(' ')
  )}`;

  // OTP Verification Code for backend validation
  const rawOtp =
    (order as any)?.deliveryOtp ||
    (order?.orderNumber
      ? order.orderNumber.replace(/\D/g, '').slice(-4)
      : order?._id
      ? order._id.replace(/\D/g, '').slice(-4)
      : '0482') ||
    '0482';

  // 4-Step Vertical Timeline (Exact Storefront Flow)
  const liveTrackingSteps = [
    { status: 'confirmed', label: 'Order Confirmed', Icon: FileText, color: '#F59E0B' },
    { status: 'preparing', label: 'Being Baked', Icon: ChefHat, color: '#EC4899' },
    { status: 'shipped', label: 'Dispatched', Icon: Truck, color: '#06B6D4' },
    { status: 'delivered', label: 'Delivered', Icon: PackageCheck, color: '#10B981' },
  ];
  const currentStepIndex = isCompleted ? 3 : isDispatched ? 2 : 1;

  const handleAcceptDelivery = async () => {
    if (!order?._id) return;
    setIsAccepting(true);
    try {
      if (order._id.startsWith('order_demo_')) {
        await new Promise((r) => setTimeout(r, 400));
        setOrder({
          ...order,
          internalStatus: 'AGENT_ACCEPTED',
          delivery: { ...order.delivery, status: 'AGENT_ACCEPTED' }
        });
        showToast('✓ Delivery task accepted! Proceed to bakery for pickup.', 'success');
        return;
      }
      await deliveryAgentService.acceptOrder(order._id, location.search);
      setOrder({
        ...order,
        internalStatus: 'AGENT_ACCEPTED',
        delivery: { ...order.delivery, status: 'AGENT_ACCEPTED' }
      });
      showToast('✓ Delivery task accepted! Proceed to bakery for pickup.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to accept delivery', 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!order?._id) return;
    setIsPickingUp(true);
    try {
      if (order._id.startsWith('order_demo_')) {
        await new Promise((r) => setTimeout(r, 400));
        setOrder({
          ...order,
          status: 'DISPATCHED',
          orderStatus: 'DISPATCHED',
          internalStatus: 'DISPATCHED',
          delivery: { ...order.delivery, status: 'DISPATCHED', pickedUpAt: new Date().toISOString() }
        });
        showToast('✓ Order picked up! Dispatched & live customer tracking active.', 'success');
        return;
      }
      const updated = await deliveryAgentService.pickupOrder(order._id, location.search);
      setOrder(updated);
      showToast('✓ Order picked up! Dispatched & live customer tracking active.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm pickup', 'error');
    } finally {
      setIsPickingUp(false);
    }
  };

  const handleSendOtp = async () => {
    if (!order?._id) return;
    setIsSendingOtp(true);
    try {
      if (order._id.startsWith('order_demo_')) {
        await new Promise((r) => setTimeout(r, 400));
        showToast('Demo 6-digit OTP code sent to customer phone: 482910', 'success');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs[0].current?.focus(), 150);
        return;
      }
      const res = await deliveryAgentService.sendDeliveryOtp(order._id, location.search);
      const newExpiresAt = (res as any)?.data?.expiresAt || (res as any)?.expiresAt;
      if (newExpiresAt && order) {
        setOrder({
          ...order,
          delivery: {
            ...order.delivery,
            otpExpiresAt: newExpiresAt,
          },
        });
      }
      setOtpDigits(['', '', '', '', '', '']);
      const newOtp = (res as any)?.data?.otp || (res as any)?.otp;
      if (newOtp) {
        setDevOtp(String(newOtp));
      }
      showToast(newOtp ? `✓ New OTP generated: ${newOtp}` : '✓ 6-digit verification code sent to customer phone', 'success');
      setTimeout(() => otpInputRefs[0].current?.focus(), 150);
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP code to customer', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Active GPS & Direction Orientation tracking while delivering
  useEffect(() => {
    const targetOrderId = order?._id || (order as any)?.id || id;
    if (!targetOrderId || targetOrderId === 'CPR-10482') return;
    if (order?.status !== 'DISPATCHED' && (order as any)?.internalStatus !== 'DISPATCHED') return;

    let lastSent = 0;
    let lastCoords: { latitude: number; longitude: number } | null = null;
    let currentHeading = 0;
    let lastHeadingSent = 0;

    const sendCoords = (latitude: number, longitude: number, heading?: number) => {
      lastCoords = { latitude, longitude };
      const h = typeof heading === 'number' ? heading : currentHeading;
      deliveryAgentService
        .updateLocation(targetOrderId, { latitude, longitude, heading: h }, location.search)
        .catch((err) => console.error('Failed to sync agent location:', err));
    };

    // Device orientation (compass) listener: rotates as the user rotates device
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compass = 0;
      if ((event as any).webkitCompassHeading) {
        // iOS Safari provides compass heading directly (0-360 deg)
        compass = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null && typeof event.alpha === 'number') {
        // Android compass heading
        compass = (360 - event.alpha) % 360;
      }
      compass = Math.round(compass);
      if (Math.abs(compass - currentHeading) >= 6) {
        currentHeading = compass;
        const now = Date.now();
        // Throttle heading updates when stationary to 1.5s
        if (lastCoords && now - lastHeadingSent >= 1500) {
          lastHeadingSent = now;
          sendCoords(lastCoords.latitude, lastCoords.longitude, currentHeading);
        }
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    // Immediate initial GPS fix
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lastSent = Date.now();
          const gpsH = typeof pos.coords.heading === 'number' && !isNaN(pos.coords.heading) && pos.coords.heading >= 0
            ? Math.round(pos.coords.heading)
            : currentHeading;
          sendCoords(pos.coords.latitude, pos.coords.longitude, gpsH);
        },
        (err) => console.warn('Initial geolocation note:', err.message),
        { enableHighAccuracy: true, timeout: 6000 }
      );

      // Continuous watch position as device moves
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - lastSent < 3000) return;
          lastSent = now;
          const gpsH = typeof position.coords.heading === 'number' && !isNaN(position.coords.heading) && position.coords.heading >= 0
            ? Math.round(position.coords.heading)
            : currentHeading;
          sendCoords(position.coords.latitude, position.coords.longitude, gpsH);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [order?._id, (order as any)?.id, id, order?.status, (order as any)?.internalStatus, location.search]);

  // OTP Handlers
  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const digit = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{4,6}$/.test(pasted)) {
      const chars = pasted.slice(0, 6).split('');
      const newDigits = ['', '', '', '', '', ''];
      chars.forEach((c, i) => {
        newDigits[i] = c;
      });
      setOtpDigits(newDigits);
      otpInputRefs[Math.min(chars.length, 5)].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      showToast('Please enter the full 6-digit customer verification OTP', 'error');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      if (order?._id.startsWith('order_demo_')) {
        await new Promise((r) => setTimeout(r, 600));
        setIsOtpSuccess(true);
        setTimeout(() => {
          if (order) {
            setOrder({
              ...order,
              status: 'DELIVERED',
              orderStatus: 'DELIVERED',
              internalStatus: 'DELIVERED',
              delivery: {
                ...order.delivery,
                status: 'DELIVERED',
                deliveredAt: new Date().toISOString(),
                isCodCollected: true,
              },
            });
          }
          setIsOtpDrawerOpen(false);
          setIsOtpSuccess(false);
          showToast('✓ Delivery confirmed and verified successfully!', 'success');
        }, 1750);
        return;
      }
      if (order) {
        const isCod = (order.paymentMethod || (order as any).payment?.method || '').toLowerCase() === 'cod';
        await deliveryAgentService.verifyDeliveryOtp(order._id, {
          otp: otpCode,
          codConfirmed: true,
          codAmountCollected: isCod ? order.total : undefined,
        }, location.search);

        setIsOtpSuccess(true);
        setTimeout(() => {
          setOrder({
            ...order,
            status: 'DELIVERED',
            orderStatus: 'DELIVERED',
            internalStatus: 'DELIVERED',
            delivery: {
              ...order.delivery,
              status: 'DELIVERED',
              deliveredAt: new Date().toISOString(),
              isCodCollected: true,
            },
          });
          setIsOtpDrawerOpen(false);
          setIsOtpSuccess(false);
          showToast('✓ Delivery confirmed and verified successfully!', 'success');
        }, 1750);
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid customer OTP code. Please recheck.', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const mappedInvoiceData = order
    ? mapOrderToInvoiceData({
        id: order.orderNumber
          ? order.orderNumber.startsWith('#')
            ? order.orderNumber
            : `#${order.orderNumber}`
          : order._id
          ? `#${order._id.slice(-6).toUpperCase()}`
          : '#CPR-10482',
        date: (order as any).createdAt
          ? new Date((order as any).createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
        customer: {
          name: customerName,
          email: order.customerEmail || 'customer@cakepoprush.com',
          phone: customerPhone,
        },
        address: {
          recipientName: customerName,
          phone: customerPhone,
          street: addressStreet || 'Delivery address on file',
          city: addressCity || '',
          state: addressState || '',
          pincode: addressPincode || '',
        },
        orderType: 'Delivery',
        price: {
          itemSubtotal: (order.total || 399) - 40,
          deliveryFee: 40,
          taxes: Math.round(((order.total || 399) - 40) * 0.05),
          couponDiscount: 0,
          amountPaid: order.total || 399,
        },
        payment: {
          method:
            order.paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : 'Online (Paid)',
          status:
            order.paymentStatus === 'paid' ||
            order.paymentMethod !== 'cod' ||
            order.delivery?.isCodCollected ||
            isCodCollected
              ? 'Paid'
              : 'Pending',
        },
        paymentStatus:
          order.paymentStatus === 'paid' ||
          order.paymentMethod !== 'cod' ||
          order.delivery?.isCodCollected ||
          isCodCollected
            ? 'Paid'
            : 'Pending',
        items:
          order.items?.map((it: any, idx: number) => ({
            id: it.productId || String(idx + 1),
            name: it.name,
            qty: it.quantity || 1,
            unitPrice: it.price || 0,
            subtotal: (it.price || 0) * (it.quantity || 1),
          })) || [],
      } as any)
    : null;

  if (user && !isDeliveryRole) {
    return null;
  }

  if (isLoading) {
    return <DeliveryOrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Delivery Task Not Found</p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px' }}>This delivery order could not be found or you do not have permission to view it.</p>
        <button
          type="button"
          onClick={() => navigate(location.search ? `/delivery${location.search}` : '/delivery')}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: 'var(--primary, #e91e63)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Return to Portal
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 1. Map / Delivered Image Section (Full Viewport) */}
      <div
        className={styles.mapContainer}
        onWheel={(e) => {
          if (e.deltaY > 20 && !isSheetExpanded) {
            setIsSheetExpanded(true);
          } else if (e.deltaY < -20 && isSheetExpanded) {
            setIsSheetExpanded(false);
          }
        }}
        onTouchStart={(e) => {
          touchStartYRef.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const touchEndY = e.changedTouches[0].clientY;
          const diff = touchStartYRef.current - touchEndY;
          if (diff > 40 && !isSheetExpanded) {
            setIsSheetExpanded(true);
          } else if (diff < -40 && isSheetExpanded) {
            setIsSheetExpanded(false);
          }
        }}
      >
        {isCancelled ? (
          <div className={styles.cancelledBackground}>
            <div className={styles.cancelledAmbientGlow} />
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
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 220,
              mass: 0.8,
            }}
          />
        ) : isPreDispatch ? (
          <motion.img
            src="/Pre-Dispatch Store Location Map.png"
            alt="Store Location - Order Preparing for Dispatch"
            className={styles.deliveredBgImage}
            initial={false}
            animate={{
              scale: isSheetExpanded ? 1.0 : 1.15,
              y: isSheetExpanded ? -10 : 0,
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 220,
              mass: 0.8,
            }}
          />
        ) : (
          <DeliveryMap state={trackingState} isSheetExpanded={isSheetExpanded} isFullMap={isFullMap} ref={mapRef} />
        )}
      </div>

      {/* Admin Supervisor Preview Top Banner */}
      {isAdminPreview && (
        <aside className={styles.adminSupervisorBanner} role="status" aria-label="Supervisor Mode Banner">
          <div className={styles.adminSupervisorLeft}>
            <span className={styles.supervisorDot} />
            <ShieldCheck size={12} />
            <span>Viewing as <strong>{agentName}</strong></span>
          </div>
          <button
            type="button"
            className={styles.adminSupervisorBackBtn}
            onClick={() => navigate('/admin/delivery-agents')}
            title="Return to Admin Delivery Agents"
          >
            <ArrowLeft size={11} />
            <span>Back to Admin Portal</span>
          </button>
        </aside>
      )}

      {/* 2. Map UI Overlay Wrapper */}
      <div 
        className={`${styles.mapOverlayWrapper} ${isAdminPreview ? styles.mapOverlaySupervisor : ''}`}
        style={{
          '--sheet-collapsed-peek': isFullMap ? '58px' : 'calc(58vh - 66px)',
        } as React.CSSProperties}
      >
        {/* Header Bar Overlay */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => navigate(location.search ? `/delivery${location.search}` : '/delivery')}
              aria-label="Back to Deliveries"
              title="Back to Deliveries"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <div className={styles.headerTitleBox}>
              <h1 className={styles.headerOrderNumber}>
                Order #{order?.orderNumber || order?._id.slice(-6).toUpperCase() || 'CPR-10482'}
              </h1>
            </div>
          </div>

          <div className={styles.headerRight}>
            {isAdminPreview ? (
              <button
                type="button"
                className={styles.adminSupervisorExitBtn}
                onClick={() => navigate('/admin/delivery-agents')}
                title="Return to Admin Delivery Agents"
              >
                <ArrowLeft size={14} />
                <span>Exit Preview</span>
              </button>
            ) : (
              <button
                type="button"
                className={styles.helpBtn}
                onClick={() => alert('Connecting to CakePopRush Partner Support: 1800-225-3767')}
              >
                <HelpCircle size={15} />
                <span>Support</span>
              </button>
            )}
          </div>
        </header>

        {/* Click-to-close Overlay (Scrim) when sheet is expanded */}
        <AnimatePresence>
          {isSheetExpanded && (
            <motion.div
              key="sheet-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSheetExpanded(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                zIndex: 15,
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            />
          )}
        </AnimatePresence>

        {/* Floating ETA & Route Stats Card - Hidden when sheet expands to prevent ANY overlap */}
        <AnimatePresence>
          {!isSheetExpanded && (
            <motion.div
              key="etaCard"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.18 }}
              className={styles.etaCard}
            >
              <div className={styles.etaLabel} style={{ color: etaBadgeConfig.labelColor }}>
                {etaBadgeConfig.icon}
                <span>{etaBadgeConfig.label}</span>
              </div>
              <div className={styles.etaTime} style={{ color: etaBadgeConfig.valueColor }}>
                {etaBadgeConfig.value}
              </div>
              <div className={styles.liveTrackingStatus} style={{ color: etaBadgeConfig.statusColor }}>
                <div className={etaBadgeConfig.dotClass} />
                <span>{etaBadgeConfig.statusText}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Actions: Call Customer FAB & Recenter GPS - Hidden when sheet expands or cancelled */}
        <AnimatePresence>
          {!isSheetExpanded && !isCancelled && (
            <motion.div
              key="mapControls"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              <div className={styles.mapActionFabs}>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapFab}
                  style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                  title="Navigate in Google Maps"
                  aria-label="Navigate in Google Maps"
                >
                  <Navigation size={18} />
                </a>
                <a
                  href={`tel:${customerPhone}`}
                  className={styles.mapFab}
                  title="Call Customer"
                  aria-label="Call Customer"
                >
                  <Phone size={18} />
                </a>
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
                    <Minimize2 size={14} />
                    <span>Normal View</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={14} />
                    <span>Full Map</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles.recenterBtn}
                onClick={handleRecenter}
              >
                <Navigation size={14} />
                <span>Recenter GPS</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Draggable / Expandable Bottom Sheet (Storefront Template with Butter-Smooth Scroll) */}
      <motion.div
        className={`${styles.bottomSheet} ${isCancelled ? styles.bottomSheetCancelled : ''}`}
        initial={false}
        animate={{ 
          y: isSheetExpanded 
            ? 0 
            : isFullMap
            ? 'calc(100dvh - 66px - 58px)'
            : '42vh' 
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
        {isCancelled && (
          <>
            {/* Speech Bubble Floating Above Mascot */}
            <motion.div
              className={styles.speechBubble}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <TypingText text="I'm so sorry! 💔" speed={30} />
            </motion.div>

            {/* Mascot Peeking Behind Top Rim of the Pull-Over Sheet */}
            <div className={styles.mascotStickyContainer}>
              <CakePopMascot
                size="medium"
                hideArms={true}
                reaction="cryingFountain"
              />
            </div>
            <div className={styles.mascotHandLeft} />
            <div className={styles.mascotHandRight} />
          </>
        )}

        {/* Drag Handle Area - Dragging allowed only on the handle, not the scrollable body */}
        <div
          className={`${styles.dragHandleArea} ${isFullMap ? styles.dragHandleAreaFullMap : ''}`}
          onClick={() => {
            if (isFullMap) {
              setIsFullMap(false);
            } else {
              setIsSheetExpanded((prev) => !prev);
            }
          }}
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

        {/* Scrollable Content Container - 100% Unhindered Smooth Native Scroll */}
        <div
          ref={scrollContainerRef}
          className={`${styles.scrollContent} ${!isSheetExpanded ? styles.scrollContentCollapsed : ''}`}
        >
          <div className={styles.trackingLayout}>
            {/* Left Column: Delivery Details & Partner Profile */}
            <div>
              <div
                className={styles.mainStatusTitle}
                onClick={() => {
                  if (isFullMap) setIsFullMap(false);
                  else setIsSheetExpanded((prev) => !prev);
                }}
                style={{ cursor: 'pointer' }}
                title="Tap to toggle full view"
              >
                <span>{isCancelled ? 'Order Cancelled' : isCompleted ? 'Delivery Completed' : 'Deliver Order to Customer'}</span>
                {isCancelled ? (
                  <span className={styles.taskStatusBadge} style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    CANCELLED
                  </span>
                ) : isCompleted && (
                  <span className={`${styles.taskStatusBadge} ${styles.taskStatusCompleted}`}>
                    DELIVERED
                  </span>
                )}
              </div>

            {/* Customer Profile Card - Dynamic Customer Identity */}
            <div className={styles.driverInfoRow}>
              <div
                className={styles.driverAvatar}
                style={{
                  background: (!customerAvatar || customerAvatarError) ? getAvatarGradient(customerName) : undefined,
                }}
              >
                {customerAvatar && !customerAvatarError ? (
                  <img
                    src={customerAvatar}
                    alt={customerName}
                    referrerPolicy="no-referrer"
                    onError={() => setCustomerAvatarError(true)}
                  />
                ) : (
                  <div className={styles.customerInitialsBadge}>
                    {customerInitials}
                  </div>
                )}
              </div>

              <div className={styles.driverDetails}>
                <div className={styles.customerNameHeader}>
                  <h4 className={styles.driverNameTitle}>
                    {customerName}
                  </h4>
                  <span className={styles.customerRoleTag}>Customer</span>
                </div>
                <div className={styles.driverStats}>
                  {customerPhone && (
                    <div className={styles.statRow}>
                      <Phone size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                      <a href={`tel:${customerPhone}`} className={styles.statLink}>{customerPhone}</a>
                    </div>
                  )}
                  {customerEmail && (
                    <div className={styles.statRow}>
                      <Mail size={12} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                      <a href={`mailto:${customerEmail}`} className={styles.statLink} title={customerEmail}>{customerEmail}</a>
                    </div>
                  )}
                  {fullDeliveryAddress && fullDeliveryAddress !== 'Delivery address on file' && (
                    <div className={styles.statRow}>
                      <MapPin size={12} style={{ color: '#F20D6F', flexShrink: 0 }} />
                      <span className={styles.driverAddressLine} title={fullDeliveryAddress}>
                        {addressStreet || fullDeliveryAddress}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.driverActions}>
                {customerPhone && (
                  <>
                    <a
                      href={`tel:${customerPhone}`}
                      className={styles.iconBtn}
                      title={`Call ${customerName}`}
                      aria-label={`Call ${customerName}`}
                    >
                      <Phone size={16} />
                    </a>
                    <a
                      href={`https://wa.me/${customerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.iconBtn}
                      title={`WhatsApp ${customerName}`}
                      aria-label={`WhatsApp ${customerName}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Order Status & Delivery Destination Card (Storefront Template with Bigger Delivery Address) */}
            <div className={styles.statusBox}>
              <div className={styles.deliveringToHeader}>
                <div className={styles.deliveryHeaderRow}>
                  <span className={styles.deliveryLabel}>DELIVERING TO</span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                    }}
                    title="Open turn-by-turn navigation in Google Maps"
                  >
                    <Navigation size={12} strokeWidth={2.5} />
                    <span>Navigate</span>
                  </a>
                </div>
                <h3 className={styles.deliveryAddress}>
                  {addressType ? `${addressType} - ` : ''}{fullDeliveryAddress}
                </h3>
                {landmark && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                    <strong>Landmark:</strong> {landmark}
                  </p>
                )}
                {deliveryInstructions && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#D97706', background: '#FEF3C7', padding: '4px 8px', borderRadius: '4px' }}>
                    <strong>Note:</strong> {deliveryInstructions}
                  </p>
                )}
              </div>

              <div className={styles.timelineAndOtpRow}>
                {/* 4-Step Vertical Timeline */}
                <div className={styles.timeline} style={{ flex: 1 }}>
                  {liveTrackingSteps.map((step, index: number) => {
                    const stepDone = index < currentStepIndex;
                    const stepCurrent = index === currentStepIndex;

                    return (
                      <div
                        key={step.status}
                        className={`${styles.timelineStep} ${
                          stepCurrent ? styles.currentStep : stepDone ? styles.completedStep : styles.upcomingStep
                        }`}
                      >
                        <div className={styles.stepIndicator}>
                          <div
                            className={`${styles.stepIcon} ${
                              stepCurrent ? styles.currentIcon : stepDone ? styles.completedIcon : styles.upcomingIcon
                            }`}
                            style={
                              stepDone || stepCurrent
                                ? {
                                    background: step.color,
                                    color: 'white',
                                    boxShadow: stepCurrent ? `0 0 0 4px ${step.color}33` : 'none',
                                  }
                                : {}
                            }
                            aria-label={`${step.label}: ${stepDone ? 'completed' : stepCurrent ? 'current' : 'upcoming'}`}
                          >
                            {stepDone ? (
                              <Check size={10} strokeWidth={3} />
                            ) : (
                              <step.Icon size={stepCurrent ? 14 : 10} />
                            )}
                          </div>
                          {index < liveTrackingSteps.length - 1 && (
                            <div
                              className={styles.stepConnector}
                              style={stepDone ? { background: step.color } : {}}
                            />
                          )}
                        </div>
                        <div className={styles.stepContent}>
                          <h4
                            className={styles.stepLabel}
                            style={stepCurrent ? { color: step.color, fontWeight: 700 } : {}}
                          >
                            {step.label}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contextual Action for Delivery Partner */}
              {isCancelled ? (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', padding: '16px', borderRadius: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={20} color="#DC2626" />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B', display: 'block' }}>Order Has Been Cancelled</span>
                    <span style={{ fontSize: '11.5px', color: '#7F1D1D' }}>This delivery task was cancelled. No delivery action or OTP required.</span>
                  </div>
                </div>
              ) : !isCompleted ? (
                isAssigned ? (
                  <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Store size={18} style={{ color: '#B45309' }} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>NEW DELIVERY TASK ASSIGNED</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#78350F', margin: '0 0 12px 0' }}>
                      Please accept this assignment to head towards CakePopRush bakery for pickup.
                    </p>
                    <button
                      type="button"
                      className={styles.quickVerifyBtn}
                      style={{ width: '100%', justifyContent: 'center', background: '#D97706', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                      onClick={handleAcceptDelivery}
                      disabled={isAccepting}
                    >
                      {isAccepting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      <span>ACCEPT DELIVERY TASK</span>
                    </button>
                  </div>
                ) : isAccepted ? (
                  <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <PackageCheck size={18} style={{ color: '#15803D' }} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>COLLECT FROM KITCHEN COUNTER</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#14532D', margin: '0 0 12px 0' }}>
                      Confirm physical collection of package from bakery counter. This dispatches the order to customer and enables live GPS tracking!
                    </p>
                    <button
                      type="button"
                      className={styles.quickVerifyBtn}
                      style={{ width: '100%', justifyContent: 'center', background: '#16A34A', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                      onClick={handleConfirmPickup}
                      disabled={isPickingUp}
                    >
                      {isPickingUp ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                      <span>CONFIRM PICKUP & DISPATCH</span>
                    </button>
                  </div>
                ) : (
                  <div className={styles.cardExtensionStrip}>
                    <button
                      type="button"
                      className={styles.otpExtensionToggleBtn}
                      onClick={() => {
                        setIsOtpDrawerOpen(true);
                        setTimeout(() => otpInputRefs[0]?.current?.focus(), 250);
                      }}
                    >
                      <div className={styles.otpExtensionLeft}>
                        <ShieldCheck size={18} className={styles.otpExtensionIcon} />
                        <span className={styles.otpExtensionText}>Enter Customer Delivery OTP</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {order?.paymentMethod === 'cod' && (
                          <span className={styles.otpCodBadge}>
                            COD: ₹{order.total}
                          </span>
                        )}
                        <span className={styles.otpExtensionBadge}>
                          Enter OTP &rarr;
                        </span>
                      </div>
                    </button>
                  </div>
                )
              ) : (
                <div style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0', padding: '14px 16px', borderRadius: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} style={{ color: '#059669' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#065F46', display: 'block' }}>Order Delivered & Verified via OTP</span>
                    <span style={{ fontSize: '11px', color: '#047857' }}>Completed on {order?.actualDelivery || 'Today'}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Items Checklist, Earnings & Price Summary */}
          <div>
            {/* Order Items Box (Exact Storefront Style) */}
            <div className={styles.statusBox}>
              <div className={styles.statusBoxHeader}>
                <h3 className={styles.statusBoxTitle}>
                  ORDER ITEMS {order && `(${order.items?.length || 1} PRODUCTS, ${order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || 1} ITEMS)`}
                </h3>
              </div>

              <div className={styles.statusBoxBody}>
                {order?.items?.map((item: any, idx: number) => {
                  const itemImg = getProductImage(item);
                  return (
                    <div key={idx} className={styles.itemCard}>
                      <div className={styles.itemIcon}>
                        <img
                          src={itemImg}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/images/Products/mini valentine cake.jpeg';
                          }}
                        />
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemMeta}>
                          {item.variant || 'Standard Pack'}
                        </span>
                        <span className={styles.itemQty}>Qty: {item.quantity}</span>
                      </div>
                      <span className={styles.itemSubtotal}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>



            {/* Order Price Details */}
            <div className={styles.statusBox} style={{ marginTop: '16px' }}>
              <div className={styles.statusBoxHeader}>
                <h3 className={styles.statusBoxTitle}>Bill Breakdown</h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: order?.paymentMethod === 'cod' ? '#B45309' : '#059669',
                  }}
                >
                  {order?.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAID ONLINE'}
                </span>
              </div>

              <div className={styles.statusBoxBody}>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Items Subtotal</span>
                    <span>₹{order?.total ? order.total - 40 : 359}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Delivery & Handling</span>
                    <span>₹40</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Taxes & GST (5%)</span>
                    <span>Included</span>
                  </div>
                  <div className={styles.priceTotalRow}>
                    <span>Total Amount</span>
                    <span style={{ color: '#F20D6F' }}>₹{order?.total || 399}</span>
                  </div>
                </div>

                {/* Tax Invoice Section */}
                <div className={styles.invoiceSection}>
                  <div className={styles.invoiceRow}>
                    <span>Invoice No.</span>
                    <span className={styles.invoiceValue}>
                      INV-{order?.orderNumber?.replace('#', '') || order?._id?.slice(-6).toUpperCase() || 'CPR-10482'}
                    </span>
                  </div>
                  <div className={styles.invoiceRow}>
                    <span>Invoice Date</span>
                    <span className={styles.invoiceValue}>
                      {(order as any)?.createdAt
                        ? new Date((order as any).createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Oct 1, 2026'}
                    </span>
                  </div>
                  <div className={styles.invoiceRow}>
                    <span>Billing Name</span>
                    <span className={styles.invoiceValue}>
                      {order?.shippingAddress?.recipientName || order?.customerName || 'Customer'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.invoiceBtn}
                    onClick={() => setShowInvoice(true)}
                  >
                    <FileText size={15} />
                    <span>View Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Invoice Viewer Modal */}
    {mappedInvoiceData && (
      <InvoiceViewer
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        data={mappedInvoiceData}
      />
    )}

    {/* Customer Delivery OTP Modal (Laptop Popup / Mobile App Drawer) */}
    <AnimatePresence>
      {isOtpDrawerOpen && (
        <motion.div
          className={styles.otpDrawerOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOtpDrawerOpen(false)}
        >
          <motion.div
            className={styles.otpAppDrawer}
            initial={isDesktop ? { opacity: 0, scale: 0.95, y: 16 } : { y: '100%' }}
            animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.95, y: 16 } : { y: '100%' }}
            transition={
              isDesktop
                ? { type: 'spring', damping: 26, stiffness: 340 }
                : { type: 'spring', damping: 28, stiffness: 320 }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerDragHandle} />

            <div className={styles.drawerHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div className={styles.drawerIconBadge}>
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.drawerHeaderInfo}>
                  <h3 className={styles.drawerHeaderTitle}>Customer Delivery OTP</h3>
                  <p className={styles.drawerHeaderSubtitle}>
                    {customerName} &bull; Order #{order?.orderNumber?.replace('#', '') || order?._id?.slice(-6).toUpperCase() || 'CPR-10482'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setIsOtpDrawerOpen(false)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {isOtpSuccess ? (
              <OtpSuccessCelebration
                orderTotal={order?.total}
                isCod={(order?.paymentMethod || (order as any)?.payment?.method || '').toLowerCase() === 'cod'}
              />
            ) : (
              <>
                {/* Instruction Row with COD / Prepaid info */}
                <div className={styles.drawerInstructionRow}>
                  <span className={styles.otpDrawerSub}>
                    {(order?.paymentMethod || (order as any)?.payment?.method || '').toLowerCase() === 'cod'
                      ? `Collect ₹${order.total} Cash & ask customer for 6-digit OTP`
                      : 'Ask customer for 6-digit delivery verification OTP'}
                  </span>
                  <button
                    type="button"
                    className={styles.otpResendBtn}
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>

                {Boolean(order?.delivery?.otpExpiresAt && new Date(order.delivery.otpExpiresAt).getTime() < Date.now()) && (
                  <div style={{
                    padding: '10px 14px',
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    color: '#991B1B',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>OTP expired. Request a new OTP for this customer.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      style={{
                        background: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                      }}
                    >
                      {isSendingOtp ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      <span>{isSendingOtp ? 'Generating...' : 'Generate New OTP'}</span>
                    </button>
                  </div>
                )}

                <div className={styles.otpDigitsRow} onPaste={handlePasteOtp}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      className={styles.otpDigitBox}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.otpVerifySubmitBtn}
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otpDigits.filter(Boolean).length < 6}
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying & Completing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Verify & Complete Delivery</span>
                    </>
                  )}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
}

export default DeliveryOrderDetailPage;
