import React from 'react';
import styles from '../AdminSettings.module.css';

export const ShippingSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Shipping Settings</h2>
      <p className={styles.cardSubtitle}>Configure shipping zones and rates.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Default Shipping Rate (₹)</label>
      <input type="number" className={styles.input} defaultValue="50" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Free Shipping Threshold (₹)</label>
      <input type="number" className={styles.input} defaultValue="500" />
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Set to 0 to disable free shipping.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Shipping Partner Integration</label>
      <select className={styles.select} defaultValue="delhivery">
        <option value="none">Manual Shipping</option>
        <option value="delhivery">Delhivery API</option>
        <option value="shiprocket">Shiprocket</option>
      </select>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
