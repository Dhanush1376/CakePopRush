import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Target, Home, Briefcase, Map, Loader2, CheckCircle2, AlertCircle, Check, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './AddressDrawer.module.css'
import { Address } from '../AddressesPage'
import { autoLocate, mapAddressToForm, getStateFromPincode, LocationStatus } from '@/services/locationService'
import { useAuth } from '@/context/AuthContext'
import { loadCachedProfile } from '@/utils/auth/authSessionCache'
import { authService } from '@/services/api/authService'

interface AddressDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: Omit<Address, 'id'>) => void
  initialAddress?: Partial<Address> | null
}

export const AddressDrawer = ({ isOpen, onClose, onSave, initialAddress }: AddressDrawerProps) => {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => {
    const u = user || loadCachedProfile()
    return {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home' as 'home' | 'work' | 'other',
      label: '',
      isDefault: false,
      name: u?.name || '',
      email: u?.email || '',
      phone: u?.phone || '',
      altPhone: '',
      landmark: '',
    }
  })

  // Location state
  const [locateStatus, setLocateStatus] = useState<LocationStatus>('idle')
  const [locateError, setLocateError] = useState('')
  const isLocating = useRef(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const u = user || loadCachedProfile()
      if (initialAddress) {
        let landmarkVal = (initialAddress as any).landmark || '';
        let line2Val = initialAddress.line2 || '';

        // If landmark is not saved separately but part of line2, extract it
        if (!landmarkVal && line2Val) {
          const parts = line2Val.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (parts.length > 1) {
            landmarkVal = parts[parts.length - 1];
            line2Val = parts.slice(0, -1).join(', ');
          }
        }

        const parsedType = (initialAddress.type as any) || 
          (initialAddress.label?.toLowerCase() === 'work' ? 'work' : initialAddress.label?.toLowerCase() === 'other' ? 'other' : 'home');
        const parsedLabel = initialAddress.label || (parsedType === 'work' ? 'Work' : parsedType === 'other' ? 'Other' : 'Home');

        setForm({
          line1: initialAddress.line1 || (initialAddress as any).street || '',
          line2: line2Val,
          city: initialAddress.city || '',
          state: initialAddress.state || '',
          pincode: initialAddress.pincode || '',
          type: parsedType,
          label: parsedLabel,
          isDefault: Boolean(initialAddress.isDefault),
          name: (initialAddress as any).name || u?.name || '',
          email: (initialAddress as any).email || u?.email || '',
          phone: (initialAddress as any).phone || u?.phone || '',
          altPhone: (initialAddress as any).altPhone || '',
          landmark: landmarkVal,
        })
      } else {
        setForm(prev => ({
          ...prev,
          name: prev.name || u?.name || '',
          email: prev.email || u?.email || '',
          phone: prev.phone || u?.phone || '',
        }))
      }

      // If user profile in memory/cache is missing email or phone, fetch from DB
      if (!u?.name || !u?.email || !u?.phone) {
        authService.getProfile().then(res => {
          if (res?.data) {
            const fresh = res.data
            setForm(prev => ({
              ...prev,
              name: prev.name || fresh.name || '',
              email: prev.email || fresh.email || '',
              phone: prev.phone || fresh.phone || '',
            }))
          }
        }).catch(() => {})
      }
    } else {
      document.body.style.overflow = ''
      // Reset location state when drawer closes
      setLocateStatus('idle')
      setLocateError('')
      isLocating.current = false
      setStep(1)
      const u = user || loadCachedProfile()
      setForm({
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home',
        label: '',
        isDefault: false,
        name: u?.name || '',
        email: u?.email || '',
        phone: u?.phone || '',
        altPhone: '',
        landmark: '',
      })
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, user, initialAddress])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (name === 'pincode') {
      const pin = value.replace(/\D/g, '').slice(0, 6)
      const inferredState = getStateFromPincode(pin)
      setForm(prev => ({
        ...prev,
        pincode: pin,
        state: inferredState || prev.state,
      }))
      return
    }
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTypeSelect = (type: 'home' | 'work' | 'other') => {
    setForm(prev => ({
      ...prev,
      type,
      label: type === 'home' ? 'Home' : type === 'work' ? 'Work' : (prev.label && prev.label !== 'Home' && prev.label !== 'Work' ? prev.label : '')
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!form.line1.trim() || !form.line2.trim() || !form.landmark.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
        return
      }
      setStep(2)
    } else {
      if (!form.name.trim() || !form.phone.trim()) {
        return
      }
      const resolvedLabel = form.type === 'other'
        ? (form.label.trim() || 'Other')
        : (form.type === 'work' ? 'Work' : 'Home')

      onSave({
        ...form,
        type: form.type,
        label: resolvedLabel,
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setStep(1)
    onClose()
  }

  const handleAutoLocate = async () => {
    // Prevent duplicate requests
    if (isLocating.current) return
    isLocating.current = true
    setLocateError('')

    try {
      const result = await autoLocate((status) => {
        setLocateStatus(status)
      })

      if (result.success && result.data) {
        // Map detected address to form fields
        const mapped = mapAddressToForm(result.data)

        setForm(prev => ({
          ...prev,
          // Only populate fields that have detected data, preserve existing non-empty user input
          line1: mapped.line1 || prev.line1,
          line2: mapped.line2 || prev.line2,
          landmark: mapped.landmark || prev.landmark,
          city: mapped.city || prev.city,
          state: mapped.state || prev.state,
          pincode: mapped.pincode || prev.pincode,
        }))

        // Auto-reset to idle after 2 seconds so the button goes back to normal
        setTimeout(() => {
          setLocateStatus('idle')
        }, 2000)
      } else {
        setLocateError(result.error || 'Unable to detect your location.')
        setTimeout(() => {
          setLocateStatus('idle')
          setLocateError('')
        }, 5000)
      }
    } catch (err) {
      setLocateStatus('error')
      setLocateError('An unexpected error occurred. Please enter your address manually.')
      setTimeout(() => {
        setLocateStatus('idle')
        setLocateError('')
      }, 5000)
    } finally {
      isLocating.current = false
    }
  }

  const getLocateBtnContent = () => {
    switch (locateStatus) {
      case 'locating':
        return (
          <>
            <Loader2 size={18} strokeWidth={2} className={styles.spinning} />
            Getting your location...
          </>
        )
      case 'geocoding':
        return (
          <>
            <Loader2 size={18} strokeWidth={2} className={styles.spinning} />
            Finding your exact address...
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle2 size={18} strokeWidth={2} />
            Address found!
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle size={18} strokeWidth={2} />
            {locateError ? 'Location failed' : 'Try again'}
          </>
        )
      default:
        return (
          <>
            <Target size={18} strokeWidth={2} />
            Auto Locate Me
          </>
        )
    }
  }

  const isLocateDisabled = locateStatus === 'locating' || locateStatus === 'geocoding'

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
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>
                {step === 1 ? (initialAddress ? 'Edit Address' : 'Add New Address') : 'Contact Details'}
              </h2>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.content}>
              {step === 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.locateBtn} ${
                      locateStatus === 'locating' || locateStatus === 'geocoding'
                        ? styles.locateBtnLoading
                        : locateStatus === 'success'
                          ? styles.locateBtnSuccess
                          : locateStatus === 'error'
                            ? styles.locateBtnError
                            : ''
                    }`}
                    onClick={handleAutoLocate}
                    disabled={isLocateDisabled}
                    aria-label="Auto locate my address"
                    aria-busy={isLocateDisabled}
                  >
                    {getLocateBtnContent()}
                  </button>

                  {locateError && (
                    <motion.p
                      className={styles.locateErrorMsg}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {locateError}
                    </motion.p>
                  )}
                </>
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
                        <label className={styles.label}>FLAT, HOUSE NO., BUILDING*</label>
                        <input
                          type="text"
                          name="line1"
                          className={styles.input}
                          value={form.line1}
                          onChange={handleChange}
                          placeholder="Flat, House no., Building name"
                          required
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>AREA, STREET, SECTOR*</label>
                        <input
                          type="text"
                          name="line2"
                          className={styles.input}
                          value={form.line2}
                          onChange={handleChange}
                          placeholder="Area, Street, Sector"
                          required
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>LANDMARK*</label>
                        <input
                          type="text"
                          name="landmark"
                          className={styles.input}
                          value={form.landmark}
                          onChange={handleChange}
                          placeholder="Nearby landmark (e.g. Near Park / Center)"
                          required
                        />
                      </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>CITY *</label>
                    <input
                      type="text"
                      name="city"
                      className={styles.input}
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>STATE *</label>
                    <input
                      type="text"
                      name="state"
                      className={styles.input}
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>PINCODE *</label>
                    <input
                      type="text"
                      name="pincode"
                      className={styles.input}
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="6-digit Pincode"
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
                      <span className={`${styles.customCheckbox} ${form.isDefault ? styles.customCheckboxChecked : ''}`}>
                        {form.isDefault && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span>Set as default address</span>
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
                          placeholder="Full Name"
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <div className={styles.labelRow}>
                          <label className={styles.label}>EMAIL ADDRESS</label>
                          <span className={styles.lockedBadge} title="Tied to your login account">
                            <Lock size={10} strokeWidth={2.5} />
                            Account Email
                          </span>
                        </div>
                        <input
                          type="email"
                          name="email"
                          className={`${styles.input} ${styles.inputReadOnly}`}
                          value={form.email}
                          readOnly
                          tabIndex={-1}
                          placeholder="email@example.com"
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
                          placeholder="10-digit mobile number"
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
                          placeholder="Alternate phone number (optional)"
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
                {step === 1 ? 'Next' : (initialAddress ? 'Update Address' : 'Save Address')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
