import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Phone, Loader2 } from 'lucide-react';
import styles from './CustomOrderQuickModal.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CustomOrderQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export const CustomOrderQuickModal: React.FC<CustomOrderQuickModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [targetDate, setTargetDate] = useState('');
  const [quantity, setQuantity] = useState('12');
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (isSubmitting) return;

    const newErrors: Record<string, string> = {};
    if (!targetDate) newErrors.targetDate = 'Target Date is required';
    if (!quantity || parseInt(quantity, 10) < 1) newErrors.quantity = 'Quantity is required';
    if (!mobileNumber.trim()) newErrors.mobileNumber = 'Mobile Number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      targetDate,
      quantity,
      mobileNumber: mobileNumber.trim(),
    });

    // Reset local state after submission
    setTargetDate('');
    setQuantity('12');
    setMobileNumber('');
    setErrors({});
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSubmitting) onClose();
          }}
        >
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-modal-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.dragHandle} />
            <div className={styles.header}>
              <div className={styles.titleBox}>
                <h2 id="quick-modal-title" className={styles.title}>
                  Almost there!
                </h2>
                <p className={styles.subtitle}>Just a few more details to complete your request.</p>
              </div>
              <button
                className={styles.closeButton}
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close custom order modal"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.row}>
                <Input
                  label="TARGET DATE"
                  type="date"
                  placeholder="Select target date"
                  min={new Date().toISOString().split('T')[0]}
                  leftIcon={<Calendar size={18} />}
                  value={targetDate}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setTargetDate(e.target.value);
                    if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: '' }));
                  }}
                  error={errors.targetDate}
                  fullWidth
                />
                <Input
                  label="QTY"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g. 12"
                  leftIcon={<Users size={18} />}
                  value={quantity}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  error={errors.quantity}
                  fullWidth
                />
              </div>
              <div className={styles.inputWrapper}>
                <Input
                  label="MOBILE NUMBER"
                  type="tel"
                  placeholder="e.g. +1 234 567 8900"
                  leftIcon={<Phone size={18} />}
                  value={mobileNumber}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: '' }));
                  }}
                  error={errors.mobileNumber}
                  fullWidth
                />
              </div>
            </div>

            <div className={styles.footer}>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Final Request'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
