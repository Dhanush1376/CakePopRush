import React, { useState, useEffect } from 'react';
import { X, User, Home, LocateFixed, Truck, Mail, Phone, Hash, Map, MapPin, MessageSquare } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './AddressModal.module.css';
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
          <h3 className={styles.title}>{initialData ? 'Edit Address' : 'Add New Address'}</h3>
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
            <div className={styles.inputGroup}>
              <User className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="name" className={styles.input} value={formData.name} onChange={handleChange} placeholder="RECEIVER FULL NAME*" />
            </div>
            <div className={styles.inputGroup}>
              <Mail className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} placeholder="EMAIL ADDRESS" />
            </div>
            <div className={styles.inputGroup}>
              <Phone className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="tel" name="phone" className={styles.input} value={formData.phone} onChange={handleChange} placeholder="CONTACT PHONE NUMBER*" />
            </div>
            <div className={styles.inputGroup}>
              <Phone className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="tel" name="altPhone" className={styles.input} value={formData.altPhone} onChange={handleChange} placeholder="ALTERNATE PHONE NUMBER" />
            </div>
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
            <div className={styles.inputGroup}>
              <Hash className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="pincode" className={styles.input} value={formData.pincode} onChange={handleChange} placeholder="PINCODE*" />
            </div>
            <div className={styles.inputGroup}>
              <Home className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="houseNo" className={styles.input} value={formData.houseNo} onChange={handleChange} placeholder="FLAT / HOUSE NO. / FLOOR*" />
            </div>
            
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <Map className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="street" className={styles.input} value={formData.street} onChange={handleChange} placeholder="STREET / BUILDING NAME*" />
            </div>
            
            <div className={styles.inputGroup}>
              <MapPin className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="landmark" className={styles.input} value={formData.landmark} onChange={handleChange} placeholder="LANDMARK*" />
            </div>
            <div className={styles.inputGroup}>
              <MapPin className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="locality" className={styles.input} value={formData.locality} onChange={handleChange} placeholder="LOCALITY / SECTOR*" />
            </div>
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
              <div className={styles.textareaGroup}>
                <MessageSquare className={styles.textareaIcon} size={16} strokeWidth={1.5} />
                <textarea name="deliveryInstructions" value={formData.deliveryInstructions} onChange={handleChange} className={styles.textarea} placeholder="DELIVERY INSTRUCTIONS (E.g. Leave with security)" />
              </div>
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
