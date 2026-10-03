import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Home, Briefcase, Trash2, Star, Loader2, Pencil } from 'lucide-react'
import styles from './AddressesPage.module.css'
import { AddressDrawer } from './components/AddressDrawer'
import { addressService, CustomerAddress } from '@/services/api/addressService'
import { useToast } from '@/components/ui/ToastContext'
import { getStateFromPincode } from '@/services/locationService'

export type Address = CustomerAddress;

const TYPE_ICON = {
  home: <Home size={16} strokeWidth={1.8} />,
  work: <Briefcase size={16} strokeWidth={1.8} />,
  other: <MapPin size={16} strokeWidth={1.8} />,
}

export const AddressesPage = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const { showToast } = useToast()

  const loadAddresses = async () => {
    try {
      setIsLoading(true)
      const res = await addressService.getAddresses()
      if (res.success && Array.isArray(res.data)) {
        setAddresses(res.data)
      }
    } catch (err: any) {
      console.error('Failed to load addresses:', err)
      showToast(err.message || 'Failed to load addresses', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const handleSaveAddress = async (formData: any) => {
    if (!formData.line1?.trim()) {
      showToast('Flat, House No., Building is required', 'error')
      return
    }
    if (!formData.landmark?.trim()) {
      showToast('Landmark is required', 'error')
      return
    }
    if (!formData.city?.trim()) {
      showToast('City is required', 'error')
      return
    }
    const resolvedState = formData.state?.trim() || getStateFromPincode(formData.pincode?.trim() || '')
    if (!resolvedState) {
      showToast('State is required', 'error')
      return
    }
    if (!formData.pincode?.trim()) {
      showToast('Pincode is required', 'error')
      return
    }
    try {
      setIsProcessing(true)
      const payload = {
        label: (formData.type === 'work' ? 'Work' : formData.type === 'home' ? 'Home' : (formData.label?.trim() || 'Other')),
        type: formData.type || 'home',
        street: formData.street || '',
        line1: formData.line1?.trim() || '',
        line2: formData.line2?.trim() || '',
        landmark: formData.landmark?.trim() || '',
        city: formData.city?.trim() || '',
        state: resolvedState,
        pincode: formData.pincode?.trim() || '',
        isDefault: Boolean(formData.isDefault),
      }

      if (editingAddress) {
        const editId = String(editingAddress._id || editingAddress.id)
        const res = await addressService.updateAddress(editId, payload)
        if (res.success && res.data) {
          showToast('Address updated successfully!', 'success')
          setAddresses(prev => prev.map(a => String(a._id || a.id) === editId ? (res.data as CustomerAddress) : a))
          setIsDrawerOpen(false)
          setEditingAddress(null)
          return
        }
      } else {
        const res = await addressService.createAddress(payload)
        if (res.success && res.data) {
          showToast('Address added successfully!', 'success')
          await loadAddresses()
          setIsDrawerOpen(false)
          setEditingAddress(null)
          return
        }
      }
    } catch (err: any) {
      console.error('Failed to save address:', err)
      showToast(err.message || 'Failed to save address', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const setDefault = async (id: string) => {
    try {
      setIsProcessing(true)
      // Optimistic update
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: String(a._id || a.id) === id })))
      const res = await addressService.setDefaultAddress(id)
      if (res.success) {
        showToast('Default address updated', 'success')
      }
    } catch (err: any) {
      console.error('Failed to set default address:', err)
      showToast(err.message || 'Failed to set default address', 'error')
      await loadAddresses()
    } finally {
      setIsProcessing(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setIsProcessing(true)
      const res = await addressService.deleteAddress(id)
      if (res.success) {
        setAddresses(prev => prev.filter(a => String(a._id || a.id) !== id))
        showToast('Address removed', 'success')
      }
    } catch (err: any) {
      console.error('Failed to remove address:', err)
      showToast(err.message || 'Failed to delete address', 'error')
      await loadAddresses()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={styles.modalContent}>
      {isLoading ? (
        <div className={styles.empty}>
          <Loader2 size={32} className="animate-spin text-brand-pink" />
          <p>Loading your saved addresses...</p>
        </div>
      ) : (
        <>
          {addresses.map(addr => {
            const addrId = String(addr._id || addr.id)
            const isWork = addr.type === 'work' || addr.label?.toLowerCase() === 'work'
            const isOther = addr.type === 'other' || (!isWork && addr.type !== 'home' && addr.label && addr.label.toLowerCase() !== 'home')
            const typeKey: 'home' | 'work' | 'other' = isWork ? 'work' : isOther ? 'other' : 'home'
            const chipLabel = isWork
              ? 'WORK'
              : isOther
                ? (addr.label && addr.label.toLowerCase() !== 'home' && addr.label.toLowerCase() !== 'work' ? addr.label.toUpperCase() : 'OTHER')
                : 'HOME'

            return (
              <div 
                key={addrId} 
                className={`${styles.card} ${addr.isDefault ? styles.cardDefault : ''}`}
                onClick={() => {
                  if (!addr.isDefault && !isProcessing) {
                    setDefault(addrId)
                  }
                }}
                style={{ cursor: addr.isDefault ? 'default' : 'pointer' }}
              >
                {addr.isDefault && (
                  <div className={styles.defaultBadge}>
                    <Star size={10} fill="currentColor" /> Default
                  </div>
                )}
                <div className={styles.cardTop}>
                  <div className={`${styles.typeChip} ${styles[typeKey] || styles.home}`}>
                    {TYPE_ICON[typeKey] || TYPE_ICON.home}
                    {chipLabel}
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingAddress(addr)
                        setIsDrawerOpen(true)
                      }}
                      title="Edit address"
                      disabled={isProcessing}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        setDefault(addrId)
                      }}
                      title={addr.isDefault ? 'Default address' : 'Set as default'}
                      disabled={isProcessing || addr.isDefault}
                    >
                      <Star size={15} fill={addr.isDefault ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(addrId)
                      }}
                      title="Delete address"
                      disabled={isProcessing}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className={styles.addrText}>{addr.line1}</p>
                {(() => {
                  const l2 = addr.line2 || ''
                  const lm = addr.landmark || (addr as any).landmark || ''
                  if (lm && !l2.includes(lm)) {
                    return <p className={styles.addrText}>{[l2, lm].filter(Boolean).join(', ')}</p>
                  }
                  return l2 ? <p className={styles.addrText}>{l2}</p> : (lm ? <p className={styles.addrText}>{lm}</p> : null)
                })()}
                <p className={styles.addrCity}>
                  {addr.city} {addr.state ? `, ${addr.state}` : ''} — {addr.pincode}
                </p>
              </div>
            )
          })}

          {addresses.length === 0 && (
            <div className={styles.empty}>
              <MapPin size={40} strokeWidth={1} className={styles.emptyIcon} />
              <p>No addresses saved yet.</p>
            </div>
          )}

          <button 
            className={styles.addBtn} 
            onClick={() => {
              setEditingAddress(null)
              setIsDrawerOpen(true)
            }} 
            disabled={isProcessing}
          >
            <Plus size={18} />
            Add New Address
          </button>
        </>
      )}

      <AddressDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingAddress(null)
        }}
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
      />
    </div>
  )
}
export default AddressesPage;
