import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  User,
  Clock,
  Trash2,
  Copy,
  Check,
  MessageCircle,
  Star,
  Heart,
  Loader2,
  Palette,
  Package,
  ExternalLink,
} from 'lucide-react';
import styles from './CustomerDetailsModal.module.css';
import { adminCustomerData } from '@/features/admin/api/adminDataProvider';
import { useToast } from '@/components/ui/ToastContext';

interface CustomerDetailsModalProps {
  customer: any | null;
  customerId?: string | null;
  onClose: () => void;
  onCustomerUpdated?: () => void;
  onDelete?: (customer: any) => void;
}

export function CustomerDetailsModal({
  customer,
  customerId: propCustomerId,
  onClose,
  onCustomerUpdated,
  onDelete,
}: CustomerDetailsModalProps) {
  const { showToast } = useToast();
  const targetId = propCustomerId || customer?._id || customer?.id;

  const [activeTab, setActiveTab] = useState<'overview' | 'cart' | 'orders' | 'journey'>('overview');
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);


  // Lock body scroll
  useEffect(() => {
    if (targetId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [targetId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch full Customer 360 profile from backend
  const fetchProfile = useCallback(async () => {
    if (!targetId) return;
    setIsLoading(true);
    try {
      const data = await adminCustomerData.getCustomerById(String(targetId));
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Failed to load customer profile:', err);
      showToast('Failed to load customer details', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [targetId, showToast]);

  useEffect(() => {
    if (targetId) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [targetId, fetchProfile]);

  const handleCopy = (text: string, label: string) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label}`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };


  const handleToggleStatus = async () => {
    if (!targetId || !profile) return;
    const currentLocked = profile.identity?.isLocked;
    const newStatus = currentLocked ? 'Active' : 'Inactive';
    try {
      await adminCustomerData.updateStatus(String(targetId), newStatus);
      showToast(`Customer marked as ${newStatus}`, 'success');
      fetchProfile();
      onCustomerUpdated?.();
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  if (!targetId) return null;

  // Resolve consolidated customer profile attributes
  const identity = profile?.identity || customer || {};
  const overview = profile?.overview || {};
  const addresses = profile?.addresses || [];
  const defaultAddr = profile?.primaryAddress || addresses.find((a: any) => a.isDefault) || addresses[0];
  const cartItems = profile?.cart || [];
  const wishlistItems = profile?.wishlist || [];
  const stdOrders = profile?.orders || [];
  const customOrders = profile?.customOrders || [];
  const timeline = profile?.timeline || [];

  const name = identity.name || 'Valued Customer';
  const email = identity.email || '—';
  const rawPhone =
    identity.phone ||
    customer?.phone ||
    profile?.identity?.phone ||
    addresses.find((a: any) => a.phone)?.phone ||
    stdOrders.find((o: any) => o.shippingAddress?.phone)?.shippingAddress?.phone ||
    customOrders.find((c: any) => c.customerPhone)?.customerPhone ||
    '';
  const phone = rawPhone && rawPhone !== '—' ? rawPhone : '';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const hasPhone = Boolean(phone && cleanPhone.length >= 6);
  const initials = identity.initials || name.slice(0, 2).toUpperCase();
  const avatarBg = identity.avatarBg || '#FFF0F5';
  const avatarColor = identity.avatarColor || 'var(--admin-pink)';
  const status = identity.status || (identity.isLocked ? 'Inactive' : 'Active');
  const loyaltyTier = identity.loyaltyTier || 'Bronze';

  const totalSpent = overview.formattedSpent || (overview.totalSpent ? `₹${overview.totalSpent.toLocaleString('en-IN')}` : customer?.spent || '₹0');
  const totalOrders = overview.totalOrders ?? customer?.orders ?? stdOrders.length ?? 0;
  const customOrdersCount = overview.customOrdersCount ?? customOrders.length;
  const rewardPoints = identity.rewardPoints || 0;
  const segment = overview.segment || customer?.segment || 'Customer';

  const modalLocation =
    overview.city && overview.city !== 'N/A'
      ? overview.city
      : customer?.location && customer.location !== 'N/A'
      ? customer.location
      : 'N/A';

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />

        {/* ─── HEADER BAR ─── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar} style={{ backgroundColor: avatarBg, color: avatarColor }}>
              {initials}
            </div>
            <div className={styles.nameWrap}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className={styles.name}>{name}</h2>
                {identity?.role && !['customer', 'user'].includes(identity.role) && (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      backgroundColor: '#F3E8FF',
                      color: '#7E22CE',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {identity.role.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className={styles.metaRow}>
                <span className={styles.locationPill}>
                  <MapPin size={11} className={styles.locationPillPin} />
                  <span>{modalLocation}</span>
                </span>
                <span className={styles.contactSubtitle}>
                  {email && email !== '—' ? email : phone || 'Customer Account'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Call, Delete, Close) */}
          <div className={styles.actionsStrip}>
            {hasPhone ? (
              <a href={`tel:${phone}`} className={styles.actionIconBtn} title={`Call ${phone}`}>
                <Phone size={16} />
              </a>
            ) : (
              <button
                type="button"
                className={`${styles.actionIconBtn} ${styles.actionIconBtnDisabled}`}
                title="No phone number available"
                onClick={() => showToast('No phone number registered for this customer', 'info')}
              >
                <Phone size={16} />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                title="Move Customer to Recycle Bin"
                onClick={() => onDelete(profile?.identity || customer)}
              >
                <Trash2 size={16} />
              </button>
            )}

            <button type="button" className={styles.closeBtn} onClick={onClose} title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ─── TABS NAVIGATION BAR ─── */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('overview')}
            title="Overview"
            aria-label="Overview"
          >
            <span className={styles.tabIconWrap}>
              <User size={18} />
            </span>
            <span className={styles.tabText}>Overview</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'cart' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('cart')}
            title="Cart & Wishlist"
            aria-label="Cart & Wishlist"
          >
            <span className={styles.tabIconWrap}>
              <ShoppingCart size={18} />
              {cartItems.length > 0 && <span className={styles.tabBadge}>{cartItems.length}</span>}
            </span>
            <span className={styles.tabText}>Cart & Wishlist</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('orders')}
            title="Orders & Custom"
            aria-label="Orders & Custom"
          >
            <span className={styles.tabIconWrap}>
              <ShoppingBag size={18} />
              {totalOrders > 0 && <span className={styles.tabBadge}>{totalOrders}</span>}
            </span>
            <span className={styles.tabText}>Orders & Custom</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'journey' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('journey')}
            title="Journey"
            aria-label="Journey"
          >
            <span className={styles.tabIconWrap}>
              <Clock size={18} />
            </span>
            <span className={styles.tabText}>Journey</span>
          </button>
        </div>

        {/* ─── BODY CONTENT ─── */}
        <div className={styles.body}>
          {isLoading && !profile ? (
            <div className={styles.emptyState}>
              <Loader2 className="animate-spin" size={24} style={{ color: 'var(--admin-pink)' }} />
              <p className={styles.emptyStateDesc}>Loading customer 360 profile...</p>
            </div>
          ) : (
            <>
              {/* ═══════════════════════════════════════════════ */}
              {/* TAB 1: 360 OVERVIEW */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'overview' && (
                <>
                  {/* 4 Symmetrical KPI Metric Cards */}
                  <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                      <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Lifetime Spend</span>
                        <CreditCard size={15} style={{ color: 'var(--admin-pink)' }} />
                      </div>
                      <div className={styles.kpiValue} style={{ color: 'var(--admin-pink)' }}>
                        {totalSpent}
                      </div>
                    </div>

                    <div className={styles.kpiCard}>
                      <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Total Orders</span>
                        <ShoppingBag size={15} style={{ color: '#F59E0B' }} />
                      </div>
                      <div className={styles.kpiValue}>{totalOrders}</div>
                    </div>

                    <div className={styles.kpiCard}>
                      <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Custom Requests</span>
                        <Palette size={15} style={{ color: 'var(--admin-cyan)' }} />
                      </div>
                      <div className={styles.kpiValue} style={{ color: 'var(--admin-cyan)' }}>
                        {customOrdersCount}
                      </div>
                    </div>

                    <div className={styles.kpiCard}>
                      <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Reward Points</span>
                        <Star size={15} style={{ color: '#9C27B0' }} />
                      </div>
                      <div className={styles.kpiValue}>{rewardPoints} pts</div>
                    </div>
                  </div>

                  {/* Customer Dossier */}
                  <div className={styles.cardSection}>
                    <div className={styles.sectionTitle}>
                      <User size={15} />
                      <span>Customer Dossier</span>
                    </div>

                    <div className={styles.dossierGrid}>
                      <div className={styles.dossierItem}>
                        <span className={styles.dossierLabel}>Full Name</span>
                        <span className={styles.dossierValue}>{name}</span>
                      </div>

                      <div className={styles.dossierItem}>
                        <span className={styles.dossierLabel}>Email Address</span>
                        <div className={styles.dossierValue}>
                          <span>{email}</span>
                          {email && email !== '—' && (
                            <button
                              type="button"
                              className={styles.copyBtn}
                              title="Copy email"
                              onClick={() => handleCopy(email, 'Email')}
                            >
                              {copiedField === 'Email' ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={styles.dossierItem}>
                        <span className={styles.dossierLabel}>Contact Phone</span>
                        <div className={styles.dossierValue}>
                          <span>{phone}</span>
                          {phone && phone !== '—' && (
                            <button
                              type="button"
                              className={styles.copyBtn}
                              title="Copy phone"
                              onClick={() => handleCopy(phone, 'Phone')}
                            >
                              {copiedField === 'Phone' ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={styles.dossierItem}>
                        <span className={styles.dossierLabel}>Primary Location</span>
                        <span className={styles.dossierValue}>
                          <MapPin size={14} style={{ color: '#E11D48' }} />
                          {modalLocation}
                        </span>
                      </div>
                    </div>

                    <div className={styles.addressBox}>
                      <span className={styles.dossierLabel}>Default Delivery Address</span>
                      <p className={styles.addressText} style={!overview.formattedAddress ? { color: '#64748B', fontStyle: 'italic' } : undefined}>
                        {overview.formattedAddress || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Account Lifecycle */}
                  <div className={styles.cardSection}>
                    <div className={styles.sectionTitle}>
                      <Clock size={15} />
                      <span>Account Lifecycle</span>
                    </div>

                    <div className={styles.lifecycleRow}>
                      <span className={styles.lifecycleLabel}>Member Since:</span>
                      <span className={styles.lifecycleValue}>
                        {identity.createdAt
                          ? new Date(identity.createdAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <div className={styles.lifecycleRow}>
                      <span className={styles.lifecycleLabel}>Last Activity:</span>
                      <span className={styles.lifecycleValue}>
                        {customer?.lastOrderDate && customer.lastOrderDate !== 'N/A' && customer.lastOrderDate !== 'Recent'
                          ? `${customer.lastOrderDate}${customer?.lastOrderTime ? ` at ${customer.lastOrderTime}` : ''}`
                          : 'N/A'}
                      </span>
                    </div>

                    <div className={styles.lifecycleRow}>
                      <span className={styles.lifecycleLabel}>Lifecycle Segment:</span>
                      <span className={styles.lifecycleValue} style={{ color: 'var(--admin-pink)' }}>
                        {segment}
                      </span>
                    </div>

                    <div className={styles.lifecycleRow}>
                      <span className={styles.lifecycleLabel}>Account Status:</span>
                      <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={styles.secondaryBtn}
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        {identity.isLocked ? 'Unlock / Activate' : 'Lock / Deactivate'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* TAB 2: CART & WISHLIST */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'cart' && (
                <>
                  <div className={styles.cardSection}>
                    <div className={styles.sectionTitle}>
                      <ShoppingCart size={15} />
                      <span>Active Shopping Cart ({cartItems.length} items)</span>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className={styles.emptyState}>
                        <ShoppingCart size={32} />
                        <span className={styles.emptyStateTitle}>Cart is empty</span>
                        <span className={styles.emptyStateDesc}>This customer has no items in their active cart.</span>
                      </div>
                    ) : (
                      <div className={styles.ordersList}>
                        {cartItems.map((item: any, idx: number) => (
                          <div key={idx} className={styles.orderItemsBox} style={{ margin: 0, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              {item.image ? (
                                <img src={item.image} alt={item.title} className={styles.orderThumb} />
                              ) : (
                                <div className={styles.orderThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Package size={18} color="var(--admin-pink)" />
                                </div>
                              )}
                              <div className={styles.orderItemDetails}>
                                <div className={styles.orderItemTitle}>{item.title}</div>
                                <div className={styles.orderItemMeta}>
                                  Qty: <strong>{item.quantity}</strong> {item.variant ? `• ${item.variant}` : ''}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontWeight: 700, color: 'var(--admin-pink)', fontSize: '14px' }}>
                                ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>₹{item.price} each</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardSection}>
                    <div className={styles.sectionTitle}>
                      <Heart size={15} style={{ color: '#E11D48' }} />
                      <span>Saved Wishlist ({wishlistItems.length} items)</span>
                    </div>

                    {wishlistItems.length === 0 ? (
                      <div className={styles.emptyState}>
                        <Heart size={32} style={{ color: '#FDA4AF' }} />
                        <span className={styles.emptyStateTitle}>Wishlist is empty</span>
                        <span className={styles.emptyStateDesc}>No treats saved in this customer's wishlist.</span>
                      </div>
                    ) : (
                      <div className={styles.ordersList}>
                        {wishlistItems.map((item: any, idx: number) => (
                          <div key={idx} className={styles.orderItemsBox} style={{ margin: 0, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              {item.image ? (
                                <img src={item.image} alt={item.title} className={styles.orderThumb} />
                              ) : (
                                <div className={styles.orderThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Heart size={18} color="#E11D48" />
                                </div>
                              )}
                              <div className={styles.orderItemDetails}>
                                <div className={styles.orderItemTitle}>{item.title}</div>
                                <div className={styles.orderItemMeta}>Saved Item</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--admin-brown)', fontSize: '14px' }}>
                              ₹{item.price?.toLocaleString('en-IN') || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* TAB 3: ORDERS & CUSTOM ORDERS */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'orders' && (
                <>
                  {/* Custom Orders Subsystem Integration */}
                  <div className={styles.cardSection}>
                    <div className={styles.sectionTitle}>
                      <Palette size={15} />
                      <span>Authoritative Custom Orders ({customOrders.length})</span>
                    </div>

                    {customOrders.length === 0 ? (
                      <div className={styles.emptyState}>
                        <Palette size={32} />
                        <span className={styles.emptyStateTitle}>No custom orders requested</span>
                        <span className={styles.emptyStateDesc}>Customer has not submitted custom cake pop requests.</span>
                      </div>
                    ) : (
                      <div className={styles.ordersList}>
                        {customOrders.map((co: any) => (
                          <div key={co._id || co.orderId} className={styles.orderCard}>
                            <div className={styles.orderCardHeader}>
                              <div className={styles.orderId}>
                                <span>{co.orderId}</span>
                                <span className={`${styles.orderTypeBadge} ${styles.customOrderBadge}`}>
                                  Custom Order
                                </span>
                              </div>
                              <span
                                className={styles.badge}
                                style={{
                                  backgroundColor:
                                    co.status === 'Completed'
                                      ? '#DCFCE7'
                                      : co.status === 'Approved'
                                      ? '#E0FAFC'
                                      : co.status === 'Rejected'
                                      ? '#FEE2E2'
                                      : '#FFF8E1',
                                  color:
                                    co.status === 'Completed'
                                      ? '#16A34A'
                                      : co.status === 'Approved'
                                      ? '#0284C7'
                                      : co.status === 'Rejected'
                                      ? '#DC2626'
                                      : '#B45309',
                                }}
                              >
                                {co.status}
                              </span>
                            </div>

                            <div className={styles.orderItemsBox}>
                              {co.designImage || co.productSnapshot?.image ? (
                                <img
                                  src={co.designImage || co.productSnapshot?.image}
                                  alt="Custom Pop"
                                  className={styles.orderThumb}
                                />
                              ) : (
                                <div className={styles.orderThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Palette size={18} color="var(--admin-cyan)" />
                                </div>
                              )}
                              <div className={styles.orderItemDetails}>
                                <div className={styles.orderItemTitle}>
                                  {co.occasion || 'Special Celebration'} ({co.quantity} pcs)
                                </div>
                                <div className={styles.orderItemMeta}>
                                  {co.occasionDescription ? co.occasionDescription.slice(0, 70) : 'Custom design request'}
                                </div>
                                {co.targetDate && (
                                  <div style={{ fontSize: '11px', color: '#B45309', fontWeight: 600, marginTop: '2px' }}>
                                    Required by: {new Date(co.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className={styles.orderFooter}>
                              <div>
                                <span style={{ color: '#64748B' }}>Budget: </span>
                                <span className={styles.orderTotal}>
                                  {co.budget ? `₹${Number(co.budget).toLocaleString('en-IN')}` : 'To be quoted'}
                                </span>
                              </div>
                              <span style={{ color: '#94A3B8', fontSize: '11px' }}>
                                {new Date(co.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Standard Storefront Orders */}
                  <div className={styles.cardSection}>
                    <div className={styles.sectionTitle}>
                      <ShoppingBag size={15} />
                      <span>Storefront Orders ({stdOrders.length})</span>
                    </div>

                    {stdOrders.length === 0 ? (
                      <div className={styles.emptyState}>
                        <ShoppingBag size={32} />
                        <span className={styles.emptyStateTitle}>No standard orders placed yet</span>
                        <span className={styles.emptyStateDesc}>Customer has not completed checkout purchases.</span>
                      </div>
                    ) : (
                      <div className={styles.ordersList}>
                        {stdOrders.map((so: any) => (
                          <div key={so._id || so.orderNumber} className={styles.orderCard}>
                            <div className={styles.orderCardHeader}>
                              <div className={styles.orderId}>
                                <span>#{so.orderNumber}</span>
                                <span className={styles.orderTypeBadge}>Storefront</span>
                              </div>
                              <span
                                className={styles.badge}
                                style={{
                                  backgroundColor: so.status === 'Delivered' ? '#DCFCE7' : '#FFF8E1',
                                  color: so.status === 'Delivered' ? '#16A34A' : '#B45309',
                                }}
                              >
                                {so.status}
                              </span>
                            </div>

                            <div className={styles.ordersList}>
                              {so.items?.map((item: any, iIdx: number) => (
                                <div key={iIdx} className={styles.orderItemsBox}>
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className={styles.orderThumb} />
                                  ) : (
                                    <div className={styles.orderThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <ShoppingBag size={16} color="var(--admin-pink)" />
                                    </div>
                                  )}
                                  <div className={styles.orderItemDetails}>
                                    <div className={styles.orderItemTitle}>{item.name}</div>
                                    <div className={styles.orderItemMeta}>Qty: {item.quantity} • ₹{item.price} each</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className={styles.orderFooter}>
                              <div>
                                <span style={{ color: '#64748B' }}>Total: </span>
                                <span className={styles.orderTotal}>₹{so.total?.toLocaleString('en-IN')}</span>
                                <span style={{ marginLeft: '8px', fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                                  ({so.paymentMethod} • {so.paymentStatus})
                                </span>
                              </div>
                              <span style={{ color: '#94A3B8', fontSize: '11px' }}>
                                {new Date(so.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* TAB 4: JOURNEY */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'journey' && (
                <>
                  {/* Activity Timeline */}
                  <div className={styles.cardSection}>
                    <div className={styles.sectionTitle}>
                      <Clock size={15} />
                      <span>Activity Timeline</span>
                    </div>

                    {timeline.length === 0 ? (
                      <div className={styles.emptyState}>
                        <Clock size={32} />
                        <span className={styles.emptyStateTitle}>No recorded events yet</span>
                      </div>
                    ) : (
                      <div className={styles.timeline}>
                        {timeline.map((event: any, idx: number) => (
                          <div key={event.id || idx} className={styles.timelineItem}>
                            <div className={styles.timelineDot} />
                            <div className={styles.timelineItemHeader}>
                              <span className={styles.timelineTitle}>{event.title}</span>
                              <span className={styles.timelineTime}>
                                {new Date(event.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className={styles.timelineDesc}>{event.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* ─── MODAL FOOTER ─── */}
        <div className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Close
          </button>
          {phone && phone !== '—' ? (
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryBtn}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <MessageCircle size={15} />
              <span>Message Customer</span>
            </a>
          ) : (
            <button type="button" className={styles.primaryBtn} onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CustomerDetailsModal;
