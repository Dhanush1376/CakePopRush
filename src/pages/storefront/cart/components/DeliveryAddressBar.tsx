import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import styles from './DeliveryAddressBar.module.css';

export const DeliveryAddressBar = () => {
  return (
    <button className={styles.bar}>
      <div className={styles.innerContainer}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <MapPin size={16} strokeWidth={1.5} />
          </div>
          <div className={styles.textContainer}>
            <span className={styles.title}>Add a delivery address</span>
            <span className={styles.subtitle}>Enter your location to see delivery availability</span>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className={styles.chevron} />
      </div>
    </button>
  );
};
