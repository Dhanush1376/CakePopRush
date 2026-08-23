import React, { useState } from 'react';
import { MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import styles from './DeliveryAddressBar.module.css';
import { AddressModal, AddressData } from '@/pages/storefront/checkout/components/AddressModal';

export const DeliveryAddressBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  const handleSaveAddress = (data: AddressData) => {
    setSelectedAddress(data);
    setIsModalOpen(false);
  };

  return (
    <>
      <button className={styles.bar} onClick={() => setIsModalOpen(true)}>
        <div className={styles.innerContainer}>
          <div className={styles.content}>
            <div className={styles.iconWrapper}>
              <MapPin size={16} strokeWidth={1.5} />
            </div>
            <div className={styles.textContainer}>
              {selectedAddress ? (
                <>
                  <span className={styles.title}>
                    Deliver to: {selectedAddress.name} <CheckCircle2 size={14} className={styles.checkIcon} />
                  </span>
                  <span className={styles.subtitle}>
                    {selectedAddress.houseNo}, {selectedAddress.street}, {selectedAddress.locality} - {selectedAddress.pincode}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.title}>Add a delivery address</span>
                  <span className={styles.subtitle}>Enter your location to see delivery availability</span>
                </>
              )}
            </div>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} className={styles.chevron} />
        </div>
      </button>

      <AddressModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={selectedAddress}
      />
    </>
  );
};
