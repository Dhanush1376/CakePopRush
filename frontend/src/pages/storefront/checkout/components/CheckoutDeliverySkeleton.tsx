import React from 'react';
import styles from './CheckoutDeliverySkeleton.module.css';

export const CheckoutDeliverySkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonWrapper} aria-busy="true" aria-label="Loading delivery addresses">
      {/* Header: SAVED ADDRESSES */}
      <div className={styles.savedHeader}>
        <div 
          className={styles.shimmer} 
          style={{ width: '130px', height: '14px', borderRadius: '4px' }} 
        />
        <div 
          className={styles.shimmer} 
          style={{ width: '60px', height: '12px', borderRadius: '4px' }} 
        />
      </div>

      {/* Address List with 2 cards */}
      <div className={styles.addressList}>
        {/* Card 1: Selected / Default Address */}
        <div className={`${styles.addressCard} ${styles.selectedCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.radioRow}>
              {/* Checked radio circle with pink inner dot */}
              <div className={`${styles.radio} ${styles.radioSelected}`}>
                <div className={styles.radioInner} />
              </div>
              {/* Recipient / Label Name */}
              <div 
                className={styles.shimmer} 
                style={{ width: '105px', height: '17px', borderRadius: '4px' }} 
              />
              {/* HOME Badge */}
              <div 
                className={styles.shimmer} 
                style={{ width: '48px', height: '17px', borderRadius: '10px' }} 
              />
              {/* DEFAULT Badge */}
              <div 
                className={styles.shimmer} 
                style={{ width: '58px', height: '17px', borderRadius: '6px' }} 
              />
            </div>
            {/* Edit / More icon */}
            <div 
              className={styles.shimmer} 
              style={{ width: '28px', height: '28px', borderRadius: '8px' }} 
            />
          </div>

          {/* Address Details */}
          <div className={styles.addressDetails}>
            <div 
              className={styles.shimmer} 
              style={{ width: '84%', height: '13px', borderRadius: '3px' }} 
            />
            <div 
              className={styles.shimmer} 
              style={{ width: '62%', height: '13px', borderRadius: '3px' }} 
            />
            <div 
              className={styles.shimmer} 
              style={{ width: '46%', height: '13px', borderRadius: '3px' }} 
            />
          </div>

          <div className={styles.cardDivider} />

          {/* Mobile Contact Row */}
          <div className={styles.mobileContact}>
            <div 
              className={styles.shimmer} 
              style={{ width: '13px', height: '13px', borderRadius: '50%' }} 
            />
            <div 
              className={styles.shimmer} 
              style={{ width: '135px', height: '12px', borderRadius: '3px' }} 
            />
          </div>
        </div>

        {/* Card 2: Other Saved Address */}
        <div className={styles.addressCard}>
          <div className={styles.cardHeader}>
            <div className={styles.radioRow}>
              {/* Unchecked radio circle */}
              <div className={styles.radio} />
              {/* Recipient / Label Name */}
              <div 
                className={styles.shimmer} 
                style={{ width: '120px', height: '17px', borderRadius: '4px' }} 
              />
              {/* WORK Badge */}
              <div 
                className={styles.shimmer} 
                style={{ width: '50px', height: '17px', borderRadius: '10px' }} 
              />
            </div>
            {/* Edit / More icon */}
            <div 
              className={styles.shimmer} 
              style={{ width: '28px', height: '28px', borderRadius: '8px' }} 
            />
          </div>

          {/* Address Details */}
          <div className={styles.addressDetails}>
            <div 
              className={styles.shimmer} 
              style={{ width: '76%', height: '13px', borderRadius: '3px' }} 
            />
            <div 
              className={styles.shimmer} 
              style={{ width: '55%', height: '13px', borderRadius: '3px' }} 
            />
            <div 
              className={styles.shimmer} 
              style={{ width: '42%', height: '13px', borderRadius: '3px' }} 
            />
          </div>

          <div className={styles.cardDivider} />

          {/* Mobile Contact Row */}
          <div className={styles.mobileContact}>
            <div 
              className={styles.shimmer} 
              style={{ width: '13px', height: '13px', borderRadius: '50%' }} 
            />
            <div 
              className={styles.shimmer} 
              style={{ width: '140px', height: '12px', borderRadius: '3px' }} 
            />
          </div>
        </div>

        {/* Add New Address Placeholder Button */}
        <div className={styles.addAddressPlaceholder}>
          <div 
            className={styles.shimmer} 
            style={{ width: '16px', height: '16px', borderRadius: '50%' }} 
          />
          <div 
            className={styles.shimmer} 
            style={{ width: '130px', height: '14px', borderRadius: '4px' }} 
          />
        </div>
      </div>
    </div>
  );
};
