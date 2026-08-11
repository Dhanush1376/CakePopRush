import React, { useState } from 'react';
import { Monitor, Sparkles, Layout, Image, Bell, Layers } from 'lucide-react';
import styles from './AdminStorefrontCMS.module.css';

export function AdminStorefrontCMS() {
  const [notified, setNotified] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Storefront CMS</h1>
          <p className={styles.subtitle}>
            Manage homepage banners, promotional layouts, and storefront content.
          </p>
        </div>
      </div>

      <div className={styles.comingSoonCard}>
        <div className={styles.glowBg} />
        <div className={styles.glowBg2} />

        <div className={styles.badge}>
          <Sparkles size={14} /> Storefront CMS Module
        </div>

        <div className={styles.iconWrapper}>
          <Monitor size={40} strokeWidth={2} />
        </div>

        <h2 className={styles.cardTitle}>Storefront CMS Coming Soon</h2>
        
        <p className={styles.cardDescription}>
          We are building a drag-and-drop Storefront Content Management System to let you customize homepage banners, seasonal promotions, hero sections, and category displays with ease.
        </p>

        <div className={styles.previewGrid}>
          <div className={styles.previewItem}>
            <div className={styles.previewIcon} style={{ backgroundColor: '#FFF0F5', color: 'var(--admin-pink)' }}>
              <Layout size={18} />
            </div>
            <span className={styles.previewTitle}>Hero Banners</span>
            <span className={styles.previewSub}>Drag-and-drop hero carousel editor with customizable call-to-actions.</span>
          </div>

          <div className={styles.previewItem}>
            <div className={styles.previewIcon} style={{ backgroundColor: '#FFF8E1', color: '#F59E0B' }}>
              <Image size={18} />
            </div>
            <span className={styles.previewTitle}>Media Library</span>
            <span className={styles.previewSub}>Upload & manage promotional images, seasonal graphics, and popups.</span>
          </div>

          <div className={styles.previewItem}>
            <div className={styles.previewIcon} style={{ backgroundColor: '#E0FAFC', color: 'var(--admin-cyan)' }}>
              <Layers size={18} />
            </div>
            <span className={styles.previewTitle}>Section Layouts</span>
            <span className={styles.previewSub}>Reorder homepage sections, featured collections, and reviews.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
