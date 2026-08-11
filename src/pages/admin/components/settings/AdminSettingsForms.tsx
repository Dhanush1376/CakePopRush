import React from 'react';
import { Upload, User } from 'lucide-react';
import logoImg from '../../../../assets/brand/logo.png';
import styles from '../../pages/AdminSettings.module.css';

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

export const ShippingSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Shipping Settings</h2>
      <p className={styles.cardSubtitle}>Configure shipping zones and rates.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Default Shipping Rate (₹)</label>
      <input type="number" className={styles.input} defaultValue="50" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Free Shipping Threshold (₹)</label>
      <input type="number" className={styles.input} defaultValue="500" />
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Set to 0 to disable free shipping.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Shipping Partner Integration</label>
      <select className={styles.select} defaultValue="delhivery">
        <option value="none">Manual Shipping</option>
        <option value="delhivery">Delhivery API</option>
        <option value="shiprocket">Shiprocket</option>
      </select>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);

export const TaxSettingsForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Tax Settings</h2>
      <p className={styles.cardSubtitle}>Manage tax calculation and GST details.</p>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Tax Calculation Strategy</label>
      <select className={styles.select} defaultValue="inclusive">
        <option value="inclusive">Prices include tax (Inclusive)</option>
        <option value="exclusive">Add tax at checkout (Exclusive)</option>
      </select>
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Default Tax Rate (%)</label>
      <input type="number" className={styles.input} defaultValue="18" />
    </div>
    <div className={styles.formGroup}>
      <label className={styles.label}>Store GSTIN</label>
      <input type="text" className={styles.input} defaultValue="27AAAAA0000A1Z5" />
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);

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

export const MaintenanceModeForm = () => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.cardTitle}>Maintenance Mode</h2>
      <p className={styles.cardSubtitle}>Temporarily take your store offline.</p>
    </div>
    <div className={styles.toggleGrid}>
      <div className={styles.toggleItem}>
        <div className={styles.toggleRow}>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Enable Maintenance Mode</span>
        </div>
        <span className={styles.toggleDesc}>Storefront will be hidden from public</span>
      </div>
    </div>
    <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
      <label className={styles.label}>Custom Offline Message</label>
      <textarea className={`${styles.input} ${styles.textarea}`} defaultValue="We are currently performing scheduled maintenance. We'll be back shortly!"></textarea>
    </div>
    <div className={styles.formActions}>
      <button className={styles.btnPrimary}>Save Settings</button>
    </div>
  </div>
);
