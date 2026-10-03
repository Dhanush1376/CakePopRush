import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Cake,
  Package,
  FileText,
  Palette,
  Tag,
  ZoomIn,
} from 'lucide-react';
import styles from './CustomOrderDetailModal.module.css';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { AdminImageLightbox } from './AdminImageLightbox';
import { adminCustomOrderData } from '@/features/admin/api/adminDataProvider';

interface CustomOrderDetailModalProps {
  order: any;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: any) => void;
}

function formatSpecKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function formatWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

const STATUS_THEME_MAP: Record<string, { bg: string; color: string; border: string }> = {
  'Pending Quote': { bg: '#FEF3C7', color: '#B45309', border: '#FBBF24' },
  'Quoted':        { bg: '#EDE9FE', color: '#6D28D9', border: '#8B5CF6' },
  'Approved':      { bg: '#D1FAE5', color: '#047857', border: '#10B981' },
  'In Progress':   { bg: '#DBEAFE', color: '#2563EB', border: '#3B82F6' },
  'Completed':     { bg: '#D1FAE5', color: '#059669', border: '#10B981' },
  'Rejected':      { bg: '#FFE4E6', color: '#BE123C', border: '#F4364C' },
};

export function CustomOrderDetailModal({
  order,
  onClose,
  onOrderUpdated,
}: CustomOrderDetailModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'Pending Quote');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [order]);

  if (!order) return null;

  const customerPhone = order.customerPhone || order.phone || '';
  const customerPhoneClean = formatWhatsAppPhone(customerPhone);
  const customerEmail = order.customerEmail || order.email || '';
  const customerName = order.customerName || 'Valued Customer';
  const displayImage =
    order.designImg ||
    order.designImage ||
    order.product?.image ||
    order.customizationDetails?.referenceImage ||
    '/images/placeholder.jpg';

  const customSpecEntries = order.customizationDetails
    ? Object.entries(order.customizationDetails).filter(
        ([k, v]) =>
          !k.startsWith('field_') &&
          v !== '' &&
          v !== null &&
          v !== undefined &&
          k !== 'referenceImage'
      )
    : [];

  const waMessage = encodeURIComponent(
    `Hi ${customerName}, this is CakePopRush regarding your custom Cake Pops request #${order.orderId || order.id} (${order.occasion || 'Custom'} occasion). We would love to discuss your order details!`
  );
  const waUrl = customerPhoneClean ? `https://wa.me/${customerPhoneClean}?text=${waMessage}` : '#';

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await adminCustomOrderData.updateStatus(order.id || order._id, newStatus);
      setCurrentStatus(newStatus);
      onOrderUpdated?.(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusTheme = STATUS_THEME_MAP[currentStatus] || { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dragHandle} />

        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.headerTopRow}>
            <div className={styles.headerTitleGroup}>
              <span className={styles.orderIdBadge}>#{order.orderId || order.id}</span>
              <span className={styles.typeBadge}>
                {order.source === 'PRODUCT' ? 'Product Customization' : 'General Custom Order'}
              </span>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <select
                  aria-label="Change request status"
                  value={currentStatus}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                  style={{
                    backgroundColor: statusTheme.bg,
                    color: statusTheme.color,
                    borderColor: statusTheme.border,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: isUpdatingStatus ? 'wait' : 'pointer',
                    outline: 'none',
                    height: '30px',
                  }}
                >
                  <option value="Pending Quote">Pending Quote</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <button 
              type="button" 
              className={styles.closeBtn} 
              onClick={onClose} 
              aria-label="Close details"
            >
              <X size={17} />
            </button>
          </div>

          <div className={styles.headerMetaRow}>
            <span className={styles.metaItem}>
              <Clock size={13} className={styles.metaIcon} />
              <span>Created: {order.createdDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent')}</span>
            </span>
            <span className={styles.metaDivider}>·</span>
            <span className={styles.metaItem}>
              <Calendar size={13} className={styles.metaIcon} />
              <span>Target Due: {order.targetDate || (order.targetDateRaw ? new Date(order.targetDateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible')}</span>
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className={styles.content}>
          {/* Order Scope & Specifications */}
          <div className={styles.cardSection}>
            <div className={styles.cardSectionHeader}>
              <span className={styles.cardSectionTitle}>
                <Palette size={13} /> Order Requirements & Design
              </span>
              {order.budget && (
                <span className={styles.budgetBadge}>
                  Budget: ₹{typeof order.budget === 'number' ? order.budget.toLocaleString('en-IN') : order.budget}
                </span>
              )}
            </div>

            <div className={styles.heroMainRow}>
              <div
                className={styles.heroThumbWrapper}
                onClick={() => setIsLightboxOpen(true)}
                title="Click to view full reference photo"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsLightboxOpen(true);
                  }
                }}
              >
                <img
                  src={displayImage}
                  alt={order.occasion ? `${order.occasion} Reference Design` : 'Custom Cake Pops'}
                  className={styles.heroThumb}
                />
                <button
                  type="button"
                  className={styles.heroThumbBadge}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  title="Click to view full reference photo"
                >
                  <ZoomIn size={12} />
                  <span>Reference Photo</span>
                </button>
              </div>

              <div className={styles.heroDetails}>
                <div className={styles.heroSpecsGrid}>
                  <div className={styles.specPill}>
                    <div className={styles.specLabelRow}>
                      <Cake size={13} className={styles.specIcon} />
                      <span className={styles.specLabel}>
                        {order.source === 'PRODUCT' ? 'Base Product' : 'Occasion'}
                      </span>
                    </div>
                    <span className={styles.specValue}>
                      {order.source === 'PRODUCT'
                        ? (order.product?.name || order.occasion || 'Custom Product')
                        : (order.occasion || 'Custom Theme')}
                    </span>
                  </div>

                  <div className={styles.specPill}>
                    <div className={styles.specLabelRow}>
                      <Package size={13} className={styles.specIcon} />
                      <span className={styles.specLabel}>Batch Size</span>
                    </div>
                    <span className={styles.specValue}>
                      {order.quantity ? `${order.quantity} pops` : 'Flexible'}
                    </span>
                  </div>

                  <div className={styles.specPill}>
                    <div className={styles.specLabelRow}>
                      <Calendar size={13} className={styles.specIcon} />
                      <span className={styles.specLabel}>Event Due Date</span>
                    </div>
                    <span className={styles.specValue}>
                      {order.targetDate || (order.targetDateRaw ? new Date(order.targetDateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible / TBD')}
                    </span>
                  </div>

                  <div className={styles.specPill}>
                    <div className={styles.specLabelRow}>
                      <Clock size={13} className={styles.specIcon} />
                      <span className={styles.specLabel}>Submitted On</span>
                    </div>
                    <span className={styles.specValue}>
                      {order.createdDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions & Customer Notes (if provided) */}
            {(order.occasionDescription || order.description) && (
              <div className={styles.heroNotesBox}>
                <div className={styles.heroNotesHeader}>
                  <FileText size={13} />
                  <span>Customer Requirements & Instructions</span>
                </div>
                <p className={styles.heroNotesText}>
                  {order.occasionDescription || order.description}
                </p>
              </div>
            )}

            {/* Dynamic Custom Form Specifications (if present) */}
            {customSpecEntries.length > 0 && (
              <div className={styles.customSpecsContainer}>
                <div className={styles.customSpecsHeader}>
                  <Tag size={13} />
                  <span>Customization Specifications</span>
                </div>
                <div className={styles.customSpecsGrid}>
                  {customSpecEntries.map(([key, val]) => (
                    <div key={key} className={styles.customSpecItem}>
                      <span className={styles.customSpecKey}>{formatSpecKey(key)}</span>
                      <span className={styles.customSpecVal}>
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer & Communication */}
          <div className={styles.cardSection}>
            <div className={styles.cardSectionHeader}>
              <span className={styles.cardSectionTitle}>
                <User size={13} /> Customer Details
              </span>
            </div>

            <div className={styles.customerBox}>
              <div className={styles.customerProfile}>
                <div
                  className={styles.customerAvatar}
                  style={{
                    backgroundColor: order.avatarBg || '#FFF0F5',
                    color: order.avatarColor || 'var(--admin-pink, #F20D6F)',
                  }}
                >
                  {order.initials || customerName.slice(0, 2).toUpperCase()}
                </div>

                <div className={styles.customerMeta}>
                  <div className={styles.customerName}>{customerName}</div>
                  <div className={styles.customerContacts}>
                    {customerEmail && (
                      <a href={`mailto:${customerEmail}`} className={styles.contactChip} title="Send Email">
                        <Mail size={12.5} className={styles.contactIcon} />
                        <span>{customerEmail}</span>
                      </a>
                    )}
                    {customerPhone && (
                      <a href={`tel:${customerPhone}`} className={styles.contactChip} title="Call Phone">
                        <Phone size={12.5} className={styles.contactIcon} />
                        <span>{customerPhone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {customerPhoneClean && (
                <div className={styles.customerActionWrapper}>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsAppPillBtn}
                    title="Chat directly with customer on WhatsApp"
                  >
                    <WhatsAppIcon style={{ width: '14px', height: '14px' }} />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span>Request ID: #{order.orderId || order.id}</span>
          </div>

          <div className={styles.footerRight}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Close
            </button>
            {customerPhoneClean && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsApp}
              >
                <WhatsAppIcon style={{ width: '15px', height: '15px' }} />
                <span>Message Customer</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Big Picture Lightbox */}
      <AdminImageLightbox
        isOpen={isLightboxOpen}
        src={displayImage}
        title={`Reference Photo • Request #${order.orderId || order.id}`}
        subtitle={`${customerName} • ${order.occasion ? String(order.occasion).replace(/_/g, ' ') : 'Custom Design'}`}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>,
    document.body
  );
}
