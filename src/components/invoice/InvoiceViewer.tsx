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
            initial={{ y: window.innerWidth <= 768 ? '100%' : 50, opacity: window.innerWidth <= 768 ? 1 : 0, scale: window.innerWidth <= 768 ? 1 : 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: window.innerWidth <= 768 ? '100%' : 20, opacity: window.innerWidth <= 768 ? 1 : 0, scale: window.innerWidth <= 768 ? 1 : 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.dragIndicator} />
            
            <div className={styles.toolbar}>
              <h2 className={styles.toolbarTitle}>Invoice</h2>
              <div className={styles.toolbarActions}>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => handlePrint()}
                  disabled={!data || isGenerating}
                >
                  <Printer size={16} /> <span>Print</span>
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.primary}`} 
                  onClick={handleDownload}
                  disabled={!data || isGenerating}
                >
                  <Download size={16} /> 
                  <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                </button>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className={styles.contentScroll}>
              {!data ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Preparing invoice...</p>
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
