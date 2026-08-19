import React from 'react';
import styles from '../AdminSettings.module.css';

export const SMSSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>SMS Settings</h2>
      <p className={styles.cardSubtitle}>Configure SMS gateway for customer updates.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>SMS Gateway</label>
      <select className={styles.select} defaultValue="twilio">
        <option value="twilio">Twilio</option>
        <option value="msg91">MSG91</option>
      </select>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Account SID / Auth Key</label>
      <input type="text" className={styles.input} defaultValue="" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Auth Token</label>
      <input type="password" className={styles.input} defaultValue="" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Sender ID / Phone Number</label>
      <input type="text" className={styles.input} defaultValue="+1234567890" />
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
