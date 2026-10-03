import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Download, ZoomIn, ZoomOut } from 'lucide-react';
import styles from './AdminImageLightbox.module.css';

export interface AdminImageLightboxProps {
  isOpen: boolean;
  src?: string | null;
  alt?: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const AdminImageLightbox: React.FC<AdminImageLightboxProps> = ({
  isOpen,
  src,
  alt = 'Reference Design Image',
  title = 'Reference Photo',
  subtitle,
  onClose,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleClose = () => {
    setIsZoomed(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed((prev) => !prev);
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true" aria-label={title}>
      {/* Top Header Bar */}
      <div className={styles.topBar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleToggleZoom}
            title={isZoomed ? 'Fit to Screen' : 'Zoom 100%'}
          >
            {isZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
            <span>{isZoomed ? 'Fit' : 'Zoom'}</span>
          </button>

          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
            title="Open in new tab"
          >
            <ExternalLink size={15} />
            <span>Open Tab</span>
          </a>

          <a
            href={src}
            download="custom-order-reference.png"
            className={styles.actionBtn}
            title="Download full image"
          >
            <Download size={15} />
            <span>Download</span>
          </a>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close image preview"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className={styles.imageStage} onClick={handleClose}>
        <div className={styles.imageContainer} onClick={(e) => e.stopPropagation()}>
          <img
            src={src}
            alt={alt}
            className={`${styles.previewImage} ${isZoomed ? styles.previewImageZoomed : ''}`}
            onClick={handleToggleZoom}
            title={isZoomed ? 'Click to fit screen' : 'Click to zoom in'}
            style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <p className={styles.bottomHint} onClick={(e) => e.stopPropagation()}>
        <span>Click image to {isZoomed ? 'fit screen' : 'zoom in'}</span>
        <span>•</span>
        <span>Press Esc or click outside to close</span>
      </p>
    </div>,
    document.body
  );
};
