import React from 'react';
import styles from '../AdminSettings.module.css';

export const NotificationSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Notification Settings</h2>
      <p className={styles.cardSubtitle}>Manage which alerts are sent to store admins.</p>
    </div>
    <div className={styles.toggleGrid}>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>New Orders</span>
        </div>
        <span className={styles.toggleDesc}>Alert when an order is placed</span>
      </div>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Low Stock Alerts</span>
        </div>
        <span className={styles.toggleDesc}>Alert when inventory is low</span>
      </div>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>New Customer Registration</span>
        </div>
        <span className={styles.toggleDesc}>Alert when a user signs up</span>
      </div>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>New Reviews</span>
        </div>
        <span className={styles.toggleDesc}>Alert for new product reviews</span>
      </div>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
