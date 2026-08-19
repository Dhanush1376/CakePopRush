import React from 'react';
import styles from '../AdminSettings.module.css';

export const BackupRestoreForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Backup & Restore</h2>
      <p className={styles.cardSubtitle}>Manage your database backups.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Auto-Backup Schedule</label>
      <select className={styles.select} defaultValue="daily">
        <option value="never">Never</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
    </div>
    <div className={styles.formActions} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '1rem', flexDirection: 'column', gap: '1rem' }}>
      <button className={styles.btnPrimary} style={{ width: 'fit-content' }}>Generate Manual Backup Now</button>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className={styles.btnSecondary}>Download Latest Backup</button>
        <button className={styles.btnSecondary} style={{ color: 'var(--color-error)' }}>Restore from file...</button>
      </div>
    </div>
  </div>
);
