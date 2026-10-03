import React, { useState, useEffect } from 'react';
import { Upload, User as UserIcon } from 'lucide-react';
import styles from '../AdminSettings.module.css';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import { authService } from '@/services/api/authService';

export const AdminProfileForm = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile({ name });
      if (res?.success) {
        updateUser((prev) => (prev ? { ...prev, name } : null));
        showToast('Profile updated successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const roleDisplay =
    user?.role === 'super_admin' || user?.role === 'owner'
      ? 'Super Admin'
      : user?.role === 'admin' || user?.role === 'main_admin'
      ? 'Administrator'
      : user?.role === 'editor'
      ? 'Editor'
      : user?.role === 'viewer'
      ? 'Viewer'
      : 'Admin';

  return (
    <form className={styles.card} onSubmit={handleSave}>
      <div>
        <h2 className={styles.cardTitle}>My Profile</h2>
        <p className={styles.cardSubtitle}>Manage your admin account details and profile information.</p>
      </div>
      <div className={styles.imageUpload}>
        <div className={styles.imagePreview}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <UserIcon size={32} color="var(--color-text-muted)" />
          )}
        </div>
        <div className={styles.uploadActions}>
          <button type="button" className={styles.uploadBtn}>
            <Upload size={16} />
            Upload Avatar
          </button>
          <span className={styles.uploadHint}>JPG, GIF or PNG. Max size 2MB.</span>
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Role</label>
          <input type="text" className={styles.input} value={roleDisplay} disabled />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input type="email" className={styles.input} value={user?.email || ''} disabled title="Email is tied to your account credentials" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Phone Number</label>
          <input
            type="tel"
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};
