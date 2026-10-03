import React, { useState, useEffect, useRef } from 'react';
import { X, User, Home, LocateFixed, Truck, Mail, Phone, Hash, Map, MapPin, MessageSquare, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './AddressModal.module.css';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '@/context/AuthContext';
import { autoLocate, getStateFromPincode, LocationStatus } from '@/services/locationService';

// Fix default marker icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to center leaflet map dynamically
const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (Array.isArray(coords) && typeof coords[0] === 'number' && !isNaN(coords[0]) && typeof coords[1] === 'number' && !isNaN(coords[1])) {
      map.setView(coords, 16);
    }
  }, [coords, map]);
  return null;
};

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
  city?: string;
  state?: string;
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
  const { user } = useAuth();
  const [formData, setFormData] = useState<AddressData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    altPhone: '',
    pincode: '',
    houseNo: '',
    locality: '',
    street: '',
    landmark: '',
    destinationType: 'home',
    deliveryInstructions: ''
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0760, 72.8777]);
  const [locateStatus, setLocateStatus] = useState<LocationStatus>('idle');
  const [locateError, setLocateError] = useState('');
  const [validationError, setValidationError] = useState('');
  const isLocating = useRef(false);

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
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
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
      setLocateStatus('idle');
      setLocateError('');
      setValidationError('');
      isLocating.current = false;
    }
  }, [isOpen, initialData, user]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const handleUseCurrentLocation = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLocating.current) return;
    isLocating.current = true;
    setLocateError('');

    try {
      const result = await autoLocate((status) => {
        setLocateStatus(status);
      });

      if (result.success && result.data) {
        const d = result.data;
        if (d.latitude && d.longitude) {
          setMapCenter([d.latitude, d.longitude]);
        }

        const streetLine = [d.building, d.street].filter(Boolean).join(', ') || d.street || '';
        const localityLine = d.locality || d.city || '';
        const detectedState = d.state || (d.pincode ? getStateFromPincode(d.pincode) : '');

        setFormData(prev => ({
          ...prev,
          pincode: d.pincode || prev.pincode,
          houseNo: d.housenumber || prev.houseNo,
          street: streetLine || prev.street,
          landmark: d.landmark || prev.landmark,
          locality: localityLine || prev.locality,
          city: d.city || prev.city || localityLine,
          state: detectedState || prev.state,
        }));

        setTimeout(() => {
          setLocateStatus('idle');
        }, 2500);
      } else {
        setLocateError(result.error || 'Unable to detect location. Please fill manually.');
        setTimeout(() => {
          setLocateStatus('idle');
          setLocateError('');
        }, 5000);
      }
    } catch {
      setLocateStatus('error');
      setLocateError('Failed to acquire location. Please fill manually.');
      setTimeout(() => {
        setLocateStatus('idle');
        setLocateError('');
      }, 5000);
    } finally {
      isLocating.current = false;
    }
  };

  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      setValidationError('Please enter receiver full name');
      return;
    }
    if (!formData.phone?.trim()) {
      setValidationError('Please enter contact phone number');
      return;
    }
    if (!formData.houseNo?.trim()) {
      setValidationError('Flat / House No. / Floor is required');
      return;
    }
    if (!formData.landmark?.trim()) {
      setValidationError('Landmark is required');
      return;
    }
    if (!formData.street?.trim()) {
      setValidationError('Street / Building name is required');
      return;
    }
    if (!formData.pincode?.trim()) {
      setValidationError('Pincode is required');
      return;
    }
    const resolvedState = formData.state || (formData.pincode ? getStateFromPincode(formData.pincode) : '');
    setValidationError('');
    onSave({
      ...formData,
      state: resolvedState,
      city: formData.city || formData.locality,
    });
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
            <div className={`${styles.inputGroup} ${styles.inputGroupReadOnly}`} title="Account email (unchangeable)">
              <Mail className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input
                type="email"
                name="email"
                className={`${styles.input} ${styles.inputReadOnly}`}
                value={formData.email}
                readOnly
                tabIndex={-1}
                placeholder="EMAIL ADDRESS"
              />
              <Lock className={styles.inputLockIcon} size={13} strokeWidth={2} />
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
            <button
              type="button"
              className={`${styles.currentLocationBtn} ${locateStatus !== 'idle' ? styles.currentLocationBtnActive : ''}`}
              onClick={handleUseCurrentLocation}
              disabled={locateStatus === 'locating' || locateStatus === 'geocoding'}
            >
              {locateStatus === 'locating' || locateStatus === 'geocoding' ? (
                <>
                  <Loader2 size={12} className={styles.spinning} />
                  <span>{locateStatus === 'locating' ? 'LOCATING...' : 'RESOLVING...'}</span>
                </>
              ) : locateStatus === 'success' ? (
                <>
                  <CheckCircle2 size={12} />
                  <span>LOCATION LOCKED!</span>
                </>
              ) : locateStatus === 'error' ? (
                <>
                  <AlertCircle size={12} />
                  <span>FAILED</span>
                </>
              ) : (
                <>
                  <LocateFixed size={12} />
                  <span>USE CURRENT LOCATION</span>
                </>
              )}
            </button>
          </div>

          {locateError && (
            <div className={styles.locateErrorNotice}>
              <AlertCircle size={13} />
              <span>{locateError}</span>
            </div>
          )}

          <div className={styles.mapPlaceholder}>
            <div className={styles.mapBadge}>
              <LocateFixed size={13} className={styles.badgeIcon} />
              <span>Tap or drag to pin exact delivery location</span>
            </div>
            {(() => {
              const safeCenter: [number, number] = (
                Array.isArray(mapCenter) &&
                typeof mapCenter[0] === 'number' && !isNaN(mapCenter[0]) &&
                typeof mapCenter[1] === 'number' && !isNaN(mapCenter[1])
              ) ? mapCenter : [19.0760, 72.8777];

              return (
                <MapContainer center={safeCenter} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <RecenterMap coords={safeCenter} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={safeCenter} />
                </MapContainer>
              );
            })()}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <Hash className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="pincode" className={styles.input} value={formData.pincode} onChange={handleChange} placeholder="PINCODE (E.G. 400050)*" />
            </div>
            <div className={styles.inputGroup}>
              <Home className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="houseNo" className={styles.input} value={formData.houseNo} onChange={handleChange} placeholder="FLAT / HOUSE NO. / FLOOR*" required />
            </div>
            
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <Map className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="street" className={styles.input} value={formData.street} onChange={handleChange} placeholder="STREET / BUILDING NAME (E.G. HILL ROAD)*" />
            </div>
            
            <div className={styles.inputGroup}>
              <MapPin className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="landmark" className={styles.input} value={formData.landmark} onChange={handleChange} placeholder="LANDMARK (E.G. NEAR LILAVATI HOSPITAL)*" required />
            </div>
            <div className={styles.inputGroup}>
              <MapPin className={styles.inputIcon} size={16} strokeWidth={1.5} />
              <input type="text" name="locality" className={styles.input} value={formData.locality} onChange={handleChange} placeholder="LOCALITY / SECTOR (E.G. BANDRA WEST)*" />
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

          {validationError && (
            <div className={styles.locateErrorNotice} style={{ marginTop: '16px', marginBottom: '0' }}>
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}

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
