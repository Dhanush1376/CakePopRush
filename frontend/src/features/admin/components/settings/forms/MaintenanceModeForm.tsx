import React from 'react';
import styles from '../AdminSettings.module.css';

export const MaintenanceModeForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Maintenance Mode</h2>
      <p className={styles.cardSubtitle}>Temporarily take your store offline.</p>
    </div>
    <div className={styles.toggleGrid}>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Enable Maintenance Mode</span>
        </div>
        <span className={styles.toggleDesc}>Storefront will be hidden from public</span>
      </div>
    </div>
    <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
      <label className={styles.label}>Custom Offline Message</label>
      <textarea className={`${styles.input} ${styles.textarea}`} defaultValue="We are currently performing scheduled maintenance. We'll be back shortly!"></textarea>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
