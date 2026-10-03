import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import styles from './DeliveryCard.module.css';
import { DeliveryAddress } from '@/features/orders/types';

interface InfoRowProps {
  label: string;
  value: string;
  accent?: boolean;
  compact?: boolean;
}

export function DeliveryCard({ 
  address, 
  estimatedDelivery, 
  estimatedTime,
  InfoRowComponent
}: { 
  address: DeliveryAddress;
  estimatedDelivery?: string;
  estimatedTime?: string;
  InfoRowComponent: React.ComponentType<InfoRowProps>;
}) {
  return (
    <>
      <div className={styles.addressCard}>
        <div className={styles.addressType}>
          <MapPin size={14} />
          <span>{address.type}</span>
        </div>
        <p className={styles.addressName}>{address.recipientName}</p>
        <p className={styles.addressLine}>
          {address.houseNo}<br />
          {address.street}, {address.area}<br />
          {address.city}, {address.state} – {address.pincode}
        </p>
        <p className={styles.addressPhone}>
          <Phone size={12} /> {address.phone}
        </p>
      </div>
      {estimatedDelivery && (
        <div className={styles.metaRowGroup}>
          <InfoRowComponent 
            label="Estimated Delivery" 
            value={`${estimatedDelivery}, ${estimatedTime}`} 
            accent 
            compact 
          />
        </div>
      )}
    </>
  );
}
