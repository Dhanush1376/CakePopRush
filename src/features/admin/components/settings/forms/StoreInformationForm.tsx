import React from 'react';
import { Upload } from 'lucide-react';
import styles from '../AdminSettings.module.css';
import logoImg from "@/assets/brand/logo.png";

export const StoreInformationForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Store Information</h2>
      <p className={styles.cardSubtitle}>Update your store details and contact information.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Store Name</label>
      <input type="text" className={styles.input} defaultValue="CakePopRush" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Tagline</label>
      <input type="text" className={styles.input} defaultValue="Delicious Cake Pops, Made With Love!" />
    </div>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email Address</label>
        <input type="email" className={styles.input} defaultValue="support@cakepoprush.com" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Phone Number</label>
        <input type="tel" className={styles.input} defaultValue="+91 98765 43210" />
      </div>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Store Address</label>
      <textarea className={`${styles.input} ${styles.textarea}`} defaultValue="123, Cake Pop Street, Sweet City,&#10;Mumbai, Maharashtra - 400001, India"></textarea>
    </div>
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Country</label>
        <select className={styles.select} defaultValue="IN">
          <option value="IN">India</option>
          <option value="US">United States</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Currency</label>
        <select className={styles.select} defaultValue="INR">
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Timezone</label>
      <select className={styles.select} defaultValue="IST">
        <option value="IST">(GMT+05:30) Asia/Kolkata</option>
      </select>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Store Logo</label>
      <div className={styles.uploadSection}>
        <div className={styles.currentLogo}>
          <img src={logoImg} alt="CakePopRush Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
        <div className={styles.uploadArea}>
          <div className={styles.uploadTitle}>
            <Upload size={16} strokeWidth={2.5} />
            <span>Upload New Logo</span>
          </div>
          <span className={styles.uploadSubtitle}>PNG, JPG or SVG. Max size 2MB</span>
        </div>
      </div>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Changes</button>
      <button className={styles.btnSecondary}>Reset</button>
    </div>
  </div>
);
