import React from 'react';
import styles from '../AdminSettings.module.css';

export const EmailSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Email Settings</h2>
      <p className={styles.cardSubtitle}>Configure SMTP server for outgoing emails.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>SMTP Host</label>
      <input type="text" className={styles.input} defaultValue="smtp.sendgrid.net" />
    </div>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>SMTP Port</label>
        <input type="text" className={styles.input} defaultValue="587" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Encryption</label>
        <select className={styles.select} defaultValue="tls">
          <option value="tls">TLS</option>
          <option value="ssl">SSL</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>SMTP Username</label>
        <input type="text" className={styles.input} defaultValue="apikey" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>SMTP Password</label>
        <input type="password" className={styles.input} defaultValue="" />
      </div>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
      <button className={styles.btnSecondary}>Test Connection</button>
    </div>
  </div>
);
