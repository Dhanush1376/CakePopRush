import React from 'react';
import styles from '../AdminSettings.module.css';

export const GeneralSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>General Preferences</h2>
      <p className={styles.cardSubtitle}>Configure basic store preferences.</p>
    </div>
    <div className={styles.formRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Language</label>
        <select className={styles.select} defaultValue="en">
          <option value="en">English</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Date Format</label>
        <select className={styles.select} defaultValue="mdy">
          <option value="mdy">May 24, 2025</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Items Per Page</label>
        <select className={styles.select} defaultValue="10">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
    <div className={styles.toggleGrid}>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Enable Store</span>
        </div>
        <span className={styles.toggleDesc}>Your store is active and visible</span>
      </div>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Allow Product Reviews</span>
        </div>
        <span className={styles.toggleDesc}>Customers can review products</span>
      </div>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Enable Wishlist</span>
        </div>
        <span className={styles.toggleDesc}>Allow customers to add wishlist</span>
      </div>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Preferences</button>
    </div>
  </div>
);
