import React from 'react';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import {
  Calendar,
  Users,
  Clock,
  Phone,
  Package,
  Edit3,
  PartyPopper,
  Sliders,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import styles from './CustomerCustomOrderDetailModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onEdit: (order: any) => void;
}

const STATUS_THEME: Record<string, { color: string; bg: string }> = {
  'Pending Quote': { color: '#B45309', bg: '#FEF3C7' },
  'Under Review':  { color: '#0369A1', bg: '#E0F2FE' },
  'Quoted':        { color: '#6D28D9', bg: '#EDE9FE' },
  'Quote Sent':    { color: '#6D28D9', bg: '#EDE9FE' },
  'Approved':      { color: '#047857', bg: '#D1FAE5' },
  'In Progress':   { color: '#2563EB', bg: '#DBEAFE' },
  'Completed':     { color: '#059669', bg: '#D1FAE5' },
  'Declined':      { color: '#BE123C', bg: '#FFE4E6' },
  'Rejected':      { color: '#BE123C', bg: '#FFE4E6' },
  'Cancelled':     { color: '#64748B', bg: '#F1F5F9' },
};

export const CustomerCustomOrderDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  order,
  onEdit,
}) => {
  if (!order) return null;

  const theme = STATUS_THEME[order.status] || { color: '#475569', bg: '#F1F5F9' };
  const isEditable = order.status === 'Pending Quote';
  const prod = order.productSnapshot || order.product;
  const hasProduct = Boolean((order.source === 'PRODUCT' || order.customOrderType === 'product') && prod);
  const designImageSrc = order.designImage || order.attachments?.[0]?.url || (hasProduct ? prod?.image : null);

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

  const formattedTargetDate = order.targetDate || (order.targetDateRaw
    ? new Date(order.targetDateRaw).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not specified');

  const formattedCreatedDate = order.createdDate || (order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—');

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Order Details"
    >
      <div className={styles.modalContent}>
        {/* Top Header Section */}
        <div className={styles.topSection}>
          <div className={styles.orderIdBadge}>
            <span className={styles.orderIdText}>#{order.orderId}</span>
            <span className={styles.sourceTag}>
              {order.source === 'PRODUCT' ? 'Product Customization' : 'General Custom Request'}
            </span>
          </div>

          <span
            className={styles.statusPill}
            style={{ color: theme.color, backgroundColor: theme.bg }}
          >
            <Clock size={13} />
            {order.status}
          </span>
        </div>

        {/* Linked Base Product Card */}
        {hasProduct && prod && (
          <div className={styles.productCard}>
            {prod.image ? (
              <img
                src={prod.image}
                alt={prod.name}
                className={styles.productThumb}
              />
            ) : (
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-brand-turquoise, #06B6D4)',
                }}
              >
                <Package size={24} />
              </div>
            )}
            <div className={styles.productInfo}>
              <div className={styles.productLabel}>Base Product</div>
              <div className={styles.productName}>{prod.name}</div>
              {prod.flavor && (
                <div className={styles.productSub}>
                  Flavor: {prod.flavor}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              <Calendar size={13} /> Target Event Date
            </span>
            <span className={styles.detailValue}>{formattedTargetDate}</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              <Users size={13} /> Quantity
            </span>
            <span className={styles.detailValue}>{order.quantity} units</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              <PartyPopper size={13} /> Occasion
            </span>
            <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>
              {order.occasion ? String(order.occasion).replace(/_/g, ' ') : 'Other / Custom'}
            </span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              <Phone size={13} /> Contact Number
            </span>
            <span className={styles.detailValue}>
              {order.customerPhone || order.phone || order.customer?.phone || 'Not specified'}
            </span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Submitted Date</span>
            <span className={styles.detailValue}>{formattedCreatedDate}</span>
          </div>
        </div>

        {/* Requirements & Notes */}
        {order.occasionDescription && (
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <FileText size={14} /> Requirements & Customization Vision
            </div>
            <div className={styles.requirementsBox}>
              {order.occasionDescription}
            </div>
          </div>
        )}

        {/* Dynamic Customization Specifications */}
        {customSpecEntries.length > 0 && (
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <Sliders size={14} /> Customization Specifications
            </div>
            <div className={styles.detailsGrid}>
              {customSpecEntries.map(([key, val]) => (
                <div key={key} className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/[_-]/g, ' ')
                      .replace(/^\w/, (c) => c.toUpperCase())
                      .trim()}
                  </span>
                  <span className={styles.detailValue}>
                    {Array.isArray(val)
                      ? val.join(', ')
                      : typeof val === 'object'
                      ? JSON.stringify(val)
                      : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Design Reference Image */}
        {designImageSrc && (
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <ImageIcon size={14} /> Design Reference
            </div>
            <div className={styles.designImageWrapper}>
              <img
                src={designImageSrc}
                alt="Custom order reference design"
                className={styles.designImage}
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className={styles.modalActions}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
          {isEditable && (
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => {
                onClose();
                onEdit(order);
              }}
            >
              <Edit3 size={14} />
              Edit Custom Order
            </button>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};
