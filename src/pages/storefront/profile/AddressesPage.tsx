import React, { useState } from 'react'
import { ChevronLeft, Plus, MapPin, Home, Briefcase, Trash2, Star, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './AddressesPage.module.css'
import { AddressDrawer } from './components/AddressDrawer'

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  label: string
  line1: string
  line2: string
  city: string
  pincode: string
  isDefault: boolean
}

const INITIAL: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Home',
    line1: '12, Lotus Street',
    line2: 'Koramangala',
    city: 'Bengaluru',
    pincode: '560034',
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    label: 'Work',
    line1: '45, Tech Park, Floor 3',
    line2: 'Whitefield',
    city: 'Bengaluru',
    pincode: '560066',
    isDefault: false,
  },
]

const TYPE_ICON = {
  home: <Home size={16} strokeWidth={1.8} />,
  work: <Briefcase size={16} strokeWidth={1.8} />,
  other: <MapPin size={16} strokeWidth={1.8} />,
}

export const AddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleSaveAddress = (newAddress: Omit<Address, 'id'>) => {
    const id = Date.now().toString()
    setAddresses(prev => {
      let updated = [...prev, { ...newAddress, id } as Address]
      if (newAddress.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: a.id === id }))
      }
      return updated
    })
  }

  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
  }

  const remove = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className={styles.modalContent}>
        {addresses.map(addr => (
          <div key={addr.id} className={`${styles.card} ${addr.isDefault ? styles.cardDefault : ''}`}>
            {addr.isDefault && (
              <div className={styles.defaultBadge}><Star size={10} fill="currentColor" /> Default</div>
            )}
            <div className={styles.cardTop}>
              <div className={`${styles.typeChip} ${styles[addr.type]}`}>
                {TYPE_ICON[addr.type]}
                {addr.label}
              </div>
              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={() => setDefault(addr.id)} title="Set as default">
                  <Star size={15} fill={addr.isDefault ? 'currentColor' : 'none'} />
                </button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => remove(addr.id)} title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className={styles.addrText}>{addr.line1}</p>
            <p className={styles.addrText}>{addr.line2}</p>
            <p className={styles.addrCity}>{addr.city} — {addr.pincode}</p>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className={styles.empty}>
            <MapPin size={40} strokeWidth={1} className={styles.emptyIcon} />
            <p>No addresses saved yet.</p>
          </div>
        )}

        <button className={styles.addBtn} onClick={() => setIsDrawerOpen(true)}>
          <Plus size={18} />
          Add New Address
        </button>

      <AddressDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSave={handleSaveAddress} 
      />
    </div>
  )
}
