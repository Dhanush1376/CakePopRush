import React, { useState } from 'react'
import { ChevronLeft, User, Mail, Phone, Calendar, Save, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './MyDetailsPage.module.css'

export const MyDetailsPage = () => {
  const [form, setForm] = useState({
    firstName: 'Guest',
    lastName: '',
    email: 'cakepoprush@example.com',
    phone: '+91 98765 43210',
    dob: '2000-01-01',
    gender: 'prefer-not',
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className={styles.modalContent}>
      {/* Avatar */}
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          <User size={28} strokeWidth={1.5} />
        </div>
        <p className={styles.avatarHint}>Tap to change photo</p>
      </div>

      <hr className={styles.divider} />

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First Name</label>
            <input className={styles.input} name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Last Name</label>
            <input className={styles.input} name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}><Mail size={13} /> Email Address</label>
          <input className={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}><Phone size={13} /> Phone Number</label>
          <input className={styles.input} name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}><Calendar size={13} /> Date of Birth</label>
            <input className={styles.input} name="dob" type="date" value={form.dob} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Gender</label>
            <select className={styles.input} name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>
        </div>

        <button type="submit" className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`}>
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
