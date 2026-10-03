import React from 'react';
import styles from '../AdminSettings.module.css';

export const PaymentSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Payment Settings</h2>
      <p className={styles.cardSubtitle}>Manage payment gateways and methods.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Active Payment Gateway</label>
      <select className={styles.select} defaultValue="razorpay">
        <option value="razorpay">Razorpay (India)</option>
        <option value="stripe">Stripe (Global)</option>
        <option value="paypal">PayPal</option>
      </select>
    </div>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>API Key / Public Key</label>
        <input type="text" className={styles.input} defaultValue="" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>API Secret</label>
        <input type="password" className={styles.input} defaultValue="" />
      </div>
    </div>
    <div className={styles.toggleGrid}>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Cash on Delivery (COD)</span>
        </div>
        <span className={styles.toggleDesc}>Allow customers to pay on delivery</span>
      </div>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Test Mode</span>
        </div>
        <span className={styles.toggleDesc}>Use sandbox credentials</span>
      </div>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
