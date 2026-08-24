import React from 'react';
import { X, Ticket } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './CouponModal.module.css';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
}

export const CouponModal = ({ isOpen, onClose, onApply }: CouponModalProps) => {
  if (!isOpen) return null;

  const mockCoupons = [
    { code: 'WELCOME10', desc: 'Get 10% off on your first order', minOrder: 'No minimum order value' },
    { code: 'SWEETTREAT', desc: 'Flat ₹50 off on orders above ₹500', minOrder: 'Min. order ₹500' },
    { code: 'PARTYPACK', desc: 'Get 15% off on orders above ₹1000', minOrder: 'Min. order ₹1000' }
  ];

  const handleApply = (code: string) => {
    onApply(code);
    onClose();
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3 className={styles.title}>Apply Coupon</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {mockCoupons.map(coupon => (
            <div key={coupon.code} className={styles.couponCard}>
              <div className={styles.couponBody}>
                <div className={styles.couponHeader}>
                  <div className={styles.codeWrapper}>
                    <Ticket size={16} className={styles.ticketIcon} />
                    <span className={styles.couponCode}>{coupon.code}</span>
                  </div>
                  <button className={styles.applyBtn} onClick={() => handleApply(coupon.code)}>APPLY</button>
                </div>
                <p className={styles.couponDesc}>{coupon.desc}</p>
              </div>
              <div className={styles.couponFooter}>
                <p className={styles.couponMeta}>{coupon.minOrder}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
