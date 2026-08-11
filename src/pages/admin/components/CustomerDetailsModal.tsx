import React from 'react';
import { X, Mail, Phone, MapPin, ShoppingBag, Calendar, CreditCard } from 'lucide-react';
import styles from './CustomerDetailsModal.module.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  location: string;
  orders: number;
  spent: string;
  lastOrderDate: string;
  status: string;
}

interface CustomerDetailsModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  if (!customer) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.avatar} style={{ backgroundColor: customer.avatarBg, color: customer.avatarColor }}>
            {customer.initials}
          </div>
          <div>
            <h2 className={styles.name}>{customer.name}</h2>
            <span className={`${styles.badge} ${customer.status === 'Active' ? styles.badgeActive : customer.status === 'VIP' ? styles.badgeVIP : styles.badgeInactive}`}>
              {customer.status}
            </span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact Information</h3>
            <div className={styles.infoRow}>
              <Mail size={16} className={styles.icon} />
              <span>{customer.email}</span>
            </div>
            <div className={styles.infoRow}>
              <Phone size={16} className={styles.icon} />
              <span>{customer.phone}</span>
            </div>
            <div className={styles.infoRow}>
              <MapPin size={16} className={styles.icon} />
              <span>{customer.location}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Order Summary</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <ShoppingBag size={18} className={styles.statIcon} style={{ color: 'var(--admin-pink)' }} />
                <div className={styles.statValue}>{customer.orders}</div>
                <div className={styles.statLabel}>Total Orders</div>
              </div>
              <div className={styles.statBox}>
                <CreditCard size={18} className={styles.statIcon} style={{ color: 'var(--admin-cyan)' }} />
                <div className={styles.statValue}>{customer.spent}</div>
                <div className={styles.statLabel}>Total Spent</div>
              </div>
              <div className={styles.statBox}>
                <Calendar size={18} className={styles.statIcon} style={{ color: '#F59E0B' }} />
                <div className={styles.statValue}>{customer.lastOrderDate}</div>
                <div className={styles.statLabel}>Last Order</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose}>Close</button>
          <button className={styles.primaryBtn}>Message Customer</button>
        </div>
      </div>
    </div>
  );
}
