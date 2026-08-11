import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin, Target, Home, Briefcase, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './AddressDrawer.module.css'

interface AddressDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: any) => void
}

export const AddressDrawer = ({ isOpen, onClose, onSave }: AddressDrawerProps) => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    line1: '',
    line2: '',
    city: '',
    pincode: '',
    type: 'home',
    label: '',
    isDefault: false,
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    landmark: '',
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTypeSelect = (type: string) => {
    setForm(prev => ({ ...prev, type }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else {
      onSave(form)
      handleClose()
    }
  }

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  const handleAutoLocate = () => {
    // Dummy action for auto locate
    setForm(prev => ({
      ...prev,
      line1: '123 Fake Street',
      line2: 'Dummy Area',
      city: 'Bengaluru',
      pincode: '560001'
    }))
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className={styles.overlay} 
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div 
            className={styles.drawer}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{step === 1 ? 'Add New Address' : 'Contact Details'}</h2>
              <button className={styles.closeBtn} onClick={handleClose}>
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.content}>
              {step === 1 && (
                <button type="button" className={styles.locateBtn} onClick={handleAutoLocate}>
                  <Target size={18} strokeWidth={2} />
                  Auto Locate Me
                </button>
              )}

              <form id="address-form" onSubmit={handleSubmit} className={styles.form}>
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className={styles.stepContainer}
                    >
                      <div className={styles.field}>
                        <label className={styles.label}>FLAT, HOUSE NO., BUILDING</label>
                        <input
                          type="text"
                          name="line1"
                          className={styles.input}
                          value={form.line1}
                          onChange={handleChange}
                          placeholder="e.g. Flat 3B, Prestige Towers"
                          required
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>AREA, STREET, SECTOR</label>
                        <input
                          type="text"
                          name="line2"
                          className={styles.input}
                          value={form.line2}
                          onChange={handleChange}
                          placeholder="e.g. MG Road, Indiranagar"
                          required
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>LANDMARK (OPTIONAL)</label>
                        <input
                          type="text"
                          name="landmark"
                          className={styles.input}
                          value={form.landmark}
                          onChange={handleChange}
                          placeholder="e.g. Near Apollo Hospital"
                        />
                      </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>CITY</label>
                    <input
                      type="text"
                      name="city"
                      className={styles.input}
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Bengaluru"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>PINCODE</label>
                    <input
                      type="text"
                      name="pincode"
                      className={styles.input}
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="560001"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>SAVE AS</label>
                  <div className={styles.typeSelector}>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${form.type === 'home' ? styles.activeType : ''}`}
                      onClick={() => handleTypeSelect('home')}
                    >
                      <Home size={16} /> Home
                    </button>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${form.type === 'work' ? styles.activeType : ''}`}
                      onClick={() => handleTypeSelect('work')}
                    >
                      <Briefcase size={16} /> Work
                    </button>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${form.type === 'other' ? styles.activeType : ''}`}
                      onClick={() => handleTypeSelect('other')}
                    >
                      <Map size={16} /> Other
                    </button>
                  </div>
                </div>

                {form.type === 'other' && (
                  <div className={styles.field}>
                    <label className={styles.label}>LABEL</label>
                    <input
                      type="text"
                      name="label"
                      className={styles.input}
                      value={form.label}
                      onChange={handleChange}
                      placeholder="e.g. Gym, Mom's Place"
                      required={form.type === 'other'}
                    />
                  </div>
                )}

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={form.isDefault}
                        onChange={handleChange}
                        className={styles.checkbox}
                      />
                      Set as default address
                    </label>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className={styles.stepContainer}
                    >
                      <div className={styles.field}>
                        <label className={styles.label}>FULL NAME</label>
                        <input
                          type="text"
                          name="name"
                          className={styles.input}
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. Jane Doe"
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>EMAIL ADDRESS</label>
                        <input
                          type="email"
                          name="email"
                          className={styles.input}
                          value={form.email}
                          onChange={handleChange}
                          placeholder="e.g. jane@example.com"
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>PHONE NUMBER</label>
                        <input
                          type="tel"
                          name="phone"
                          className={styles.input}
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="e.g. +91 98765 43210"
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>ALTERNATE PHONE (OPTIONAL)</label>
                        <input
                          type="tel"
                          name="altPhone"
                          className={styles.input}
                          value={form.altPhone}
                          onChange={handleChange}
                          placeholder="e.g. +91 91234 56789"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            <div className={styles.footer}>
              {step === 2 && (
                <button type="button" className={styles.backStepBtn} onClick={() => setStep(1)}>
                  Back
                </button>
              )}
              <button form="address-form" type="submit" className={styles.saveBtn}>
                {step === 1 ? 'Next' : 'Save Address'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
