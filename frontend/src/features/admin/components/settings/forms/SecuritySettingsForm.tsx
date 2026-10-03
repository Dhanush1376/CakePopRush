import React from 'react';
import styles from '../AdminSettings.module.css';

export const SecuritySettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Security Settings</h2>
      <p className={styles.cardSubtitle}>Manage security and access controls.</p>
    </div>
    <div className={styles.toggleGrid}>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Enforce 2FA</span>
        </div>
        <span className={styles.toggleDesc}>Require Two-Factor Authentication for all admins</span>
      </div>
    </div>
    <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
      <label className={styles.label}>Admin Session Timeout (Minutes)</label>
      <input type="number" className={styles.input} defaultValue="60" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>IP Whitelist (comma separated)</label>
      <textarea className={`${styles.input} ${styles.textarea}`} placeholder="e.g. 192.168.1.1, 10.0.0.1"></textarea>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
