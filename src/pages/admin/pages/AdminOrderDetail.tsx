import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Printer, User, MapPin, CreditCard, 
  Clock, Package, FileText, CheckCircle, AlertTriangle, Edit2, X, Plus, Hash, Calendar, Truck,
  Mail, Phone
} from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './AdminOrderDetail.module.css';

import { adminOrderData } from '@/features/admin/api/mockAdminDataProvider';
import { AdminOrderDetailSkeleton } from '@/features/admin/components/AdminOrderDetailSkeleton';
import { CustomSelect } from '@/features/admin/components/CustomSelect';
import { useToast } from '@/components/ui/ToastContext';
import { InvoiceViewer, downloadInvoicePDF } from '@/components/invoice/InvoiceViewer';
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper';

export function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  
  // Status Update State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Edit Shipping State
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState<any>({});

  // Notes State
  const [newNote, setNewNote] = useState('');

  const handleDownloadInvoice = async () => {
    setIsActionLoading(true);
    // Add realistic download simulation logic here if needed
    setIsActionLoading(false);
  };

  const getEventColor = (event: string) => {
    const e = event.toLowerCase();
    if (e.includes('placed') || e.includes('confirmed')) return '#10B981'; // Green
    if (e.includes('payment') || e.includes('preparing') || e.includes('processing')) return '#F59E0B'; // Orange
    if (e.includes('packed')) return '#3B82F6'; // Blue
    if (e.includes('shipped') || e.includes('out for delivery')) return '#6366F1'; // Indigo
    if (e.includes('delivered')) return '#EC4899'; // Pink
    if (e.includes('cancel')) return '#EF4444'; // Red
    return '#EC4899'; // Default Pink
  };

  useEffect(() => {
    // Simulate API fetch
    const fetchOrder = () => {
      setIsLoading(true);
      setTimeout(() => {
        if (orderId) {
          const data = adminOrderData.getOrderById(orderId);
          if (data) {
            setOrder(data);
            setShippingForm(data.address);
          }
        }
        setIsLoading(false);
      }, 1200);
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = (label: string) => {
    setIsActionLoading(true);
    setTimeout(() => {
      // Create a new timeline event
      const newEvent = {
        id: `t${Date.now()}`,
        event: `Status updated to ${label}`,
        timestamp: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
        note: ''
      };

      setOrder((prev: any) => ({
        ...prev,
        status: label,
        timeline: [...prev.timeline, newEvent]
      }));
      
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
          setOrder((prev: any) => ({
            ...prev,
            status: 'Cancelled',
            timeline: [...prev.timeline, newEvent]
          }));
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
      setOrder((prev: any) => ({
        ...prev,
        address: shippingForm
      }));
      setIsActionLoading(false);
      setIsEditingShipping(false);
      toast({
        type: 'success',
        title: 'Address Updated',
        message: 'Shipping information saved successfully.'
      });
    }, 600);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    setIsActionLoading(true);
    setTimeout(() => {
      const note = {
        id: `n${Date.now()}`,
        author: 'Admin User',
        timestamp: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
        content: newNote
      };
      
      setOrder((prev: any) => ({
        ...prev,
        notes: [note, ...prev.notes]
      }));
      
      setNewNote('');
      setIsActionLoading(false);
      toast({
        type: 'success',
        title: 'Note Added',
        message: 'Internal note saved successfully.'
      });
    }, 400);
  };

  if (isLoading) {
    return <AdminOrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <AlertTriangle size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
        <h2 className={styles.title}>Order Not Found</h2>
        <p className={styles.subtitle} style={{ marginBottom: '24px' }}>The order {orderId} could not be loaded or does not exist.</p>
        <button className={styles.btnPrimary} onClick={() => navigate('/admin/orders')}>
          Back to Orders
        </button>
      </div>
    );
  }

  const statusOptions = adminOrderData.getOrderStatuses().map(status => ({
    value: status.toLowerCase(),
    label: status
  })).filter(opt => opt.label !== order.status);

  const fixedSteps = [
    { title: 'Order Confirmed', subtitle: 'We have received your order', keyword: 'confirm' },
    { title: 'Preparing', subtitle: 'Baking your delicious treats', keyword: 'prepar' },
    { title: 'Packed', subtitle: 'Ready for dispatch', keyword: 'pack' },
    { title: 'Out for Delivery', subtitle: 'Agent is on the way', keyword: 'out' },
    { title: 'Delivered', subtitle: 'Enjoy your Cake Pops!', keyword: 'deliver' }
  ];

  const currentStatusLower = order.status.toLowerCase();
  
  const getStatusIndex = (status: string) => {
    if (status.includes('confirm')) return 0;
    if (status.includes('prepar') || status.includes('process')) return 1;
    if (status.includes('pack')) return 2;
    if (status.includes('out') || status.includes('ship')) return 3;
    if (status.includes('deliver')) return 4;
    return -1;
  };

  const currentIndex = getStatusIndex(currentStatusLower);

  const displayTimeline = fixedSteps.map((step, idx) => {
    let timestamp = '';
    const matchedEvent = order.timeline.find((t: any) => t.event.toLowerCase().includes(step.keyword));
    
    if (matchedEvent) {
      timestamp = matchedEvent.timestamp;
    } else {
      // Fallback: check if we match 'ship' for out for delivery, 'process' for prepare
      const fallbackKeyword = step.keyword === 'out' ? 'ship' : step.keyword === 'prepar' ? 'process' : '';
      if (fallbackKeyword) {
        const fallbackMatch = order.timeline.find((t: any) => t.event.toLowerCase().includes(fallbackKeyword));
        if (fallbackMatch) timestamp = fallbackMatch.timestamp;
      }
      
      // If we passed it but didn't find an event, assume done.
      if (!timestamp && idx <= currentIndex && currentStatusLower !== 'cancelled') {
        timestamp = 'Done';
      }
    }

    const isUpcoming = currentStatusLower === 'cancelled' || currentStatusLower === 'refunded' 
      ? (!matchedEvent && idx > currentIndex) 
      : idx > currentIndex;

    if (isUpcoming && !timestamp) {
        timestamp = 'Upcoming';
    }

    return {
      id: `step-${idx}`,
      event: step.title,
      subtitle: step.subtitle,
      timestamp: timestamp,
      isUpcoming: isUpcoming
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/admin/orders')} aria-label="Back to orders">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.title}>
              Order {order.id}
              <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase().replace(/\s+/g, '')] || styles.pending}`}>
                {order.status}
              </span>
              <span className={`${styles.paymentBadge} ${order.payment.status === 'Paid' ? styles.paid : styles.pending}`}>
                {order.payment.status}
              </span>
            </h1>
            <p className={styles.subtitle}>Placed {order.date} at {order.time}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <CustomSelect 
            variant="pink"
            placeholder="Update Status..."
            value=""
            onChange={(val) => {
              if (val) {
                const opt = statusOptions.find(o => o.value === val);
                if (opt) {
                  setConfirmAction({
                    type: 'status',
                    title: 'Update Order Status',
                    message: `Are you sure you want to change the status of this order to ${opt.label}?`,
                    buttonText: 'Update Status',
                    label: opt.label,
                    onConfirm: () => handleStatusUpdate(opt.label)
                  });
                  setIsConfirmModalOpen(true);
                }
              }
            }}
            options={statusOptions}
          />
          <button className={styles.btnOutline} onClick={() => setIsInvoiceOpen(true)}>
            <FileText size={16} /> View Invoice
          </button>
        </div>
      </div>

      {/* Timeline (Horizontal Bar) */}
      <div className={styles.card} style={{ marginBottom: '24px' }}>
        <div className={styles.cardHeader} style={{ marginBottom: '16px' }}>
          <h2 className={styles.cardTitle}>
            <Clock size={20} className={styles.cardTitleIcon} />
            Order Timeline
          </h2>
        </div>
        <div className={styles.timeline}>
          {displayTimeline.map((item: any, idx: number) => {
            const isUpcoming = item.isUpcoming;
            const color = isUpcoming ? '#D1D5DB' : getEventColor(item.event); // Grey for upcoming
            return (
              <div key={item.id} className={styles.timelineItem}>
                <div 
                  className={styles.timelineIcon} 
                  style={{ 
                    background: isUpcoming ? '#F3F4F6' : color, 
                    color: isUpcoming ? '#9CA3AF' : 'white',
                    border: isUpcoming ? `1px dashed #D1D5DB` : `none`
                  }}
                >
                  {isUpcoming ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} /> : <CheckCircle size={16} />}
                </div>
                {idx < displayTimeline.length - 1 && (
                  <div 
                    className={styles.timelineConnector}
                    style={{ background: isUpcoming ? '#E5E7EB' : color }}
                  />
                )}
                <div className={styles.timelineContent}>
                  <div className={styles.timelineEvent} style={{ color: isUpcoming ? '#9CA3AF' : color }}>{item.event}</div>
                  <div className={styles.timelineSubtitle} style={{ fontSize: '12px', color: isUpcoming ? '#D1D5DB' : '#6B7280', marginBottom: '4px', lineHeight: 1.2 }}>{item.subtitle}</div>
                  <div className={styles.timelineTime} style={{ color: isUpcoming ? '#D1D5DB' : undefined }}>{item.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Column */}
        <div className={styles.gridColumn}>
          {/* Order Items */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Package size={20} className={styles.cardTitleIcon} />
                Order Items ({order.items.length})
              </h2>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.productCell}>
                          <img src={item.image} alt={item.name} className={styles.productImage} />
                          <div className={styles.productInfo}>
                            <div className={styles.productName}>{item.name}</div>
                            <div className={styles.productSku}>{item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={styles.cellValue}>{item.qty}</span>
                        <div className={styles.cellLabel}>× ₹{item.unitPrice}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={styles.cellValue}>₹{item.subtotal}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.orderFooter}>
              <div className={styles.orderSummaryLeft}>
                <div className={styles.summaryTitle}>Order Summary</div>
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}><Hash size={14} /> Order ID</span>
                    <span className={styles.summaryValue}>{order.id}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}><Calendar size={14} /> Date</span>
                    <span className={styles.summaryValue}>{order.date}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}><Package size={14} /> Fulfillment</span>
                    <span className={styles.summaryValue}>{order.orderType}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}><Truck size={14} /> Est. Delivery</span>
                    <span className={styles.summaryValue}>{order.estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              <div className={styles.totalsSection}>
                <div className={styles.summaryTitle}>Payment Details</div>
                <div className={styles.totalsBox}>
                  <div className={styles.totalsRow}>
                    <span className={styles.totalsLabel}>Subtotal</span>
                    <span className={styles.totalsValue}>₹{order.price.itemSubtotal}</span>
                  </div>
                  <div className={styles.totalsRow}>
                    <span className={styles.totalsLabel}>Coupon Discount</span>
                    <span className={styles.totalsValue} style={{ color: 'var(--color-error)' }}>-₹{order.price.couponDiscount}</span>
                  </div>
                  <div className={styles.totalsRow}>
                    <span className={styles.totalsLabel}>Delivery Fee</span>
                    <span className={styles.totalsValue}>₹{order.price.deliveryFee}</span>
                  </div>
                  <div className={styles.totalsRow}>
                    <span className={styles.totalsLabel}>Tax</span>
                    <span className={styles.totalsValue}>₹{order.price.taxes}</span>
                  </div>
                  <div className={styles.divider}></div>
                  <div className={`${styles.totalsRow} ${styles.grandTotal}`}>
                    <span className={styles.totalsLabel}>Total Paid</span>
                    <span className={styles.totalsValue}>₹{order.price.amountPaid}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className={`${styles.card} ${styles.notesCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Edit2 size={20} className={styles.cardTitleIcon} />
                Internal Notes
              </h2>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {order.notes.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No internal notes yet.</div>
              ) : (
                order.notes.map((note: any) => (
                  <div key={note.id} className={styles.noteItem}>
                    <div className={styles.noteHeader}>
                      <span className={styles.noteAuthor}>{note.author}</span>
                      <span className={styles.noteTime}>{note.timestamp}</span>
                    </div>
                    <div className={styles.noteContent}>{note.content}</div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.addNoteForm}>
              <textarea 
                className={styles.noteTextarea} 
                placeholder="Add a note (visible only to admins)..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
              <button 
                className={styles.btnPrimary} 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAddNote}
                disabled={!newNote.trim() || isActionLoading}
              >
                {isActionLoading ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.gridColumn}>
          {/* Customer */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <User size={20} className={styles.cardTitleIcon} />
                Customer
              </h2>
            </div>
            <div className={styles.addressBox}>
              <div className={styles.addressName}>{order.customer.name}</div>
              <div className={styles.chipGroup}>
                <span className={styles.chip}>
                  <Mail size={12} className={styles.chipIcon} />
                  {order.customer.email}
                </span>
                <span className={styles.chip}>
                  <Phone size={12} className={styles.chipIcon} />
                  {order.customer.phone}
                </span>
              </div>
            </div>
            <Link to={`/admin/customers/${order.customer.id}`} className={styles.customerLink}>
              View Profile ({order.customer.ordersCount} orders)
            </Link>
          </div>

          {/* Shipping Address */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <MapPin size={20} className={styles.cardTitleIcon} />
                Shipping Address
              </h2>
              {!isEditingShipping && (
                <button className={styles.cardAction} onClick={() => setIsEditingShipping(true)}>
                  Edit
                </button>
              )}
            </div>
            
            {isEditingShipping ? (
              <form onSubmit={handleSaveShipping}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Recipient Name</label>
                  <input type="text" className={styles.formInput} value={shippingForm.recipientName} onChange={e => setShippingForm({...shippingForm, recipientName: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone</label>
                  <input type="text" className={styles.formInput} value={shippingForm.phone} onChange={e => setShippingForm({...shippingForm, phone: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Street Address</label>
                  <input type="text" className={styles.formInput} value={shippingForm.street} onChange={e => setShippingForm({...shippingForm, street: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City</label>
                    <input type="text" className={styles.formInput} value={shippingForm.city} onChange={e => setShippingForm({...shippingForm, city: e.target.value})} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>PIN Code</label>
                    <input type="text" className={styles.formInput} value={shippingForm.pincode} onChange={e => setShippingForm({...shippingForm, pincode: e.target.value})} required />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnOutline} onClick={() => { setIsEditingShipping(false); setShippingForm(order.address); }} disabled={isActionLoading}>Cancel</button>
                  <button type="submit" className={styles.btnPrimary} disabled={isActionLoading}>
                    {isActionLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.addressBox}>
                <div className={styles.addressName}>{order.address.recipientName}</div>
                <div>{order.address.street}, {order.address.city}, {order.address.state} {order.address.pincode}</div>
                <div className={styles.chipGroup}>
                  <span className={styles.chip}>
                    <Phone size={12} className={styles.chipIcon} />
                    {order.address.phone}
                  </span>
                  <span className={styles.chip}>
                    <MapPin size={12} className={styles.chipIcon} />
                    Home
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <CreditCard size={20} className={styles.cardTitleIcon} />
                Payment Info
              </h2>
            </div>
            <div className={styles.addressBox}>
              <div className={styles.addressName}>
                <CreditCard size={14} className={styles.chipIcon} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }}/>
                {order.payment.method}
              </div>
              <div className={styles.chipGroup}>
                <span className={styles.chip}>
                  <Hash size={12} className={styles.chipIcon} />
                  {order.payment.transactionId}
                </span>
                <span className={styles.chip}>
                  <Calendar size={12} className={styles.chipIcon} />
                  {order.payment.date}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.card}>
            <button className={styles.btnDanger} onClick={handleCancelOrder}>
              <X size={18} /> Cancel Order
            </button>
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
            background: 'white', borderRadius: '12px', padding: '24px',
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: 'var(--admin-brown)' }}>{confirmAction.title}</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {confirmAction.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className={styles.btnOutline} 
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isActionLoading}
              >
                Cancel
              </button>
              <button 
                className={confirmAction.isDestructive ? styles.btnDanger : styles.btnPrimary} 
                onClick={confirmAction.onConfirm}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Processing...' : confirmAction.buttonText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Invoice Modal */}
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
