import React, { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, Save } from 'lucide-react'
import styles from './MyDetailsPage.module.css'
import { useAuth } from '@/context/AuthContext'
import { authService, UserProfile } from '@/services/api/authService'
import { useToast } from '@/components/ui/ToastContext'

export const MyDetailsPage = () => {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null)
  const [avatarError, setAvatarError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name && user.name.includes(' ') ? user.name.split(' ').slice(1).join(' ') : '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name && user.name.includes(' ') ? user.name.split(' ').slice(1).join(' ') : '',
        email: user.email || '',
        phone: user.phone || '',
      })
      if (user.avatar) {
        setAvatarUrl(user.avatar)
        setAvatarError(false)
      }
    }
  }, [user])

  // Fetch freshest profile from database on mount
  useEffect(() => {
    let isMounted = true
    authService
      .getProfile()
      .then((res) => {
        if (!isMounted || !res?.data) return
        const u = res.data
        updateUser(u)
        setForm({
          firstName: u.name ? u.name.split(' ')[0] : '',
          lastName: u.name && u.name.includes(' ') ? u.name.split(' ').slice(1).join(' ') : '',
          email: u.email || '',
          phone: u.phone || '',
        })
        if (u.avatar) {
          setAvatarUrl(u.avatar)
          setAvatarError(false)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [updateUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        showToast('Please select a photo smaller than 5MB', 'error')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setAvatarUrl(base64)
        setAvatarError(false)
        setSaved(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
    try {
      const payload: Partial<UserProfile> = {
        name: fullName || user?.name || '',
        email: form.email.trim(),
        phone: form.phone.trim(),
        avatar: avatarUrl || '',
      }

      const res = await authService.updateProfile(payload)
      const updatedUser = res?.data || (res as any)

      // Update in-memory AuthContext and session cache
      updateUser(prev =>
        prev
          ? {
              ...prev,
              ...updatedUser,
              name: fullName || prev.name,
              email: form.email.trim() || prev.email,
              phone: form.phone.trim(),
              avatar: avatarUrl || prev.avatar,
            }
          : null
      )

      setSaved(true)
      showToast('Profile details saved to database!', 'success')
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save changes. Please try again.'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalContent}>
      {/* Avatar */}
      <div className={styles.avatarSection} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
        <div className={styles.avatar} style={{ overflow: 'hidden' }}>
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <User size={28} strokeWidth={1.5} />
          )}
        </div>
        <p className={styles.avatarHint}>Tap to change photo</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleAvatarChange} 
        />
      </div>

      <hr className={styles.divider} />

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First Name</label>
            <div className={styles.inputGroup}>
              <User className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input className={styles.input} name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Last Name</label>
            <div className={styles.inputGroup}>
              <User className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input className={styles.input} name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email Address</label>
          <div className={styles.inputGroup}>
            <Mail className={styles.inputIcon} size={16} strokeWidth={1.5} />
            <input className={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phone Number</label>
          <div className={styles.inputGroup}>
            <Phone className={styles.inputIcon} size={16} strokeWidth={1.5} />
            <input className={styles.input} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone" />
          </div>
        </div>

        <button type="submit" className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`} disabled={saving}>
          <Save size={16} />
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
