import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, CheckCircle, AlertTriangle, Edit2, X, Hash, Calendar, Truck,
  Mail, Phone, Copy, Check, ExternalLink, MapPin, CreditCard, Package, Clock, ShieldCheck,
  CheckCircle2, AlertCircle, ShoppingBag
} from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './AdminOrderDetail.module.css';

import { adminOrderData } from '@/features/admin/api/adminDataProvider';
import { AdminOrderDetailSkeleton } from '@/features/admin/components/AdminOrderDetailSkeleton';
import { useToast } from '@/components/ui/ToastContext';
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer';
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { CustomSelect } from '@/features/admin/components/CustomSelect';
import { OrderStatusDropdown } from '@/features/admin/components/OrderStatusDropdown';

const ALL_STATUSES = ['Pending', 'Confirmed', 'Being Baked', 'Dispatched', 'Delivered', 'Cancelled'];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock size={16} />,
  Confirmed: <CheckCircle size={16} />,
  'Being Baked': <Package size={16} />,
  Dispatched: <Truck size={16} />,
  Delivered: <CheckCircle size={16} />,
  Cancelled: <X size={16} />,
};

export function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [orderStatuses, setOrderStatuses] = useState<string[]>([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Status Update State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit Shipping State
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState<any>({});


  // Delivery Agent Assignment State
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    if (orderId) {
      Promise.all([
        adminOrderData.getOrderById(orderId),
        adminOrderData.getOrderStatuses(),
        adminOrderData.getDeliveryAgents(),
      ]).then(([fetchedOrder, statuses, agents]) => {
        setOrder(fetchedOrder);
        const addr = fetchedOrder?.address || (fetchedOrder as any)?.shippingAddress || (fetchedOrder as any)?.delivery?.addressSnapshot || {};
        setShippingForm(addr);
        setOrderStatuses(statuses || ALL_STATUSES);
        if (Array.isArray(agents)) {
          setAvailableAgents(agents.filter((a: any) => a.isActive !== false));
        }
        setIsLoading(false);
      }).catch(err => {
        console.error('Failed to fetch order details:', err);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const handleCopyOrderId = () => {
    const idToCopy = order?.orderId || order?.id || order?._id || orderId;
    if (idToCopy) {
      navigator.clipboard.writeText(String(idToCopy));
      setIsCopied(true);
      toast({
        type: 'success',
        title: 'Copied',
        message: 'Order ID copied to clipboard',
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleStatusUpdate = (label: string) => {
    setIsActionLoading(true);
    setTimeout(() => {
      const newEvent = {
        id: `t${Date.now()}`,
        event: `Status updated to ${label}`,
        timestamp: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
        note: ''
      };

      adminOrderData.updateOrder(order.id, { 
        status: label, 
        timeline: [...(order.timeline || []), newEvent] 
      }).then((updatedOrder) => {
        if (updatedOrder) {
          setOrder(updatedOrder);
        }
      });
      setIsActionLoading(false);
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      
      toast({
        type: 'success',
        title: 'Status Updated',
        message: `Order status successfully changed to ${label}.`
      });
    }, 800);
  };

  const handleCancelOrder = () => {
    setConfirmAction({
      type: 'cancel',
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This action cannot be undone and will prevent further fulfillment.',
      buttonText: 'Cancel Order',
      isDestructive: true,
      onConfirm: () => {
        setIsActionLoading(true);
        setTimeout(() => {
          const newEvent = {
            id: `t${Date.now()}`,
            event: 'Order Cancelled',
            timestamp: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
            note: 'Cancelled by Administrator'
          };
          adminOrderData.updateOrder(order.id, { 
            status: 'Cancelled', 
            timeline: [...(order.timeline || []), newEvent] 
          }).then((updatedOrder) => {
            if (updatedOrder) {
              setOrder(updatedOrder);
            }
          });
          setIsActionLoading(false);
          setIsConfirmModalOpen(false);
          toast({
            type: 'error',
            title: 'Order Cancelled',
            message: 'The order has been cancelled.'
          });
        }, 800);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setTimeout(() => {
      adminOrderData.updateOrder(order.id, { address: shippingForm }).then((updatedOrder) => {
        if (updatedOrder) {
          setOrder(updatedOrder);
        }
      });
      setIsActionLoading(false);
      setIsEditingShipping(false);
      toast({
        type: 'success',
        title: 'Address Updated',
        message: 'Shipping information saved successfully.'
      });
    }, 600);
  };


  const handleAssignAgent = async () => {
    if (!selectedAgentId || !order?.id) return;
    setIsActionLoading(true);
    try {
      await adminOrderData.updateOrder(order.id, {
        status: 'Dispatched',
        agentId: selectedAgentId,
      } as any);
      toast({
        type: 'success',
        title: 'Order Dispatched',
        message: 'Delivery partner assigned and order dispatched! Live GPS tracking and 6-digit OTP activated.',
      });
      const updated = await adminOrderData.getOrderById(order.id);
      if (updated) {
        setOrder(updated);
      }
      setIsReassigning(false);
      setSelectedAgentId('');
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.response?.data?.message || err.message || 'Failed to dispatch order',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    if (!order?.id) return;
    setIsActionLoading(true);
    try {
      await adminOrderData.approveOrder(order.id);
      toast({
        type: 'success',
        title: 'Order Approved',
        message: 'Order moved to Being Baked (Kitchen Preparation).',
      });
      const updated = await adminOrderData.getOrderById(order.id);
      if (updated) setOrder(updated);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Approval Failed',
        message: err.response?.data?.message || err.message || 'Failed to approve order',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkOrderReady = async () => {
    if (!order?.id) return;
    setIsActionLoading(true);
    try {
      await adminOrderData.markOrderReady(order.id);
      toast({
        type: 'success',
        title: 'Order Ready for Pickup',
        message: 'Order is packed and ready for delivery partner assignment.',
      });
      const updated = await adminOrderData.getOrderById(order.id);
      if (updated) setOrder(updated);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || err.message || 'Failed to mark order ready',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDispatchWithAgent = async (agentId: string) => {
    if (!order?.id || !agentId) return;
    setIsActionLoading(true);
    try {
      await adminOrderData.updateOrder(order.id, {
        status: 'Dispatched',
        agentId,
      } as any);
      toast({
        type: 'success',
        title: 'Order Dispatched',
        message: 'Order dispatched with delivery partner! Live GPS tracking and 6-digit OTP activated.',
      });
      const updated = await adminOrderData.getOrderById(order.id);
      if (updated) setOrder(updated);
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.response?.data?.message || err.message || 'Failed to dispatch order',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const openPendingGate = () => {
    setConfirmAction({
      type: 'pending_gate',
      title: 'Order Pending Approval',
      message: 'This order has not been approved yet. Operational status cannot be updated until the order is approved or cancelled.',
      onApprove: async () => {
        await handleApproveOrder();
        setIsConfirmModalOpen(false);
        setConfirmAction(null);
      },
      onCancel: () => {
        setIsConfirmModalOpen(false);
        setConfirmAction(null);
        handleCancelOrder();
      },
    });
    setIsConfirmModalOpen(true);
  };

  const openDispatchGate = () => {
    setConfirmAction({
      type: 'dispatch_gate',
      title: 'Dispatch Order & Assign Partner',
      message: 'A delivery partner must be selected to dispatch this order. The partner will receive the pickup notification, and the customer will receive live GPS tracking and their 6-digit delivery OTP.',
    });
    setIsConfirmModalOpen(true);
  };

  if (isLoading) {
    return <AdminOrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--admin-text-muted, #64748B)" style={{ marginBottom: '16px' }} />
        <h2 className={styles.title}>Order Not Found</h2>
        <p className={styles.subtitle} style={{ marginBottom: '24px', color: '#6B7280' }}>
          The order &quot;{orderId}&quot; could not be loaded or does not exist.
        </p>
        <button 
          className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
          onClick={() => navigate('/admin/orders')}
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
      </div>
    );
  }

  // Safe normalized variables
  const currentStatusLower = (order.status || '').toLowerCase();
  const orderTimeline = Array.isArray(order.timeline) ? order.timeline : [];
  const itemsList = Array.isArray(order.items) ? order.items : [];

  const customerObj = (typeof order.customer === 'object' && order.customer)
    ? order.customer
    : {
        id: order.user || order._id || '',
        name: order.customer || order.customerName || 'Guest Customer',
        email: order.email || order.customerEmail || '',
        phone: order.phone || order.customerPhone || '',
        ordersCount: order.customerOrdersCount || 1,
      };

  const addressObj = order.address || order.shippingAddress || order.delivery?.addressSnapshot || {};

  const paymentObj = (typeof order.payment === 'object' && order.payment)
    ? order.payment
    : {
        method: order.paymentMethod || 'Online',
        status: order.paymentStatus || 'Pending',
        transactionId: order.transactionId || order.razorpayPaymentId || 'N/A',
        date: order.date || 'N/A',
      };

  const itemSubtotal = order.price?.itemSubtotal ?? 
    order.pricing?.subtotal ?? 
    order.subtotal ?? 
    itemsList.reduce((sum: number, it: any) => sum + (Number(it.unitPrice ?? it.price ?? 0) * (it.qty ?? it.quantity ?? 1)), 0);
  const couponDiscount = order.price?.couponDiscount ?? order.pricing?.discount ?? order.discount ?? 0;
  const deliveryFee = order.price?.deliveryFee ?? order.pricing?.deliveryFee ?? order.deliveryFee ?? order.shippingFee ?? 0;
  const taxes = order.price?.taxes ?? order.pricing?.taxes ?? order.pricing?.tax ?? order.tax ?? 0;
  const amountPaid = order.price?.amountPaid ?? order.pricing?.total ?? order.total ?? (itemSubtotal - couponDiscount + deliveryFee + taxes);

  // Normalize order status to match steps
  const getNormalizedStatus = (s: string) => {
    const lower = (s || '').toLowerCase().trim();
    if (lower.includes('pend') || lower.includes('placed')) return 'Pending';
    if (lower.includes('confirm')) return 'Confirmed';
    if (lower.includes('bak') || lower.includes('prepar') || lower.includes('process') || lower.includes('pack') || lower.includes('ready') || lower.includes('assign') || lower.includes('accept')) return 'Being Baked';
    if (lower.includes('dispatch') || lower.includes('ship') || lower.includes('picked') || lower.includes('out_for') || lower.includes('out for')) return 'Dispatched';
    if (lower.includes('deliver') || lower.includes('complet') || lower.includes('otp_ver')) return 'Delivered';
    if (lower.includes('cancel')) return 'Cancelled';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const normalizedStatus = getNormalizedStatus(order.status || 'Pending');
  const happyPath = ['Pending', 'Confirmed', 'Being Baked', 'Dispatched', 'Delivered'];
  const effectiveStatus = happyPath.includes(normalizedStatus)
    ? normalizedStatus
    : normalizedStatus === 'Cancelled'
      ? 'Cancelled'
      : 'Pending';
  const currentIdx = happyPath.indexOf(effectiveStatus);
  const isCancelled = normalizedStatus === 'Cancelled';

  // Get timeline card background wash
  const getTimelineCardClass = () => {
    if (effectiveStatus === 'Delivered') return styles.timelineDelivered;
    if (effectiveStatus === 'Cancelled') return styles.timelineCancelled;
    if (effectiveStatus === 'Being Baked' || effectiveStatus === 'Dispatched' || effectiveStatus === 'Confirmed') return styles.timelineConfirmed;
    return styles.timelinePending;
  };

  // Status Badge Class
  const getStatusBadgeClass = (s: string) => {
    const norm = getNormalizedStatus(s);
    if (norm === 'Delivered') return styles.statusDelivered;
    if (norm === 'Being Baked' || norm === 'Dispatched') return styles.statusProcessing;
    if (norm === 'Confirmed') return styles.statusConfirmed;
    if (norm === 'Cancelled') return styles.statusCancelled;
    return styles.statusPending;
  };

  const rawPhone = String(customerObj.phone || addressObj.phone || '').replace(/\D/g, '');
  const orderDisplayId = order.orderId || order.id || order._id || orderId;

  const fullShippingAddressString = [
    addressObj.street || addressObj.line1,
    addressObj.city,
    addressObj.state,
    addressObj.pincode || addressObj.zipCode
  ].filter(Boolean).join(', ');

  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullShippingAddressString || 'India')}`;

  return (
    <div className={styles.container}>
      {/* ====================================================================
          1. TOP HEADER (Exact EventDecor OrderHeader Layout & Rounded-[4px])
         ==================================================================== */}
      <div className={styles.headerCard}>
        {/* Left Column: Title and Order ID */}
        <div className={styles.headerLeft}>
          {/* Back Button above Order Details */}
          <div className={styles.backBtnWrapper}>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/admin/orders');
                }
              }}
              className={styles.topBackBtn}
              title="Back to Orders"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          {/* Title Row */}
          <div className={styles.headerTitleRow}>
            <div className={styles.titleGroup}>
              <h2 className={styles.title}>Order Details</h2>
              <span className={styles.typeBadge}>
                {order.orderType || 'Delivery'}
              </span>
            </div>

            {/* Mobile Status and Payment Badges */}
            <div className={styles.mobileBadges}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                {order.status || 'Pending'}
              </span>
              <span className={`${styles.paymentBadge} ${paymentObj.status === 'Paid' ? styles.paymentBadgePaid : styles.paymentBadgePending}`}>
                {paymentObj.status}
              </span>
            </div>
          </div>

          {/* Row 2: Order ID on Left with Copy button, Date on Right on mobile */}
          <div className={styles.headerMetaRow}>
            <div className={styles.orderIdWrapper}>
              <span className={styles.orderIdText}>#{orderDisplayId}</span>
              <button 
                type="button"
                onClick={handleCopyOrderId}
                className={styles.copyBtn}
                title="Copy Order ID"
              >
                {isCopied ? <Check size={14} color="#10B981" /> : <Copy size={13} />}
              </button>
            </div>

            <div className={styles.mobileDateChip}>
              <Clock size={12} />
              <span>Placed {order.date || 'Today'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Date above, Buttons below on desktop */}
        <div className={styles.headerRight}>
          <div className={styles.desktopBadges}>
            <div className={styles.desktopBadgesRow}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                {order.status || 'Pending'}
              </span>
              <span className={`${styles.paymentBadge} ${paymentObj.status === 'Paid' ? styles.paymentBadgePaid : styles.paymentBadgePending}`}>
                {paymentObj.status}
              </span>
            </div>
            <span className={styles.desktopDateChip}>
              <Clock size={12} />
              <span>Placed on {order.date || 'Today'} {order.time ? `at ${order.time}` : ''}</span>
            </span>
          </div>

          {/* Action Buttons: Invoice, WhatsApp */}
          <div className={styles.actionBtnsRow}>
            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
            >
              <FileText size={16} />
              <span>Invoice</span>
            </button>

            {rawPhone && (
              <a
                href={`https://wa.me/${rawPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.headerBtn} ${styles.headerBtnWhatsApp}`}
              >
                <WhatsAppIcon style={{ width: 16, height: 16 }} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. MAIN 2-COLUMN LAYOUT (EventDecor 2/3 Left, 1/3 Right)
         ==================================================================== */}
      <div className={styles.mainGrid}>
        {/* ==================================================================
            LEFT COLUMN: Lifecycle Progression, Ops Banner, Items, Notes
           ================================================================== */}
        <div className={styles.columnLeft}>
          {/* Card: Lifecycle Progression (OrderStatusTimeline) */}
          <div className={`${styles.timelineCard} ${getTimelineCardClass()}`}>
            <div className={styles.timelineHeader}>
              <div>
                <h3 className={styles.cardTitle}>Lifecycle Progression</h3>
                <p className={styles.timelineSubtitle}>Track and override the order&apos;s current stage.</p>
              </div>

              {/* Status Quick Dropdown Selector */}
              <div className={styles.statusSelectWrapper}>
                <OrderStatusDropdown
                  value={effectiveStatus}
                  options={ALL_STATUSES.filter(st => st !== 'Delivered').map(st => ({ value: st, label: st }))}
                  disabled={currentStatusLower === 'pending' || currentStatusLower === 'delivered'}
                  onPendingClick={openPendingGate}
                  onChange={(nextVal) => {
                    if (!nextVal || nextVal === order.status) return;
                    if (currentStatusLower === 'pending') {
                      openPendingGate();
                      return;
                    }
                    if (nextVal === 'Dispatched') {
                      const hasAgent = Boolean(order.deliveryAgent || order.delivery?.agentId);
                      if (!hasAgent) {
                        openDispatchGate();
                        return;
                      }
                    }
                    setConfirmAction({
                      type: 'status',
                      title: 'Update Order Status',
                      message: `Are you sure you want to change the status of this order to ${nextVal}?`,
                      buttonText: 'Update Status',
                      label: nextVal,
                      onConfirm: () => handleStatusUpdate(nextVal)
                    });
                    setIsConfirmModalOpen(true);
                  }}
                  variant="timeline"
                  leftIcon={<Clock size={14} style={{ color: '#6B7280' }} />}
                  align="right"
                />
              </div>
            </div>

            {/* Horizontal Timeline Track */}
            <div className={styles.timelineTrackSection}>
              <div className={styles.timelineTrack}>
                {/* Thin Background Progress Line */}
                <div className={styles.timelineProgressLineBg}>
                  {!isCancelled && currentIdx >= 0 && (
                    <div 
                      className={styles.timelineProgressLineFill}
                      style={{ width: `${(currentIdx / (happyPath.length - 1)) * 100}%` }}
                    />
                  )}
                </div>

                {happyPath.map((step, idx) => {
                  const isActive = effectiveStatus === step && !isCancelled;
                  const isCompleted = currentIdx >= idx && !isCancelled;

                  return (
                    <div key={step} className={styles.timelineNodeCol}>
                      <button
                        type="button"
                        onClick={() => {
                          if (step === effectiveStatus) return;
                          // PENDING gate: intercept all step clicks
                          if (currentStatusLower === 'pending') {
                            openPendingGate();
                            return;
                          }
                          // Block manual DELIVERED (only OTP can deliver)
                          if (step === 'Delivered') {
                            toast({
                              type: 'error',
                              title: 'Action Not Allowed',
                              message: 'Orders can only be marked Delivered through customer OTP verification by the delivery agent.',
                            });
                            return;
                          }
                          // Mandatory agent check before moving to Dispatched
                          if (step === 'Dispatched') {
                            const hasAgent = Boolean(order.deliveryAgent || order.delivery?.agentId);
                            if (!hasAgent) {
                              openDispatchGate();
                              return;
                            }
                          }
                          const stepIdx = happyPath.indexOf(step);
                          const isBackward = stepIdx < currentIdx;
                          setConfirmAction({
                            type: 'status',
                            title: isBackward ? 'Revert Order Status' : 'Update Order Status',
                            message: isBackward
                              ? `Are you sure you want to move this order back to ${step}? This will revert the current progress.`
                              : `Are you sure you want to advance this order to ${step}?`,
                            buttonText: isBackward ? 'Revert Status' : 'Update Status',
                            label: step,
                            onConfirm: () => handleStatusUpdate(step)
                          });
                          setIsConfirmModalOpen(true);
                        }}
                        className={styles.timelineNodeBtn}
                        title={`Set status to ${step}`}
                      >
                        {isActive && <div className={styles.timelinePulseRing} />}
                        <div
                          className={`
                            ${styles.timelineNode} 
                            ${isActive ? styles.timelineNodeActive : ''} 
                            ${isCompleted && !isActive ? styles.timelineNodeCompleted : ''}
                          `}
                        >
                          {isCompleted && !isActive ? (
                            <Check size={18} strokeWidth={3} />
                          ) : (
                            STATUS_ICONS[step] || <Clock size={16} />
                          )}
                        </div>
                      </button>
                      <span
                        className={`
                          ${styles.timelineStepLabel}
                          ${isActive ? styles.timelineStepLabelActive : ''}
                          ${isCompleted && !isActive ? styles.timelineStepLabelCompleted : ''}
                        `}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isCancelled && (
              <div className={styles.cancelledBanner}>
                <AlertCircle size={16} />
                <span>This order is cancelled and fulfillment has been terminated.</span>
              </div>
            )}
          </div>

          {/* Operational Workflow Action Banner (Bakery Workflow) */}
          {order.status !== 'DELIVERED' && order.status !== 'Cancelled' && (
            <div className={styles.opsBanner}>
              <div>
                <span className={styles.opsStepTitle}>Operational Workflow Step</span>
                <div className={styles.opsStepDesc}>
                  {currentStatusLower === 'pending' &&
                    'Order Pending — Awaiting Admin Approval'}
                  {(order.internalStatus === 'CONFIRMED' || currentStatusLower === 'confirmed') && currentStatusLower !== 'pending' &&
                    'Order is Confirmed and awaiting Kitchen Preparation'}
                  {(order.internalStatus === 'PREPARING' || currentStatusLower === 'being baked') && order.internalStatus !== 'READY_FOR_PICKUP' &&
                    'Baking & Packing in Progress in Kitchen'}
                  {order.internalStatus === 'READY_FOR_PICKUP' &&
                    'Order is Packed & Ready for Delivery Partner Assignment'}
                  {order.internalStatus === 'ASSIGNED' &&
                    'Delivery Partner Assigned — Awaiting Driver Acceptance in Portal'}
                  {order.internalStatus === 'AGENT_ACCEPTED' &&
                    'Driver Accepted — Arriving at Kitchen for Collection'}
                  {(order.internalStatus === 'DISPATCHED' || currentStatusLower === 'dispatched' || currentStatusLower === 'shipped') &&
                    'Out for Delivery — Live GPS Active (Customer Verified by OTP)'}
                </div>
              </div>

              <div className={styles.opsActions}>
                {(order.internalStatus === 'CONFIRMED' || currentStatusLower === 'confirmed' || currentStatusLower === 'pending') && (
                  <button
                    type="button"
                    className={styles.opsBtn}
                    onClick={handleApproveOrder}
                    disabled={isActionLoading}
                  >
                    Approve & Start Baking
                  </button>
                )}

                {/* Mark Ready for Pickup hidden per request - status progression handled via Lifecycle Progression dropdown */}

                <button
                  type="button"
                  className={styles.opsCancelBtn}
                  onClick={handleCancelOrder}
                  disabled={isActionLoading}
                >
                  <X size={15} strokeWidth={2.5} />
                  <span>Cancel Order</span>
                </button>
              </div>
            </div>
          )}

          {/* Card: Order Items (Matches EventDecor OrderItems Layout) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <ShoppingBag size={18} className={styles.cardTitleIcon} />
                <span>Order Items</span>
              </h3>
              <span className={styles.cardBadge}>
                {itemsList.length} Items
              </span>
            </div>

            <div className={styles.itemsList}>
              {itemsList.map((item: any, idx: number) => {
                const itemQty = item.qty ?? item.quantity ?? 1;
                const itemUnitPrice = Number(item.unitPrice ?? item.price ?? 0);
                const itemTotal = Number(item.subtotal ?? (itemUnitPrice * itemQty));

                return (
                  <div key={item.id || item._id || `item-${idx}`} className={styles.itemRow}>
                    {/* Thumbnail Image */}
                    <div className={styles.itemImageWrapper}>
                      <img 
                        src={item.image || item.imageSrc || '/placeholder.png'} 
                        alt={item.name || 'Product'} 
                        className={styles.itemImage}
                      />
                    </div>

                    {/* Details & Price Breakdown */}
                    <div className={styles.itemContent}>
                      <div>
                        <h4 className={styles.itemName}>{item.name || item.title || 'Product'}</h4>
                        <p className={styles.itemSku}>{item.sku || 'SKU-STANDARD'}</p>
                      </div>

                      <div className={styles.itemStatsRow}>
                        <div className={styles.itemStatsCols}>
                          <div className={styles.itemStatCol}>
                            <span className={styles.statColLabel}>Price</span>
                            <span className={styles.statColValue}>₹{itemUnitPrice}</span>
                          </div>
                          <div className={styles.itemStatCol}>
                            <span className={styles.statColLabel}>Qty</span>
                            <span className={styles.statColValue}>{itemQty}</span>
                          </div>
                        </div>

                        <div className={styles.itemSubtotalBox}>
                          <span className={styles.itemSubtotalLabel}>Subtotal</span>
                          <span className={styles.itemSubtotalVal}>₹{itemTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Totals Footer (EventDecor Financial Summary) */}
            <div className={styles.orderFooter}>
              <div className={styles.totalsRow}>
                <span>Subtotal</span>
                <span className={styles.totalsRowVal}>₹{itemSubtotal}</span>
              </div>
              {couponDiscount > 0 && (
                <div className={styles.totalsRow}>
                  <span>Coupon Discount</span>
                  <span className={styles.totalsRowVal} style={{ color: '#EF4444' }}>-₹{couponDiscount}</span>
                </div>
              )}
              <div className={styles.totalsRow}>
                <span>Delivery Fee</span>
                <span className={styles.totalsRowVal}>₹{deliveryFee}</span>
              </div>
              <div className={styles.totalsRow}>
                <span>Tax</span>
                <span className={styles.totalsRowVal}>₹{taxes}</span>
              </div>
              <div className={`${styles.totalsRow} ${styles.totalsRowGrand}`}>
                <span>Total</span>
                <span className={styles.grandTotalVal}>₹{amountPaid}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ==================================================================
            RIGHT COLUMN: Shipping Profile, Delivery, Settlement, Danger Zone
           ================================================================== */}
        <div className={styles.columnRight}>
          {/* Card: Shipping Profile (Matches EventDecor OrderShipping) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Truck size={18} className={styles.cardTitleIcon} />
                <span>Shipping Profile</span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.cardBadge}>
                  {order.orderType || 'Standard'}
                </span>
                {customerObj.id && (
                  <Link 
                    to={`/admin/customers/${customerObj.id}`} 
                    className={styles.cardActionLink}
                    title="View Customer Profile"
                  >
                    <span>Profile</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>

            <div className={styles.cardBody}>
              {/* Customer Avatar & Contacts */}
              <div className={styles.customerHeaderBlock}>
                <div className={styles.customerAvatar}>
                  {(customerObj.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div className={styles.customerInfo}>
                  <div className={styles.customerNameRow}>
                    {customerObj.id ? (
                      <Link to={`/admin/customers/${customerObj.id}`} className={styles.customerName}>
                        {customerObj.name}
                        <ExternalLink size={12} />
                      </Link>
                    ) : (
                      <span className={styles.customerName}>{customerObj.name}</span>
                    )}
                  </div>
                  <div className={styles.customerContactList}>
                    <span className={styles.contactItem}>
                      <Phone size={13} color="#9CA3AF" />
                      {customerObj.phone || 'No phone provided'}
                    </span>
                    <span className={styles.contactItem}>
                      <Mail size={13} color="#9CA3AF" />
                      {customerObj.email || 'No email provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.addressDivider} />

              {/* Shipping Address & Google Maps link */}
              {isEditingShipping ? (
                <form onSubmit={handleSaveShipping} className={styles.shippingEditForm} style={{ padding: 0 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Recipient Name</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={shippingForm.recipientName || ''} 
                      onChange={e => setShippingForm({...shippingForm, recipientName: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={shippingForm.phone || ''} 
                      onChange={e => setShippingForm({...shippingForm, phone: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Street Address</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={shippingForm.street || ''} 
                      onChange={e => setShippingForm({...shippingForm, street: e.target.value})} 
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>City</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={shippingForm.city || ''} 
                        onChange={e => setShippingForm({...shippingForm, city: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>PIN Code</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={shippingForm.pincode || ''} 
                        onChange={e => setShippingForm({...shippingForm, pincode: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={`${styles.headerBtn} ${styles.headerBtnOutline}`} 
                      style={{ height: '34px', padding: '0 12px' }}
                      onClick={() => { setIsEditingShipping(false); setShippingForm(addressObj); }}
                      disabled={isActionLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.opsBtn} 
                      style={{ height: '34px', padding: '0 14px' }}
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.addressBlock}>
                  <div className={styles.addressIconWrap}>
                    <MapPin size={20} />
                  </div>
                  <div className={styles.addressDetails}>
                    <div className={styles.addressHeaderRow}>
                      <span className={styles.addressSectionTitle}>Shipping Address</span>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mapsLink}
                        title="Open shipping address in Google Maps"
                      >
                        <MapPin size={12} />
                        <span>Open in Maps</span>
                      </a>
                    </div>
                    <p className={styles.recipientName}>{addressObj.recipientName || customerObj.name}</p>
                    <p className={styles.addressLine}>
                      {fullShippingAddressString || 'Address on file'}
                    </p>
                    <div style={{ marginTop: '8px' }}>
                      <button 
                        type="button"
                        onClick={() => setIsEditingShipping(true)}
                        className={styles.cardActionLink}
                      >
                        <Edit2 size={12} />
                        <span>Edit Address</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Delivery Fulfillment & Agent Assignment */}
          <div className={`${styles.card} ${styles.cardOverflowVisible}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Truck size={18} className={styles.cardTitleIcon} />
                <span>Delivery Fulfillment</span>
              </h3>
            </div>

            <div className={styles.agentCardBody}>
              {(order.deliveryAgent || order.delivery?.agentId) && !isReassigning ? (
                <>
                  <div className={styles.assignedAgentBox}>
                    <div className={styles.agentAvatar}>
                      {(order.deliveryAgent?.name || order.delivery?.agentId?.name || 'DA')[0]}
                    </div>
                    <div>
                      <div className={styles.agentName}>
                        {order.deliveryAgent?.name || order.delivery?.agentId?.name || 'Assigned Partner'}
                      </div>
                      <div className={styles.agentPhone}>
                        {order.deliveryAgent?.phone || order.delivery?.agentId?.phone || 'Phone on file'}
                      </div>
                    </div>
                  </div>

                  {order.status !== 'DELIVERED' && order.status !== 'Cancelled' && (
                    <button
                      type="button"
                      className={styles.reassignBtn}
                      onClick={() => setIsReassigning(true)}
                    >
                      Reassign Partner
                    </button>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0' }}>
                    {isReassigning ? 'Select a new delivery partner to dispatch:' : 'Assign an active delivery partner to dispatch this order:'}
                  </p>
                  <CustomSelect
                    value={selectedAgentId}
                    onChange={(val) => setSelectedAgentId(val)}
                    placeholder="Select Delivery Agent..."
                    options={availableAgents.map((ag) => ({
                      value: ag.id || ag._id,
                      label: `${ag.name} (${ag.activeOrders || 0} active orders)`
                    }))}
                    className={styles.agentCustomSelect}
                    variant="pink"
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isReassigning && (
                      <button
                        type="button"
                        className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
                        style={{ height: '34px', flex: 1 }}
                        onClick={() => setIsReassigning(false)}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.opsBtn}
                      style={{ height: '34px', flex: 1 }}
                      disabled={!selectedAgentId || isActionLoading}
                      onClick={handleAssignAgent}
                    >
                      {isActionLoading ? 'Dispatching...' : isReassigning ? 'Reassign & Dispatch' : 'Assign & Dispatch'}
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery OTP Security Status */}
              <div className={styles.otpStatusBox}>
                <div className={styles.otpTitle}>
                  <ShieldCheck size={14} color="#059669" />
                  <span>Customer OTP Verification</span>
                </div>
                <div>
                  {order.status === 'DELIVERED'
                    ? 'Verified with customer OTP upon delivery completion.'
                    : '6-digit crypto OTP sent to customer. Agent must verify OTP upon arrival.'}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Financial Settlement (Matches EventDecor OrderSettlement) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <CreditCard size={18} className={styles.cardTitleIcon} />
                <span>Financial Settlement</span>
              </h3>
              <span className={`${styles.paymentBadge} ${paymentObj.status === 'Paid' ? styles.paymentBadgePaid : styles.paymentBadgePending}`}>
                {paymentObj.status === 'Paid' ? 'Reconciled' : 'Pending'}
              </span>
            </div>

            <div className={styles.settlementList}>
              <div className={styles.settlementRow}>
                <span className={styles.settlementLabel}>Original Bill Total</span>
                <span className={styles.settlementVal}>₹{amountPaid}</span>
              </div>
              <div className={styles.settlementRow}>
                <span className={styles.settlementLabel}>Payment Method</span>
                <span className={styles.settlementVal} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={14} color="#6B7280" />
                  {paymentObj.method}
                </span>
              </div>
              <div className={styles.settlementRow}>
                <span className={styles.settlementLabel}>Transaction ID</span>
                <span className={styles.monoVal}>{paymentObj.transactionId}</span>
              </div>
              <div className={styles.settlementRow}>
                <span className={styles.settlementLabel}>Payment Date</span>
                <span className={styles.settlementVal}>{paymentObj.date || order.date || 'Today'}</span>
              </div>
              <div className={styles.settlementRow} style={{ paddingTop: '8px', borderTop: '1px solid #E5E7EB' }}>
                <span className={styles.settlementLabel} style={{ fontWeight: 700, color: '#1F2937' }}>Amount Paid</span>
                <span className={styles.settlementVal} style={{ color: 'var(--admin-pink, #F20D6F)', fontSize: '15px' }}>
                  ₹{amountPaid}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && confirmAction && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '4px', padding: '24px',
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>
              {confirmAction.title}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
              {confirmAction.message}
            </p>

            {confirmAction.type === 'pending_gate' ? (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
                  style={{ height: '36px' }}
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isActionLoading}
                >
                  Close
                </button>
                <button 
                  type="button"
                  className={styles.cancelOrderBtn}
                  style={{ height: '36px', width: 'auto', padding: '0 14px' }}
                  onClick={confirmAction.onCancel}
                  disabled={isActionLoading}
                >
                  Cancel Order
                </button>
                <button 
                  type="button"
                  className={styles.opsBtn}
                  style={{ height: '36px', width: 'auto', padding: '0 16px' }}
                  onClick={confirmAction.onApprove}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Processing...' : 'Approve & Start Baking'}
                </button>
              </div>
            ) : confirmAction.type === 'dispatch_gate' ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Select Delivery Agent *
                  </label>
                  <CustomSelect
                    value={selectedAgentId}
                    onChange={(val) => setSelectedAgentId(val)}
                    placeholder="Select Delivery Agent (Mandatory)..."
                    options={availableAgents.map((ag) => ({
                      value: ag.id || ag._id,
                      label: `${ag.name} (${ag.phone || 'Phone on file'}) • ${ag.activeOrders || 0} active`,
                    }))}
                    variant="pink"
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
                    style={{ height: '36px' }}
                    onClick={() => setIsConfirmModalOpen(false)}
                    disabled={isActionLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    className={styles.opsBtn}
                    style={{ height: '36px', width: 'auto', padding: '0 16px' }}
                    onClick={() => handleDispatchWithAgent(selectedAgentId)}
                    disabled={!selectedAgentId || isActionLoading}
                  >
                    {isActionLoading ? 'Dispatching...' : 'Confirm & Dispatch'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
                  style={{ height: '36px' }}
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className={confirmAction.isDestructive ? styles.cancelOrderBtn : styles.opsBtn}
                  style={{ height: '36px', width: 'auto', padding: '0 16px' }}
                  onClick={confirmAction.onConfirm}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Processing...' : confirmAction.buttonText}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Invoice Viewer Modal */}
      {order && (
        <InvoiceViewer 
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          data={mapOrderToInvoiceData(order)}
        />
      )}
    </div>
  );
}
