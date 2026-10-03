import React from 'react';
import styles from '../AdminSettings.module.css';

export const APISettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>API Settings</h2>
      <p className={styles.cardSubtitle}>Manage API keys and webhooks for integrations.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Webhook URL</label>
      <input type="url" className={styles.input} placeholder="https://your-domain.com/webhook" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>API Key</label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <input type="text" className={styles.input} value="ck_live_xxxxxxxxxxxxxxxxxxxxxxxxxxx" readOnly style={{ opacity: 0.7 }} />
        <button className={styles.btnSecondary}>Regenerate</button>
      </div>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
