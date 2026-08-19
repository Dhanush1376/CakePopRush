import React from 'react';
import { Upload, User } from 'lucide-react';
import styles from '../AdminSettings.module.css';

export const AdminProfileForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>My Profile</h2>
      <p className={styles.cardSubtitle}>Manage your admin account details and avatar.</p>
    </div>
    <div className={styles.imageUpload}>
      <div className={styles.imagePreview}>
        <User size={32} color="var(--color-text-muted)" />
      </div>
      <div className={styles.uploadActions}>
        <button className={styles.uploadBtn}>
          <Upload size={16} />
          Upload Avatar
        </button>
        <span className={styles.uploadHint}>JPG, GIF or PNG. Max size 2MB.</span>
      </div>
    </div>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Full Name</label>
        <input type="text" className={styles.input} defaultValue="Admin User" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Role</label>
        <input type="text" className={styles.input} defaultValue="Super Admin" disabled />
      </div>
    </div>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email Address</label>
        <input type="email" className={styles.input} defaultValue="admin@cakepoprush.com" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Phone Number</label>
        <input type="tel" className={styles.input} defaultValue="+91 98765 43210" />
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
      <button className={styles.saveBtn}>Save Profile</button>
    </div>
  </div>
);
