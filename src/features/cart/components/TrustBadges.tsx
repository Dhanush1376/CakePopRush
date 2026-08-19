import React from 'react';
import { ShieldCheck, Award, CreditCard } from 'lucide-react';
import styles from './TrustBadges.module.css';

interface TrustBadgesProps {
  variant?: 'default' | 'turquoise';
}

export const TrustBadges = ({ variant = 'default' }: TrustBadgesProps = {}) => {
  return (
    <div className={`${styles.container} ${variant === 'turquoise' ? styles.turquoise : ''}`}>
      <div className={styles.badge}>
        <Award size={18} strokeWidth={1.5} className={styles.icon} />
        <span className={styles.text}>Genuine Products</span>
      </div>
      <div className={styles.badge}>
        <ShieldCheck size={18} strokeWidth={1.5} className={styles.icon} />
        <span className={styles.text}>Safe & Secure Checkout</span>
      </div>
      <div className={styles.badge}>
        <CreditCard size={18} strokeWidth={1.5} className={styles.icon} />
        <span className={styles.text}>Secure Payments</span>
      </div>
    </div>
  );
};
