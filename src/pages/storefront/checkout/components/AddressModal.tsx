import React, { useState, useEffect } from 'react';
import { X, User, Home, LocateFixed, Truck } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './AddressModal.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface AddressData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  altPhone: string;
  pincode: string;
  houseNo: string;
  locality: string;
  street: string;
  landmark: string;
  isDefault?: boolean;
  destinationType?: 'home' | 'work' | 'other';
  deliveryInstructions?: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddressData) => void;
  initialData?: AddressData | null;
}

export const AddressModal = ({ isOpen, onClose, onSave, initialData }: AddressModalProps) => {
  const [formData, setFormData] = useState<AddressData>({
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    pincode: '',
    houseNo: '',
    locality: '',
    street: '',
    landmark: '',
    destinationType: 'home',
    deliveryInstructions: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          houseNo: initialData.houseNo || '',
          destinationType: initialData.destinationType || 'home',
          deliveryInstructions: initialData.deliveryInstructions || ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          altPhone: '',
          pincode: '',
          houseNo: '',
          locality: '',
          street: '',
          landmark: '',
          destinationType: 'home',
          deliveryInstructions: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3 className={styles.title}>{initialData ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.sectionHeader}>
            <User size={16} />
            <h4 className={styles.sectionTitle}>CONTACT DETAILS</h4>
          </div>

          <div className={styles.formGrid}>
            <Input label="RECEIVER FULL NAME*" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
            <Input label="EMAIL ADDRESS" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. john@example.com" />
            <Input label="CONTACT PHONE NUMBER*" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 9876543210" />
            <Input label="ALTERNATE PHONE NUMBER" name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Optional alternate number" />
          </div>

          <hr className={styles.divider} />

          <div className={styles.locationHeader}>
            <div className={styles.sectionHeader}>
              <Home size={16} />
              <h4 className={styles.sectionTitle}>ADDRESS DETAILS</h4>
            </div>
            <button className={styles.currentLocationBtn}>
              <LocateFixed size={12} />
              USE CURRENT LOCATION
            </button>
          </div>

          <div className={styles.mapPlaceholder}>
            <div className={styles.mapBadge}>
              <LocateFixed size={13} className={styles.badgeIcon} />
              <span>Tap or drag to pin exact delivery location</span>
            </div>
            <MapContainer center={[21.1458, 79.0882]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[21.1458, 79.0882]} />
            </MapContainer>
          </div>

          <div className={styles.formGrid}>
            <Input label="PINCODE*" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 560001" />
            <Input label="FLAT / HOUSE NO. / FLOOR*" name="houseNo" value={formData.houseNo} onChange={handleChange} placeholder="e.g. Flat 302, 3rd Floor" />
            
            <div className={styles.fullWidth}>
              <Input label="STREET / BUILDING NAME*" name="street" value={formData.street} onChange={handleChange} placeholder="e.g. MG Road, Brigade Residency" />
            </div>
            
            <Input label="LANDMARK*" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Near Metro Station" />
            <Input label="LOCALITY / SECTOR*" name="locality" value={formData.locality} onChange={handleChange} placeholder="e.g. Indiranagar" />
          </div>

          <hr className={styles.divider} />

          <div className={styles.sectionHeader}>
            <Truck size={14} />
            <h4 className={styles.sectionTitle}>DESTINATION & OPTIONS</h4>
          </div>

          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>DESTINATION TYPE</label>
              <div className={styles.radioGroup}>
                <label className={`${styles.radioPill} ${formData.destinationType === 'home' ? styles.activeRadio : ''}`}>
                  <input type="radio" name="destinationType" value="home" checked={formData.destinationType === 'home'} onChange={handleChange} />
                  Home
                </label>
                <label className={`${styles.radioPill} ${formData.destinationType === 'work' ? styles.activeRadio : ''}`}>
                  <input type="radio" name="destinationType" value="work" checked={formData.destinationType === 'work'} onChange={handleChange} />
                  Work
                </label>
                <label className={`${styles.radioPill} ${formData.destinationType === 'other' ? styles.activeRadio : ''}`}>
                  <input type="radio" name="destinationType" value="other" checked={formData.destinationType === 'other'} onChange={handleChange} />
                  Other
                </label>
              </div>
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>DELIVERY INSTRUCTIONS</label>
              <textarea name="deliveryInstructions" value={formData.deliveryInstructions} onChange={handleChange} className={styles.textarea} placeholder="E.g. Leave with security, call before delivery" />
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>CANCEL</button>
          <button className={styles.saveBtn} onClick={handleSubmit}>SAVE ADDRESS</button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
