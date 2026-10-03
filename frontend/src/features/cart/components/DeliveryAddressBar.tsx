import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
  Check,
  Home,
  Briefcase,
  Plus,
  Settings2,
  ArrowRight,
  X,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DeliveryAddressBar.module.css';
import { addressService, CustomerAddress } from '@/services/api/addressService';
import { useAuth } from '@/context/AuthContext';
import { AddressDrawer } from '@/pages/storefront/profile/components/AddressDrawer';

export const DeliveryAddressBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load addresses on mount and when user changes
  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      // Attempt to load from API
      const res = await addressService.getAddresses();
      let list: CustomerAddress[] = [];
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        list = res.data;
      } else {
        // Fallback to localStorage addresses if guest or offline
        try {
          const cached = localStorage.getItem('cakepoprush_addresses');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed;
            }
          }
        } catch {
          // Silent catch
        }
      }

      setAddresses(list);

      // Determine selected address
      const savedSelectedId = localStorage.getItem('cakepoprush_selectedAddressId');
      if (savedSelectedId && list.some(a => String(a._id || a.id) === savedSelectedId)) {
        setSelectedAddressId(savedSelectedId);
      } else {
        const defaultAddr = list.find(a => a.isDefault) || list[0];
        if (defaultAddr) {
          const id = String(defaultAddr._id || defaultAddr.id);
          setSelectedAddressId(id);
          localStorage.setItem('cakepoprush_selectedAddressId', id);
        } else {
          setSelectedAddressId(null);
        }
      }
    } catch (err) {
      console.error('Failed to load addresses for delivery bar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Find currently active address
  const activeAddress = addresses.find(
    a => String(a._id || a.id) === selectedAddressId
  ) || addresses.find(a => a.isDefault) || addresses[0] || null;

  const handleSelectAddress = (addr: CustomerAddress) => {
    const id = String(addr._id || addr.id);
    setSelectedAddressId(id);
    localStorage.setItem('cakepoprush_selectedAddressId', id);
    setIsDropdownOpen(false);
  };

  const handleManageAddresses = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    navigate('/profile/addresses');
  };

  const handleOpenAddDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    setIsAddressDrawerOpen(true);
  };

  const handleAddressSaved = async () => {
    await loadAddresses();
    setIsAddressDrawerOpen(false);
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'work':
        return <Briefcase size={14} className={styles.typeIcon} />;
      case 'other':
        return <MapPin size={14} className={styles.typeIcon} />;
      default:
        return <Home size={14} className={styles.typeIcon} />;
    }
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {/* ─── TRIGGER BAR ─── */}
      <button
        type="button"
        className={`${styles.bar} ${isDropdownOpen ? styles.barActive : ''}`}
        onClick={() => setIsDropdownOpen(prev => !prev)}
        aria-expanded={isDropdownOpen}
        aria-label="Delivery location selector"
      >
        <div className={styles.innerContainer}>
          <div className={styles.leftGroup}>
            <div className={styles.iconCircle}>
              <MapPin size={18} strokeWidth={2.2} />
            </div>

            <div className={styles.infoCol}>
              {activeAddress ? (
                <>
                  <div className={styles.titleRow}>
                    <span className={styles.locationTitle}>
                      {activeAddress.city || activeAddress.line1 || 'Delivery Address'}
                      {activeAddress.pincode ? ` (${activeAddress.pincode})` : ''}
                    </span>
                  </div>
                  <span
                    className={styles.addressSnippet}
                    title={`${activeAddress.line1}, ${activeAddress.line2 || ''}, ${activeAddress.city} - ${activeAddress.pincode}`}
                  >
                    {[activeAddress.line1, activeAddress.line2, activeAddress.city].filter(Boolean).join(', ')}
                    {activeAddress.pincode ? ` - ${activeAddress.pincode}` : ''}
                  </span>
                </>
              ) : (
                <>
                  <div className={styles.titleRow}>
                    <span className={styles.locationTitle}>Add a delivery address</span>
                  </div>
                  <span className={styles.addressSnippet}>
                    Enter your location to see delivery availability
                  </span>
                </>
              )}
            </div>
          </div>

          <div className={styles.rightGroup}>
            <ChevronDown
              size={18}
              strokeWidth={2}
              className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`}
            />
          </div>
        </div>
      </button>

      {/* ─── DROPDOWN PANEL ─── */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownTitleWrap}>
                <MapPin size={14} className={styles.headerPin} />
                <h4 className={styles.dropdownTitle}>Select Delivery Address</h4>
              </div>
              <button
                type="button"
                className={styles.dropdownCloseBtn}
                onClick={() => setIsDropdownOpen(false)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* List of Saved Addresses */}
            <div className={styles.addressList}>
              {isLoading && addresses.length === 0 ? (
                <div className={styles.loadingBox}>
                  <Loader2 size={18} className={styles.spinner} />
                  <span>Loading addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className={styles.emptyBox}>
                  <div className={styles.emptyIconWrap}>
                    <MapPin size={22} strokeWidth={1.5} />
                  </div>
                  <p className={styles.emptyTitle}>No saved addresses</p>
                  <p className={styles.emptySub}>
                    Add your delivery address to see accurate delivery time.
                  </p>
                </div>
              ) : (
                addresses.map((addr) => {
                  const addrId = String(addr._id || addr.id);
                  const isSelected = addrId === selectedAddressId;

                  return (
                    <div
                      key={addrId}
                      className={`${styles.addressCard} ${isSelected ? styles.addressCardSelected : ''}`}
                      onClick={() => handleSelectAddress(addr)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${addr.label || addr.type} address`}
                    >
                      <div className={styles.radioIndicator}>
                        <div className={`${styles.radioOuter} ${isSelected ? styles.radioOuterActive : ''}`}>
                          {isSelected && <div className={styles.radioInner} />}
                        </div>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardTitleRow}>
                          <div className={styles.cardTypeBadge}>
                            {getTypeIcon(addr.type)}
                            <span>
                              {addr.type === 'work' || addr.label?.toLowerCase() === 'work'
                                ? 'WORK'
                                : addr.type === 'other'
                                  ? (addr.label && addr.label.toLowerCase() !== 'home' ? addr.label.toUpperCase() : 'OTHER')
                                  : 'HOME'}
                            </span>
                          </div>
                        </div>

                        <div className={styles.cardAddressText}>
                          <p className={styles.line1Text}>{addr.line1}</p>
                          {addr.line2 && <p className={styles.line2Text}>{addr.line2}</p>}
                          <p className={styles.cityStatePin}>
                            {[addr.city, addr.state].filter(Boolean).join(', ')} - <strong>{addr.pincode}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ─── BOTTOM ACTIONS FOOTER ─── */}
            <div className={styles.dropdownFooter}>
              <button
                type="button"
                className={styles.addNewBtn}
                onClick={handleOpenAddDrawer}
              >
                <Plus size={13} strokeWidth={2.2} />
                <span>Add New</span>
              </button>

              <button
                type="button"
                className={styles.manageAddressesBtn}
                onClick={handleManageAddresses}
              >
                <span>Manage Addresses</span>
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Drawer for adding address directly from cart */}
      <AddressDrawer
        isOpen={isAddressDrawerOpen}
        onClose={() => setIsAddressDrawerOpen(false)}
        onSave={handleAddressSaved}
      />
    </div>
  );
};
