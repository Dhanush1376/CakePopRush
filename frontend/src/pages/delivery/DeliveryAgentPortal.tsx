import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Loader2,
  RefreshCw,
  Clock,
  Store,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Package,
  Power,
  User,
  History,
  Home,
  Check,
  Mail,
  Navigation,
  X,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import styles from './DeliveryAgentPortal.module.css';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import deliveryAgentService, {
  AssignedOrder,
  DeliveryProfile,
} from '@/services/api/deliveryAgentService';
import { Logo } from '@/assets/brand/Logo';
import { DeliveryAgentPortalSkeleton } from './components/DeliveryAgentPortalSkeleton';
import { OtpSuccessCelebration } from './components/OtpSuccessCelebration';
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

function OrderItemsImageStack({ items }: { items?: any[] }) {
  if (!items || items.length === 0) {
    return (
      <div className={styles.orderCardVisual}>
        <img
          src="/images/Products/mini valentine cake.jpeg"
          alt="Cake Pop"
          className={styles.orderProductImg}
        />
      </div>
    );
  }

  if (items.length === 1) {
    const item = items[0];
    return (
      <div className={styles.orderCardVisual}>
        <img
          src={getProductImage(item)}
          alt={item?.name || 'Cake Pop'}
          className={styles.orderProductImg}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/Products/mini valentine cake.jpeg';
          }}
        />
      </div>
    );
  }

  // Multi-item order: picture stack beside each other
  const displayItems = items.slice(0, 3);
  const remainingCount = items.length - displayItems.length;

  return (
    <div className={styles.orderPictureStack}>
      {displayItems.map((it: any, idx: number) => {
        const isLast = idx === displayItems.length - 1;
        return (
          <div
            key={idx}
            className={styles.stackImageWrapper}
            style={{
              zIndex: displayItems.length - idx,
              marginLeft: idx > 0 ? '-16px' : 0,
            }}
          >
            <img
              src={getProductImage(it)}
              alt={it?.name || 'Cake Pop'}
              className={styles.orderProductImg}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/Products/mini valentine cake.jpeg';
              }}
            />
            {isLast && remainingCount > 0 && (
              <span className={styles.stackMoreBadge}>
                +{remainingCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DeliveryAgentPortal() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const previewAgentId = searchParams.get('previewAgentId');
  const previewAgentName = searchParams.get('agentName');
  const previewAgentEmail = searchParams.get('agentEmail');
  const previewAgentPhone = searchParams.get('agentPhone');
  const previewAgentCity = searchParams.get('agentCity');
  const userRole = user?.role?.toLowerCase() || '';
  const isDeliveryRole = userRole === 'delivery_agent' || userRole === 'delivery';
  const isAdminPreview = false;

  // Strict Security Guard: until and unless the user is set to a delivery role, access is completely denied
  useEffect(() => {
    if (user && !isDeliveryRole) {
      showToast('Access Denied: Only registered Delivery Agents can access this portal.', 'error');
      navigate(['admin', 'owner', 'super_admin', 'main_admin', 'editor', 'viewer'].includes(userRole) ? '/admin' : '/', { replace: true });
    }
  }, [user, isDeliveryRole, userRole, navigate, showToast]);

  // Tab navigation: 'active' | 'history' | 'profile'
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'profile'>('active');

  // Operational state
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Active delivery operation state
  const [showItems, setShowItems] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isCodCollected, setIsCodCollected] = useState(false);
  const [isOtpDrawerOpen, setIsOtpDrawerOpen] = useState(false);
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Screen size detection for modal popup vs mobile drawer
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 641 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 641);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escape key listener to close OTP popup
  useEffect(() => {
    if (!isOtpDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOtpDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOtpDrawerOpen]);

  // Fetch initial profile & orders
  const loadPortalData = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);

      const [ordersRes, profileRes] = await Promise.allSettled([
        deliveryAgentService.getAssignedOrders(location.search),
        deliveryAgentService.getProfile(location.search),
      ]);

      if (ordersRes.status === 'fulfilled') {
        const liveOrders = ordersRes.value || [];
        setOrders(liveOrders);
        const ongoing = liveOrders.find(
          (o) => o.status === 'DISPATCHED' || (o as any).internalStatus === 'DISPATCHED'
        );
        if ((ongoing as any)?.delivery?.customerOtp) {
          setDevOtp(String((ongoing as any).delivery.customerOtp));
        }
      } else {
        setOrders([]);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfile(profileRes.value);
        setIsOnline(profileRes.value.isActive !== false);
      } else {
        setProfile(null);
        setIsOnline(false);
      }
    } catch {
      setOrders([]);
      setProfile(null);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location.search]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Derive active task & completed history
  const activeOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  const activeOrder = activeOrders[0] || null;
  const hasActiveOrders = activeOrders.length > 0;
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');

  // Handle duty status toggle with instant optimistic update & active task safety check
  const handleToggleDuty = async () => {
    if (isTogglingStatus) return;
    const previousStatus = isOnline;
    const targetStatus = !previousStatus;

    // Delivery agent can only go offline when there are no active orders
    if (!targetStatus && hasActiveOrders) {
      showToast(
        `Cannot go offline with ${activeOrders.length} active delivery task${activeOrders.length > 1 ? 's' : ''}. Please deliver or complete all ongoing orders first.`,
        'warning'
      );
      return;
    }

    // 1. Instant optimistic UI switch (0ms delay)
    setIsOnline(targetStatus);
    setIsTogglingStatus(true);

    try {
      await deliveryAgentService.updateStatus(targetStatus, location.search);
      showToast(
        targetStatus
          ? 'You are now Online and ready for deliveries'
          : 'You are now Offline. No new assignments will be dispatched',
        'info'
      );
    } catch (err: any) {
      // Revert if network fails or backend rejects
      setIsOnline(previousStatus);
      showToast(err.message || 'Could not update duty status. Please check your connection.', 'error');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Dynamic timezone-aware greeting (Morning, Afternoon, Evening)
  const [greeting, setGreeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Good Morning,';
    if (hour >= 12 && hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 12) setGreeting('Good Morning,');
      else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon,');
      else setGreeting('Good Evening,');
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const agentName = previewAgentName || profile?.name || user?.name || 'Partner';
  const agentEmail = previewAgentEmail || profile?.email || user?.email || 'partner@cakepoprush.com';
  const agentPhone = previewAgentPhone || profile?.phone || user?.phone || '';
  const agentCity = previewAgentCity || profile?.city || 'Bengaluru';

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'DA';
  };

  // OTP Handlers
  const handleSendOtp = async (orderId: string) => {
    try {
      setIsSendingOtp(true);
      if (orderId.startsWith('order_demo_')) {
        await new Promise((r) => setTimeout(r, 500));
        setOtpSent(true);
        setOtpDigits(['', '', '', '', '', '']);
        showToast('Demo 6-digit OTP code sent to customer phone: 482910', 'success');
        setTimeout(() => otpInputRefs[0].current?.focus(), 150);
        return;
      }
      const res = await deliveryAgentService.sendDeliveryOtp(orderId, location.search);
      const newExpiresAt = (res as any)?.data?.expiresAt || (res as any)?.expiresAt;
      if (newExpiresAt) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? {
                  ...o,
                  delivery: {
                    ...o.delivery,
                    otpExpiresAt: newExpiresAt,
                  },
                }
              : o
          )
        );
      }
      setOtpDigits(['', '', '', '', '', '']);
      setOtpSent(true);
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

  // Real GPS Geolocation & Orientation Tracking for active delivery
  useEffect(() => {
    if (!isOnline || !activeOrder) return;
    const targetOrderId = activeOrder._id || (activeOrder as any).id;
    if (!targetOrderId) return;
    if (activeOrder.status !== 'DISPATCHED' && (activeOrder as any).internalStatus !== 'DISPATCHED') return;

    let lastSent = 0;
    let lastCoords: { latitude: number; longitude: number } | null = null;
    let currentHeading = 0;
    let lastHeadingSent = 0;

    const sendCoords = (latitude: number, longitude: number, heading?: number) => {
      lastCoords = { latitude, longitude };
      const h = typeof heading === 'number' ? heading : currentHeading;
      deliveryAgentService
        .updateLocation(targetOrderId, { latitude, longitude, heading: h }, location.search)
        .catch((err) => console.error('Failed to sync delivery agent GPS:', err));
    };

    // Device orientation (compass) listener: rotates as the user turns/rotates device
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compass = 0;
      if ((event as any).webkitCompassHeading) {
        compass = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null && typeof event.alpha === 'number') {
        compass = (360 - event.alpha) % 360;
      }
      compass = Math.round(compass);
      if (Math.abs(compass - currentHeading) >= 6) {
        currentHeading = compass;
        const now = Date.now();
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

    if (!('geolocation' in navigator)) {
      return () => {
        window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }

    // Immediate initial GPS fix
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

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        // Throttle sending location updates to every 3 seconds
        if (now - lastSent < 3000) return;
        lastSent = now;

        const { latitude, longitude } = position.coords;
        const gpsH = typeof position.coords.heading === 'number' && !isNaN(position.coords.heading) && position.coords.heading >= 0
          ? Math.round(position.coords.heading)
          : currentHeading;
        sendCoords(latitude, longitude, gpsH);
      },
      (error) => {
        console.warn('Geolocation watch note:', error.message);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isOnline, activeOrder, location.search]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const digit = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs[nextIndex].current?.focus();
  };

  const handleCompleteDelivery = async (order: AssignedOrder) => {
    const fullOtp = otpDigits.filter(Boolean).join('');
    if (fullOtp.length < 6) {
      showToast('Please enter the full 6-digit customer verification OTP', 'warning');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      if (order._id.startsWith('order_demo_')) {
        await new Promise((r) => setTimeout(r, 600));
        setIsOtpSuccess(true);
        const updated = {
          ...order,
          status: 'DELIVERED',
          orderStatus: 'DELIVERED' as const,
          delivery: {
            ...order.delivery,
            deliveredAt: new Date().toISOString(),
            isCodCollected: true,
            codAmountCollected: order.paymentMethod === 'cod' ? order.total : undefined,
          },
        };
        setTimeout(() => {
          setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
          setOtpDigits(['', '', '', '', '', '']);
          setOtpSent(false);
          setIsOtpDrawerOpen(false);
          setIsOtpSuccess(false);
          showToast('✓ Delivery completed and verified successfully!', 'success');
        }, 1750);
        return;
      }

      const isCod = (order.paymentMethod || (order as any).payment?.method || '').toLowerCase() === 'cod';
      await deliveryAgentService.verifyDeliveryOtp(order._id, {
        otp: fullOtp,
        codConfirmed: true,
        codAmountCollected: isCod ? order.total : undefined,
      }, location.search);

      setIsOtpSuccess(true);
      setTimeout(async () => {
        setOtpDigits(['', '', '', '', '', '']);
        setOtpSent(false);
        setIsOtpDrawerOpen(false);
        setIsOtpSuccess(false);
        showToast('✓ Delivery completed and verified successfully!', 'success');
        await loadPortalData(true);
      }, 1750);
    } catch (err: any) {
      showToast(err.message || 'Invalid or expired customer OTP', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const renderOngoingDeliveryCard = (ongoing: any) => {
    if (!ongoing) return null;
    const firstItem = ongoing.items?.[0];
    const firstItemName = firstItem?.name || 'Belgian Dark Chocolate Cake Pops';
    const hasMoreItems = (ongoing.items?.length || 0) > 1;

    return (
      <div>
        <div className={styles.historySectionHeader} style={{ marginTop: '4px' }}>
          <div>
            <h2 className={styles.historySectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#6B4E3D',
                  display: 'inline-block',
                }}
              />
              Ongoing Delivery
            </h2>
            <p className={styles.historySectionSubtitle}>
              1 active delivery &bull; Currently processing
            </p>
          </div>
          <span
            className={styles.historyCountBadge}
            style={{
              background: '#F8F5F2',
              color: '#5A3D2F',
              border: '1px solid #E2DCD8',
              fontWeight: 700,
            }}
          >
            1 In Progress
          </span>
        </div>

        <div className={styles.historySectionDivider} />

        <div
          className={styles.storefrontOrderCard}
          onClick={() =>
            navigate(`/delivery/orders/${ongoing.orderNumber || ongoing._id}${location.search}`, {
              state: { order: ongoing },
            })
          }
          style={{ cursor: 'pointer' }}
          title="Open Live GPS Tracking & Order Details"
        >
          {/* Active Order Card Header */}
          <div
            className={styles.orderCardHeader}
            style={{ background: '#FAF7F5', borderBottom: '1.5px solid #EAE4DF' }}
          >
            <div className={styles.orderStatusGroup}>
              <Truck size={14} style={{ color: '#6B4E3D' }} />
              <span
                className={styles.orderStatusLabel}
                style={{ color: '#5A3D2F', fontWeight: 800 }}
              >
                OUT FOR DELIVERY
              </span>
              <span className={styles.orderDateText} style={{ color: '#7D6B60' }}>
                • Est. 12–15 min
              </span>
            </div>
            <span
              className={styles.orderNumberBadge}
              style={{
                background: '#FFFFFF',
                borderColor: '#E2DCD8',
                color: '#381E10',
                fontWeight: 700,
              }}
            >
              #{ongoing.orderNumber || ongoing._id.slice(-6).toUpperCase()}
            </span>
          </div>

          {/* Active Order Card Body */}
          <div className={styles.orderCardBody}>
            <OrderItemsImageStack items={ongoing.items} />

            <div className={styles.orderCardMain}>
              {(() => {
                const oAddr = ongoing.shippingAddress || (ongoing as any).address || (ongoing as any).delivery?.addressSnapshot;
                const custName = oAddr?.recipientName || oAddr?.customerName || ongoing.customerName || 'Customer';
                const cityPart = oAddr?.city || oAddr?.area || oAddr?.street || oAddr?.line1;
                const pinPart = oAddr?.pincode || oAddr?.zipCode;
                const addressSnippet = [cityPart, pinPart].filter(Boolean).join(' - ') || 'Local Delivery';
                return (
                  <>
                    <div className={styles.customerNameRow}>
                      <h4 className={styles.customerName}>
                        {custName}
                      </h4>
                      <span className={styles.orderTotalAmount}>₹{ongoing.total}</span>
                    </div>

                    <div className={styles.orderAddressRow}>
                      <MapPin size={11} className={styles.addressIcon} />
                      <span className={styles.addressText}>
                        {addressSnippet}
                      </span>
                    </div>
                  </>
                );
              })()}

              <p className={styles.orderItemsSnippet}>
                {firstItemName}
                {hasMoreItems ? ` (+${ongoing.items!.length - 1} more)` : ` (1 item)`}
              </p>
            </div>
          </div>

          {/* Active Order Card Footer */}
          <div className={styles.orderCardFooter}>
            <div className={styles.orderPillsGroup}>
              <span
                className={styles.otpVerifiedPill}
                style={{
                  background: '#F8F5F2',
                  color: '#4A3528',
                  borderColor: '#E2DCD8',
                }}
              >
                <Navigation size={11} /> Live GPS Route
              </span>
              <span
                className={`${styles.paymentStatusPill} ${
                  ongoing.paymentMethod === 'cod'
                    ? styles.paymentCodPill
                    : styles.paymentPrepaidPill
                }`}
              >
                {ongoing.paymentMethod === 'cod' ? (
                  `COD: ₹${ongoing.total}`
                ) : (
                  <>
                    <Check size={11} strokeWidth={3} /> Prepaid
                  </>
                )}
              </span>
            </div>
            <span
              className={styles.viewOrderLink}
              style={{ color: '#5A3D2F', fontWeight: 700 }}
            >
              Track & Deliver &rarr;
            </span>
          </div>

          {/* Card Extension: Enter OTP Button (Triggers Mobile App Drawer) */}
          <div
            className={styles.cardExtensionStrip}
            onClick={(e) => {
              e.stopPropagation();
              setIsOtpDrawerOpen(true);
              setTimeout(() => otpInputRefs[0]?.current?.focus(), 250);
            }}
          >
            <button
              type="button"
              className={styles.otpExtensionToggleBtn}
              onClick={(e) => {
                e.stopPropagation();
                setIsOtpDrawerOpen(true);
                setTimeout(() => otpInputRefs[0]?.current?.focus(), 250);
              }}
            >
              <div className={styles.otpExtensionLeft}>
                <ShieldCheck size={16} className={styles.otpExtensionIcon} />
                <span>Enter Customer Delivery OTP</span>
              </div>
              <span className={styles.otpExtensionBadge}>
                Enter OTP &rarr;
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const activeOngoing = activeOrder;

  if (user && !isDeliveryRole) {
    return null;
  }

  if (isLoading) {
    return <DeliveryAgentPortalSkeleton activeTab={activeTab} />;
  }

  return (
    <div className={styles.portalContainer}>
      {/* Admin Supervisor Preview Banner */}
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

      {/* Sticky Header */}
      <header className={styles.topHeader}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup}>
            <Logo height={60} noLink />
          </div>

          {/* Desktop & Laptop Top Navbar Tabs */}
          <nav className={styles.topNavTabs} aria-label="Portal views">
            <button
              type="button"
              className={`${styles.topNavTabBtn} ${activeTab === 'active' ? styles.topNavTabBtnActive : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <Home size={16} />
              <span>Active Task</span>
            </button>
            <button
              type="button"
              className={`${styles.topNavTabBtn} ${activeTab === 'history' ? styles.topNavTabBtnActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} />
              <span>Deliveries ({completedOrders.length})</span>
            </button>
            <button
              type="button"
              className={`${styles.topNavTabBtn} ${activeTab === 'profile' ? styles.topNavTabBtnActive : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              <span>Profile</span>
            </button>
          </nav>

          <div className={styles.headerActions}>
            {/* Profile Dropdown */}
            <div className={styles.profileContainer} ref={profileMenuRef}>
              <button
                type="button"
                className={`${styles.profileAvatarBtn} ${isProfileOpen ? styles.profileAvatarBtnActive : ''}`}
                onClick={() => setIsProfileOpen((prev) => !prev)}
                title="Profile & Options"
                aria-label="Profile & Options"
                aria-expanded={isProfileOpen}
              >
                {getInitials(agentName)}
              </button>

              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.menuHeader}>
                    <div className={styles.menuAvatar} aria-hidden="true">
                      {getInitials(agentName)}
                    </div>
                    <div className={styles.menuUserInfo}>
                      <span className={styles.menuName}>{agentName}</span>
                      <span className={styles.menuRole}>Delivery Partner</span>
                    </div>
                  </div>

                  <div className={styles.menuDivider} />

                  <button
                    type="button"
                    className={`${styles.menuItem} ${isOnline && hasActiveOrders ? styles.menuItemDisabled : ''}`}
                    onClick={() => {
                      handleToggleDuty();
                    }}
                    disabled={isTogglingStatus || (isOnline && hasActiveOrders)}
                    title={
                      isOnline && hasActiveOrders
                        ? 'Cannot go offline while you have active deliveries'
                        : isOnline
                        ? 'Switch to Offline'
                        : 'Switch to Online'
                    }
                  >
                    <span className={`${styles.statusDot} ${isOnline ? styles.dotOnline : styles.dotOffline}`} />
                    <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
                    {isOnline && hasActiveOrders && (
                      <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={12} /> Active Task
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileOpen(false);
                    }}
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => {
                      setActiveTab('history');
                      setIsProfileOpen(false);
                    }}
                  >
                    <PackageCheck size={16} />
                    <span>View Orders</span>
                  </button>

                  {isAdminPreview ? (
                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/delivery-agents');
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>Back to Admin Portal</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/');
                      }}
                    >
                      <Store size={16} />
                      <span>View Storefront</span>
                    </button>
                  )}

                  <div className={styles.menuDivider} />

                  <button
                    type="button"
                    className={`${styles.menuItem} ${isAdminPreview ? styles.menuItemDisabled : styles.menuItemDanger}`}
                    disabled={isAdminPreview}
                    title={isAdminPreview ? 'Logout is disabled in Supervisor mode' : 'Log Out'}
                    onClick={() => {
                      if (isAdminPreview) return;
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out {isAdminPreview ? '(Disabled)' : ''}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.mainContainer}>
        {/* Greeting Bar & Operational Stats Row (shown only on Home / Active task tab) */}
        {activeTab === 'active' && (
          <>
            <section className={styles.greetingBar}>
              <div className={styles.greetingText}>
                <span className={styles.greetingSub}>{greeting}</span>
                <h2 className={styles.greetingName}>{agentName}</h2>
              </div>

              <div className={styles.statusSyncWidget}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOnline}
                  className={`${styles.toggleBtn} ${isOnline ? styles.toggleBtnOnline : styles.toggleBtnOffline}`}
                  onClick={handleToggleDuty}
                  disabled={isTogglingStatus || (isOnline && hasActiveOrders)}
                  title={
                    isOnline && hasActiveOrders
                      ? 'Cannot go offline while you have active delivery tasks. Please complete ongoing deliveries first.'
                      : isOnline
                      ? 'Online (Click to toggle Offline)'
                      : 'Offline (Click to toggle Online)'
                  }
                  style={
                    isOnline && hasActiveOrders
                      ? { cursor: 'not-allowed', opacity: 0.85 }
                      : undefined
                  }
                  aria-label={
                    isOnline && hasActiveOrders
                      ? 'Cannot go offline with active delivery tasks in progress'
                      : isOnline
                      ? 'Duty status is Online. Click to switch Offline'
                      : 'Duty status is Offline. Click to switch Online'
                  }
                >
                  <span className={`${styles.switchTrack} ${isOnline ? styles.switchOnline : styles.switchOffline}`}>
                    <span className={`${styles.switchThumb} ${isOnline ? styles.thumbOnline : styles.thumbOffline}`} />
                  </span>
                  <span className={`${styles.toggleLabel} ${isOnline ? styles.labelOnline : styles.labelOffline}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </button>

                {isOnline && hasActiveOrders && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#92400E',
                      background: '#FEF3C7',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #FCD34D',
                      whiteSpace: 'nowrap',
                    }}
                    title="You cannot go offline while an order delivery is in progress"
                  >
                    <Lock size={11} />
                    <span>In Delivery</span>
                  </span>
                )}

                <div className={styles.segmentDivider} aria-hidden="true" />

                <button
                  type="button"
                  className={styles.refreshSegment}
                  onClick={() => loadPortalData(true)}
                  disabled={isRefreshing}
                  title="Refresh assigned tasks"
                  aria-label="Refresh tasks"
                >
                  <RefreshCw size={15} className={isRefreshing ? styles.spinning : ''} />
                </button>
              </div>
            </section>

            {/* Operational Stats Row */}
            <section className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statLabel}>Total Today</span>
                  <Package size={14} className={styles.statHeaderIcon} style={{ color: '#8C7567' }} />
                </div>
                <span className={styles.statValue}>
                  {(profile?.todayDeliveries && profile.todayDeliveries > 0)
                    ? profile.todayDeliveries
                    : (activeOrder ? 1 : 0) + completedOrders.length}
                </span>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statLabel}>Active Task</span>
                  <Clock size={14} className={styles.statHeaderIcon} style={{ color: '#B45309' }} />
                </div>
                <span className={`${styles.statValue} ${activeOrder ? styles.statValueAccent : ''}`}>
                  {activeOrder ? '1' : '0'}
                </span>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statLabel}>Completed</span>
                  <CheckCircle2 size={14} className={styles.statHeaderIcon} style={{ color: '#0D9488' }} />
                </div>
                <span className={`${styles.statValue} ${styles.statValueSuccess}`}>
                  {completedOrders.length}
                </span>
              </div>
            </section>
          </>
        )}


        {/* Tab 1: Active Task View */}
        {activeTab === 'active' && (
          <AnimatePresence mode="wait">
            {activeOrder ? (
              <motion.div
                key="ongoing-active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {renderOngoingDeliveryCard(activeOrder)}
              </motion.div>
            ) : (
              <motion.div
                key="caught-up"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={styles.emptyCard}
              >
                <div className={styles.emptyIconCircle}>
                  <PackageCheck size={36} />
                </div>
                <h3 className={styles.emptyTitle}>You are all caught up</h3>
                <p className={styles.emptyDesc}>
                  {isOnline
                    ? 'You are online and ready for assignments. As soon as a delivery is dispatched, it will appear here.'
                    : 'You are currently offline. Switch your status to Online to receive new delivery assignments.'}
                </p>

                <div className={styles.emptyActionRow}>
                  {!isOnline ? (
                    <button
                      type="button"
                      className={styles.primaryActionBtn}
                      onClick={handleToggleDuty}
                      style={{ padding: '12px 24px', width: 'auto' }}
                    >
                      <Power size={18} />
                      <span>Go Online</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.secondaryActionBtn}
                      onClick={() => loadPortalData(true)}
                      style={{ padding: '12px 24px', width: 'auto' }}
                    >
                      <RefreshCw size={16} />
                      <span>Check For Orders</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Tab 2: Deliveries History View */}
        {activeTab === 'history' && (
          <div className={styles.historySectionWrapper}>
            {/* Completed Deliveries Section */}
            <div className={styles.historySectionHeader}>
              <div>
                <h2 className={styles.historySectionTitle}>Completed Deliveries</h2>
                <p className={styles.historySectionSubtitle}>
                  {completedOrders.length} {completedOrders.length === 1 ? 'order' : 'orders'} delivered
                </p>
              </div>
              <span className={styles.historyCountBadge}>
                {completedOrders.length} Total
              </span>
            </div>

            <div className={styles.historySectionDivider} />

            <section className={styles.historyList}>
            {completedOrders.length === 0 ? (
              <div className={styles.emptyCard}>
                <div className={styles.emptyIconCircle}>
                  <Clock size={32} />
                </div>
                <h3 className={styles.emptyTitle}>No Completed Deliveries Yet</h3>
                <p className={styles.emptyDesc}>
                  Deliveries you complete successfully via OTP verification will appear in this history log.
                </p>
              </div>
            ) : (
              completedOrders.map((order) => {
                const totalItemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || order.items?.length || 1;
                const firstItem = order.items?.[0];
                const firstItemName = firstItem?.name || 'Artisan Cake Pops';
                const productImage = getProductImage(firstItem);
                const hasMoreItems = (order.items?.length || 0) > 1;
                const formattedDate = order.delivery?.deliveredAt
                  ? new Date(order.delivery.deliveredAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : new Date(order.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });

                return (
                  <div
                    key={order._id}
                    className={styles.storefrontOrderCard}
                    onClick={() =>
                      navigate(`/delivery/orders/${order.orderNumber || order._id}${location.search}`, {
                        state: { order },
                      })
                    }
                    style={{ cursor: 'pointer' }}
                    title="View Full Live Route & Order Details"
                  >
                    {/* Storefront-Style Card Header */}
                    <div className={styles.orderCardHeader}>
                      <div className={styles.orderStatusGroup}>
                        <CheckCircle2 size={14} className={styles.orderStatusIcon} />
                        <span className={styles.orderStatusLabel}>DELIVERED</span>
                        <span className={styles.orderDateText}>• {formattedDate}</span>
                      </div>
                      <span className={styles.orderNumberBadge}>
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {/* Storefront-Style Card Body */}
                    <div className={styles.orderCardBody}>
                      <OrderItemsImageStack items={order.items} />

                      <div className={styles.orderCardMain}>
                        {(() => {
                          const hAddr = order.shippingAddress || (order as any).address || (order as any).delivery?.addressSnapshot;
                          const custName = hAddr?.recipientName || hAddr?.customerName || order.customerName || 'Customer';
                          const cityPart = hAddr?.city || hAddr?.area || hAddr?.street || hAddr?.line1;
                          const pinPart = hAddr?.pincode || hAddr?.zipCode;
                          const addressSnippet = [cityPart, pinPart].filter(Boolean).join(' - ') || 'Local Delivery';
                          return (
                            <>
                              <div className={styles.customerNameRow}>
                                <h4 className={styles.customerName}>
                                  {custName}
                                </h4>
                                <span className={styles.orderTotalAmount}>₹{order.total}</span>
                              </div>

                              <div className={styles.orderAddressRow}>
                                <MapPin size={11} className={styles.addressIcon} />
                                <span className={styles.addressText}>
                                  {addressSnippet}
                                </span>
                              </div>
                            </>
                          );
                        })()}

                        <p className={styles.orderItemsSnippet}>
                          {firstItemName}
                          {hasMoreItems ? ` (+${order.items!.length - 1} more)` : ` (1 item)`}
                        </p>
                      </div>
                    </div>

                    {/* Storefront-Style Card Footer */}
                    <div className={styles.orderCardFooter}>
                      <div className={styles.orderPillsGroup}>
                        <span className={styles.otpVerifiedPill}>
                          <Check size={11} strokeWidth={3} /> OTP Verified
                        </span>
                        <span
                          className={`${styles.paymentStatusPill} ${
                            order.paymentMethod === 'cod'
                              ? styles.paymentCodPill
                              : styles.paymentPrepaidPill
                          }`}
                        >
                          {order.paymentMethod === 'cod' ? (
                            'COD Collected'
                          ) : (
                            <>
                              <Check size={11} strokeWidth={3} /> Prepaid
                            </>
                          )}
                        </span>
                      </div>
                      <span className={styles.viewOrderLink}>
                        View Details →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      )}

        {/* Tab 3: Minimal Profile View */}
        {activeTab === 'profile' && (
          <div className={styles.profileSectionWrapper}>
            {/* Minimal Hero Card */}
            <section className={styles.profileHeroCard}>
              <div className={styles.profileHeroMain}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.profileAvatarLarge}>
                    {getInitials(agentName)}
                  </div>
                  <span
                    className={`${styles.avatarStatusBadge} ${
                      isOnline ? styles.avatarOnline : styles.avatarOffline
                    }`}
                    title={isOnline ? 'Online' : 'Offline'}
                  />
                </div>

                <div className={styles.profileHeroInfo}>
                  <div className={styles.nameRow}>
                    <h2 className={styles.profileHeroName}>{agentName}</h2>
                    <span
                      className={styles.verifiedTickBadge}
                      title="Verified Partner"
                      aria-label="Verified Partner"
                    >
                      <Check size={11} strokeWidth={3.5} />
                    </span>
                  </div>

                  <p className={styles.profileRoleText}>
                    Delivery Partner <span className={styles.metaDot}>•</span> {profile?._id ? (profile._id.startsWith('agent_') ? profile._id.replace('agent_', 'DA-').toUpperCase() : `#${profile._id.slice(-6).toUpperCase()}`) : 'DA-1048'}
                  </p>
                </div>
              </div>
            </section>

            {/* Minimal 3-Segment Metric Strip */}
            <div className={styles.minimalStatsCard}>
              <div className={styles.minimalStatItem}>
                <span className={styles.minimalStatVal}>
                  {profile?.completedDeliveries ?? completedOrders.length}
                </span>
                <span className={styles.minimalStatLabel}>Lifetime Orders</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.minimalStatItem}>
                <span className={styles.minimalStatVal}>
                  {profile?.todayDeliveries ?? ((activeOrder ? 1 : 0) + completedOrders.length)}
                </span>
                <span className={styles.minimalStatLabel}>Today</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.minimalStatItem}>
                <span className={styles.minimalStatVal}>100%</span>
                <span className={styles.minimalStatLabel}>Fulfillment</span>
              </div>
            </div>

            {/* Minimal Duty Availability Row */}
            <section className={styles.minimalDutyCard}>
              <div className={styles.dutyLabelGroup}>
                <span className={styles.dutyTitle}>Duty Availability</span>
                <span className={styles.dutySubtitle}>
                  {isOnline
                    ? hasActiveOrders
                      ? 'Online • Active delivery task in progress (Cannot go offline)'
                      : 'Online • Accepting orders'
                    : 'Offline • Off duty'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isOnline && hasActiveOrders && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#92400E',
                      background: '#FEF3C7',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #FCD34D',
                      whiteSpace: 'nowrap',
                    }}
                    title="Active delivery task in progress"
                  >
                    <Lock size={12} />
                    <span>In Delivery</span>
                  </span>
                )}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOnline}
                  className={`${styles.toggleBtn} ${isOnline ? styles.toggleBtnOnline : styles.toggleBtnOffline}`}
                  onClick={handleToggleDuty}
                  disabled={isTogglingStatus || (isOnline && hasActiveOrders)}
                  title={
                    isOnline && hasActiveOrders
                      ? 'Cannot go offline while you have active delivery tasks. Please complete ongoing deliveries first.'
                      : isOnline
                      ? 'Online (Click to toggle Offline)'
                      : 'Offline (Click to toggle Online)'
                  }
                  style={
                    isOnline && hasActiveOrders
                      ? { cursor: 'not-allowed', opacity: 0.85 }
                      : undefined
                  }
                  aria-label={isOnline ? 'Duty status is Online' : 'Duty status is Offline'}
                >
                  <span className={`${styles.switchTrack} ${isOnline ? styles.switchOnline : styles.switchOffline}`}>
                    <span className={`${styles.switchThumb} ${isOnline ? styles.thumbOnline : styles.thumbOffline}`} />
                  </span>
                  <span className={`${styles.toggleLabel} ${isOnline ? styles.labelOnline : styles.labelOffline}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </button>
              </div>
            </section>

            {/* Minimal Account Details */}
            <section className={styles.minimalCard}>
              <div className={styles.minimalRow}>
                <span className={styles.rowLabel}>Email</span>
                <span className={styles.rowValue}>{agentEmail}</span>
              </div>
              <div className={styles.rowDivider} />
              <div className={styles.minimalRow}>
                <span className={styles.rowLabel}>Phone</span>
                <span className={styles.rowValue}>{agentPhone}</span>
              </div>
              <div className={styles.rowDivider} />
              <div className={styles.minimalRow}>
                <span className={styles.rowLabel}>City</span>
                <span className={styles.rowValue}>{agentCity}</span>
              </div>
            </section>

            {/* Minimal Storefront / Back to Admin Button */}
            {isAdminPreview ? (
              <button
                type="button"
                className={styles.minimalStorefrontBtn}
                onClick={() => navigate('/admin/delivery-agents')}
              >
                <div className={styles.minimalStorefrontLeft}>
                  <ShieldCheck size={16} />
                  <span>Back to Admin Portal</span>
                </div>
                <ExternalLink size={14} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.minimalStorefrontBtn}
                onClick={() => navigate('/')}
              >
                <div className={styles.minimalStorefrontLeft}>
                  <Store size={16} />
                  <span>Customer Storefront</span>
                </div>
                <ExternalLink size={14} />
              </button>
            )}

            {/* Minimal Logout Button */}
            <button
              type="button"
              className={`${styles.minimalLogoutBtn} ${isAdminPreview ? styles.minimalBtnDisabled : ''}`}
              disabled={isAdminPreview}
              title={isAdminPreview ? 'Logout is disabled in Supervisor mode' : 'Log Out'}
              onClick={() => {
                if (isAdminPreview) {
                  showToast('Logout is disabled while previewing in supervisor mode', 'info');
                  return;
                }
                handleLogout();
              }}
            >
              <LogOut size={16} />
              <span>Log Out {isAdminPreview ? '(Disabled)' : ''}</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className={styles.mobileBottomNav} aria-label="Mobile Navigation">
        <button
          type="button"
          className={`${styles.bottomNavBtn} ${activeTab === 'active' ? styles.bottomNavBtnActive : ''}`}
          onClick={() => setActiveTab('active')}
          aria-label="Home"
        >
          <div className={styles.bottomNavIconContainer}>
            <Home size={20} strokeWidth={activeTab === 'active' ? 2.1 : 1.6} />
          </div>
          <span className={styles.bottomNavLabel}>Home</span>
          {activeTab === 'active' && <span className={styles.activeDot} />}
        </button>

        <button
          type="button"
          className={`${styles.bottomNavBtn} ${activeTab === 'history' ? styles.bottomNavBtnActive : ''}`}
          onClick={() => setActiveTab('history')}
          aria-label="Deliveries"
        >
          <div className={styles.bottomNavIconContainer}>
            <History size={20} strokeWidth={activeTab === 'history' ? 2.1 : 1.6} />
          </div>
          <span className={styles.bottomNavLabel}>Deliveries</span>
          {activeTab === 'history' && <span className={styles.activeDot} />}
        </button>

        <button
          type="button"
          className={`${styles.bottomNavBtn} ${activeTab === 'profile' ? styles.bottomNavBtnActive : ''}`}
          onClick={() => setActiveTab('profile')}
          aria-label="Profile"
        >
          <div className={styles.bottomNavIconContainer}>
            <User size={20} strokeWidth={activeTab === 'profile' ? 2.1 : 1.6} />
          </div>
          <span className={styles.bottomNavLabel}>Profile</span>
          {activeTab === 'profile' && <span className={styles.activeDot} />}
        </button>
      </nav>

      {/* Mobile App Drawer for Customer OTP Verification */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={styles.drawerIconBadge}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className={styles.drawerHeaderTitle}>Customer Delivery OTP</h3>
                    <p className={styles.drawerHeaderSubtitle}>
                      {activeOngoing?.shippingAddress?.recipientName || activeOngoing?.customerName || 'Customer'} &bull; Order #{activeOngoing?.orderNumber || activeOngoing?._id?.slice(-6).toUpperCase() || 'CPR-10482'}
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
                  orderTotal={activeOngoing?.total}
                  isCod={(activeOngoing?.paymentMethod || (activeOngoing as any)?.payment?.method || '').toLowerCase() === 'cod'}
                />
              ) : (
                <>
                  {/* Instruction Row with COD / Prepaid info & Resend Button */}
                  <div className={styles.drawerInstructionRow}>
                    <span className={styles.otpDrawerSub}>
                      {(activeOngoing?.paymentMethod || (activeOngoing as any)?.payment?.method || '').toLowerCase() === 'cod'
                        ? `Collect ₹${activeOngoing.total} Cash & ask customer for 6-digit OTP`
                        : 'Ask customer for 6-digit delivery verification OTP'}
                    </span>
                    <button
                      type="button"
                      className={styles.otpResendBtn}
                      onClick={() => activeOngoing && handleSendOtp(activeOngoing._id)}
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>

                  {/* Expired OTP Alert Banner with Prominent Resend Button */}
                  {Boolean(activeOngoing?.delivery?.otpExpiresAt && new Date(activeOngoing.delivery.otpExpiresAt).getTime() < Date.now()) && (
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
                        onClick={() => activeOngoing && handleSendOtp(activeOngoing._id)}
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
                    onClick={() => activeOngoing && handleCompleteDelivery(activeOngoing)}
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

export default DeliveryAgentPortal;
