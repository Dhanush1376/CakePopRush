import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader2, PartyPopper, CheckCircle2 } from 'lucide-react';
import styles from './AdminCustomOrderConfig.module.css';

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  publishing: boolean;
  isSuccess?: boolean;
  currentVersion: number;
}

export const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  publishing,
  isSuccess = false,
  currentVersion,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !publishing && !isSuccess) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, publishing, isSuccess, onClose]);

  if (!isOpen) return null;

  const nextVersion = (currentVersion || 1) + 1;

  return createPortal(
    <div
      className={styles.publishModalOverlay}
      onClick={() => {
        if (!publishing && !isSuccess) onClose();
      }}
    >
      <div className={styles.publishModalCard} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        {!isSuccess && (
          <button
            type="button"
            className={styles.publishModalCloseBtn}
            onClick={onClose}
            disabled={publishing}
            title="Close dialog"
          >
            <X size={16} />
          </button>
        )}

        {isSuccess ? (
          /* Celebratory Success Animation State */
          <div className={styles.publishSuccessWrap}>
            <div className={styles.publishSuccessIconBox}>
              <CheckCircle2 size={36} />
              <PartyPopper size={20} className={styles.sparklePulse} />
            </div>
            <h3 className={styles.publishSuccessTitle}>Updated Successfully!</h3>
            <p className={styles.publishSuccessDesc}>
              Configuration v{nextVersion} is now live on the storefront.
            </p>
          </div>
        ) : (
          <>
            {/* Visual Icon Badge */}
            <div className={styles.publishModalIconWrap}>
              <Send size={22} />
            </div>

            {/* Title & Description */}
            <div className={styles.publishModalHeader}>
              <h3 className={styles.publishModalTitle}>Publish Configuration Live?</h3>
              <p className={styles.publishModalDesc}>
                This will immediately update the custom order steps and questions visible to all customers on the storefront.
              </p>
            </div>

            {/* Details / Impact Box */}
            <div className={styles.publishImpactBox}>
              <div className={styles.publishImpactRow}>
                <span className={styles.publishImpactLabel}>Target Destination</span>
                <span className={styles.publishImpactValue}>Customer Storefront</span>
              </div>
              <div className={styles.publishImpactRow}>
                <span className={styles.publishImpactLabel}>Version Upgrade</span>
                <span className={styles.publishImpactBadge}>
                  <CheckCircle2 size={11} /> v{nextVersion} Live
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.publishModalActions}>
              <button
                type="button"
                className={styles.publishModalCancelBtn}
                onClick={onClose}
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.publishModalConfirmBtn}
                onClick={onConfirm}
                disabled={publishing}
              >
                {publishing ? (
                  <>
                    <Loader2 size={14} className={styles.publishSpinner} />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Publish Live</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
