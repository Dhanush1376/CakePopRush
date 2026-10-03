import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import styles from './ConfirmActionModal.module.css';

export interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'trash' | 'reset' | 'alert';
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'trash',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'reset':
        return (
          <div className={`${styles.iconWrap} ${styles.iconWarning}`}>
            <RotateCcw size={22} />
          </div>
        );
      case 'alert':
        return (
          <div className={`${styles.iconWrap} ${styles.iconPrimary}`}>
            <AlertTriangle size={22} />
          </div>
        );
      case 'trash':
      default:
        return (
          <div className={`${styles.iconWrap} ${styles.iconDanger}`}>
            <Trash2 size={22} />
          </div>
        );
    }
  };

  const getConfirmClass = () => {
    switch (variant) {
      case 'warning':
        return styles.confirmWarning;
      case 'primary':
        return styles.confirmPrimary;
      case 'danger':
      default:
        return styles.confirmDanger;
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          title="Close dialog"
        >
          <X size={16} />
        </button>

        {renderIcon()}

        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${getConfirmClass()}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
