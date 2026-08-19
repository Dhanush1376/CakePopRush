import React from 'react';
import styles from '../AdminSettings.module.css';

export const TaxSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Tax Settings</h2>
      <p className={styles.cardSubtitle}>Manage tax calculation and GST details.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Tax Calculation Strategy</label>
      <select className={styles.select} defaultValue="inclusive">
        <option value="inclusive">Prices include tax (Inclusive)</option>
        <option value="exclusive">Add tax at checkout (Exclusive)</option>
      </select>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Default Tax Rate (%)</label>
      <input type="number" className={styles.input} defaultValue="18" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Store GSTIN</label>
      <input type="text" className={styles.input} defaultValue="27AAAAA0000A1Z5" />
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
