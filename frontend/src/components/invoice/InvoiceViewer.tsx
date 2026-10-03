import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useReactToPrint } from 'react-to-print';
import { InvoiceData } from '@/types/invoice';
import { InvoiceDocument } from './InvoiceDocument';
import { InvoicePDF } from './InvoicePDF';
import styles from './InvoiceViewer.module.css';

export const downloadInvoicePDF = async (data: InvoiceData) => {
  const blob = await pdf(<InvoicePDF data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CakePopRush-Invoice-${data.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface InvoiceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData | null;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ isOpen, onClose, data }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: data ? `Invoice-${data.invoiceNumber}` : 'Invoice',
  });

  const handleDownload = async () => {
    if (!data) return;
    setIsGenerating(true);
    setError(null);
    try {
      await downloadInvoicePDF(data);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('We couldn\'t generate the invoice right now. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalWrapper}>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            role="dialog"
            aria-modal="true"
          >
            
            {/* Modal Drag Handle Pill */}
            <div className={styles.dragHandle} />

            <div className={styles.toolbar}>
              <h2 className={styles.toolbarTitle}>Invoice</h2>
              <div className={styles.toolbarActions}>
                <button 
                  type="button"
                  className={styles.actionBtn} 
                  onClick={() => handlePrint()}
                  disabled={!data || isGenerating}
                  title="Print Invoice"
                  aria-label="Print Invoice"
                >
                  <Printer size={18} />
                </button>
                <button 
                  type="button"
                  className={`${styles.actionBtn} ${styles.primary}`} 
                  onClick={handleDownload}
                  disabled={!data || isGenerating}
                  title="Download Invoice PDF"
                  aria-label="Download Invoice PDF"
                >
                  <Download size={18} />
                </button>
                <button 
                  type="button"
                  className={styles.closeBtn} 
                  onClick={onClose} 
                  aria-label="Close invoice"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className={styles.contentScroll}>
              {!data ? (
                <div className={styles.invoiceSkeleton} role="status" aria-label="Loading invoice...">
                  {/* Header & Logo skeleton */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.invoiceSkeletonBar} style={{ width: '160px', height: '28px' }} />
                    <div className={styles.invoiceSkeletonBar} style={{ width: '120px', height: '24px' }} />
                  </div>
                  {/* Invoice metadata skeleton */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '40%' }}>
                      <div className={styles.invoiceSkeletonBar} style={{ width: '80%', height: '14px' }} />
                      <div className={styles.invoiceSkeletonBar} style={{ width: '100%', height: '14px' }} />
                      <div className={styles.invoiceSkeletonBar} style={{ width: '60%', height: '14px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '30%', alignItems: 'flex-end' }}>
                      <div className={styles.invoiceSkeletonBar} style={{ width: '90%', height: '14px' }} />
                      <div className={styles.invoiceSkeletonBar} style={{ width: '70%', height: '14px' }} />
                    </div>
                  </div>
                  {/* Table Skeleton */}
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className={styles.invoiceSkeletonBar} style={{ width: '100%', height: '36px', borderRadius: '8px' }} />
                    <div className={styles.invoiceSkeletonBar} style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
                    <div className={styles.invoiceSkeletonBar} style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
                    <div className={styles.invoiceSkeletonBar} style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
                  </div>
                  {/* Total summary skeleton */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <div className={styles.invoiceSkeletonBar} style={{ width: '220px', height: '60px', borderRadius: '8px' }} />
                  </div>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <p className={styles.errorTitle}>Unable to Download Invoice</p>
                  <p className={styles.errorSub}>{error}</p>
                  <button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleDownload}>
                    Try Again
                  </button>
                </div>
              ) : (
                <div ref={componentRef}>
                  <InvoiceDocument data={data} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
