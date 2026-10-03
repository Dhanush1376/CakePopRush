import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff, Edit2, Pencil, Trash2, Phone, Plus } from 'lucide-react';
import styles from './CheckoutDeliveryPage.module.css';
import { Container } from '@/components/layout/Container';
import { CheckoutProgress, MobileCheckoutBar } from '@/features/cart';
import { useCart } from '@/features/cart';
import { useMascotOrchestrator } from '@/components/mascot/orchestration/useMascotOrchestrator';
import { Button } from '@/components/ui/Button';
import { CheckoutDeliverySkeleton } from './components/CheckoutDeliverySkeleton';
import { useAuth } from '@/context/AuthContext';
import { addressService, CustomerAddress } from '@/services/api/addressService';
import { AddressDrawer } from '@/pages/storefront/profile/components/AddressDrawer';
import { useToast } from '@/components/ui/ToastContext';

export const CheckoutDeliveryPage = () => {
  const { items, isLoading } = useCart();
  const navigate = useNavigate();
  const { triggerReaction } = useMascotOrchestrator();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    return localStorage.getItem('cakepoprush_selectedAddressId') || null;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);

  // Close popup menu on outside click
  useEffect(() => {
    if (!activeMenuId) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.actionMenu}`) && !target.closest(`.${styles.editIconBtn}`)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeMenuId]);

  const loadAddresses = async () => {
    try {
      setIsAddressesLoading(true);
      const res = await addressService.getAddresses();
      let list: CustomerAddress[] = [];
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        list = res.data;
      } else {
        // Fallback to localStorage addresses, purging mock address if any
        try {
          const cached = localStorage.getItem('cakepoprush_addresses');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              list = parsed.filter((a: any) => 
                a.id !== 'sample-address-1' && 
                a.id !== '1' && 
                !a.street?.includes('123 Baker')
              );
            }
          }
        } catch {
          // ignore
        }
      }

      setAddresses(list);
      localStorage.setItem('cakepoprush_addresses', JSON.stringify(list));

      // Resolve selected address
      const savedSelectedId = localStorage.getItem('cakepoprush_selectedAddressId');
      if (savedSelectedId && list.some(a => String(a._id || a.id) === savedSelectedId)) {
        setSelectedAddressId(savedSelectedId);
      } else if (list.length > 0) {
        const defaultAddr = list.find(a => a.isDefault) || list[0];
        const id = String(defaultAddr._id || defaultAddr.id);
        setSelectedAddressId(id);
        localStorage.setItem('cakepoprush_selectedAddressId', id);
      } else {
        setSelectedAddressId(null);
      }
    } catch (err) {
      console.error('Failed to load addresses in checkout:', err);
    } finally {
      setIsAddressesLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  if (items.length === 0) return null;

  if (isLoading || isAddressesLoading) {
    return (
      <div className={styles.page}>
        <CheckoutProgress currentStep="delivery" />
        <Container>
          <div className={styles.layout}>
            <div className={styles.mainContent}>
              <CheckoutDeliverySkeleton />
            </div>
          </div>
        </Container>
        <MobileCheckoutBar 
          buttonText="CONTINUE TO PAYMENT" 
          showBack={true}
          onBack={() => navigate(-1)}
          disabled={true}
        />
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setIsDrawerOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setIsDrawerOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveAddress = async (formData: any) => {
    try {
      const addressType: 'home' | 'work' | 'other' = formData.type || 'home';
      const addressLabel = addressType === 'other'
        ? (formData.label?.trim() || 'Other')
        : (addressType === 'work' ? 'Work' : 'Home');

      const payload = {
        label: addressLabel,
        type: addressType,
        street: formData.street || '',
        line1: formData.line1?.trim() || '',
        line2: formData.line2?.trim() || '',
        landmark: formData.landmark?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        pincode: formData.pincode?.trim() || '',
        isDefault: Boolean(formData.isDefault) || addresses.length === 0,
      };

      if (editingAddress) {
        const editId = String(editingAddress._id || editingAddress.id);
        // Optimistically update address in local state immediately so UI changes dynamically
        setAddresses(prev => prev.map(a => 
          String(a._id || a.id) === editId ? { ...a, ...payload } : a
        ));
        try {
          const res = await addressService.updateAddress(editId, payload);
          if (res.success && res.data) {
            showToast('Address updated successfully', 'success');
          }
        } catch {
          // Local fallback
        }
        await loadAddresses();
        setIsDrawerOpen(false);
        setEditingAddress(null);
        return;
      }

      const res = await addressService.createAddress(payload);
      if (res.success && res.data) {
        showToast('Address added successfully', 'success');
        await loadAddresses();
        const newId = String(res.data._id || res.data.id);
        setSelectedAddressId(newId);
        localStorage.setItem('cakepoprush_selectedAddressId', newId);
        setIsDrawerOpen(false);
      } else {
        const newAddr: CustomerAddress = {
          id: Date.now().toString(),
          ...payload,
        };
        const updated = [...addresses, newAddr];
        setAddresses(updated);
        localStorage.setItem('cakepoprush_addresses', JSON.stringify(updated));
        setSelectedAddressId(newAddr.id!);
        localStorage.setItem('cakepoprush_selectedAddressId', newAddr.id!);
        setIsDrawerOpen(false);
      }
    } catch (err: any) {
      console.error('Failed to save address:', err);
      showToast(err.message || 'Failed to save address', 'error');
    }
  };

  const handleRemoveAddress = async (id: string) => {
    try {
      await addressService.deleteAddress(id);
      showToast('Address removed', 'success');
    } catch {
      // Local removal fallback
    }
    const updated = addresses.filter(a => String(a._id || a.id) !== id);
    setAddresses(updated);
    localStorage.setItem('cakepoprush_addresses', JSON.stringify(updated));
    if (selectedAddressId === id) {
      const next = updated[0];
      const nextId = next ? String(next._id || next.id) : null;
      setSelectedAddressId(nextId);
      if (nextId) localStorage.setItem('cakepoprush_selectedAddressId', nextId);
      else localStorage.removeItem('cakepoprush_selectedAddressId');
    }
    setActiveMenuId(null);
  };

  const hasAddresses = addresses.length > 0;
  const canProceed = hasAddresses && selectedAddressId;

  return (
    <div className={styles.page}>
      <CheckoutProgress currentStep="delivery" />
      <Container>
        <div className={styles.layout}>
          <div className={styles.mainContent}>
            
            {!hasAddresses ? (
              /* EMPTY STATE */
              <div className={styles.emptyStateCard}>
                <div className={styles.emptyIconWrap}>
                  <MapPinOff size={20} strokeWidth={1.5} />
                </div>
                <h2 className={styles.emptyTitle}>No Delivery Address Found</h2>
                <p className={styles.emptyText}>Please add at least one delivery address to continue.</p>
                <Button size="sm" onClick={handleOpenAddModal}>
                  ADD ADDRESS
                </Button>
              </div>
            ) : (
              /* SAVED ADDRESSES */
              <div className={styles.savedAddressesSection}>
                <div className={styles.savedHeader}>
                  <h2 className={styles.savedTitle}>Saved Addresses</h2>
                </div>

                <div className={styles.addressList}>
                  {addresses.map(addr => {
                    const addrId = String(addr._id || addr.id);
                    const isSelected = selectedAddressId === addrId;
                    const isMenuOpen = activeMenuId === addrId;

                    return (
                      <div 
                        key={addrId} 
                        className={`${styles.addressCard} ${isSelected ? styles.selectedCard : ''}`}
                        onClick={() => {
                          setSelectedAddressId(addrId);
                          localStorage.setItem('cakepoprush_selectedAddressId', addrId);
                          if (!addr.isDefault) {
                            addressService.setDefaultAddress(addrId).catch((err) => console.error('Failed to set default address:', err));
                            setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: String(a._id || a.id) === addrId })));
                          }
                        }}
                      >
                        <div className={styles.cardHeader}>
                          <div className={styles.radioRow}>
                            <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ''}`}>
                              {isSelected && <div className={styles.radioInner} />}
                            </div>
                            <h3 className={styles.cardName}>
                              {user?.name || (addr as any).name || (addr.type === 'work' ? 'Work' : 'Home')}
                            </h3>
                            <span className={styles.homeBadge}>
                              {addr.type === 'work' || addr.label?.toLowerCase() === 'work'
                                ? 'WORK'
                                : addr.type === 'other'
                                  ? (addr.label || 'OTHER').toUpperCase()
                                  : 'HOME'}
                            </span>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <button 
                              type="button"
                              className={styles.editIconBtn} 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setActiveMenuId(isMenuOpen ? null : addrId); 
                              }}
                              aria-label="Address options"
                            >
                              <Edit2 size={16} strokeWidth={2} />
                            </button>
                            {isMenuOpen && (
                              <div className={styles.actionMenu}>
                                <button 
                                  type="button"
                                  className={styles.actionMenuItem} 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleOpenEditModal(addr); 
                                  }}
                                >
                                  <Pencil size={13} strokeWidth={2} className={styles.actionMenuIcon} />
                                  <span>Edit Address</span>
                                </button>
                                <button 
                                  type="button"
                                  className={styles.actionMenuItem} 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleOpenAddModal(); 
                                  }}
                                >
                                  <Plus size={14} strokeWidth={2.2} className={styles.actionMenuIcon} />
                                  <span>Add New Address</span>
                                </button>
                                <div className={styles.actionMenuDivider} />
                                <button 
                                  type="button"
                                  className={`${styles.actionMenuItem} ${styles.danger}`} 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleRemoveAddress(addrId); 
                                  }}
                                >
                                  <Trash2 size={13} strokeWidth={2} className={styles.actionMenuIcon} />
                                  <span>Remove</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className={styles.addressDetails}>
                          <p>{addr.line1 || (addr as any).street}</p>
                          {(() => {
                            const l2 = addr.line2 || '';
                            const lm = addr.landmark || (addr as any).landmark || '';
                            if (lm && !l2.includes(lm)) {
                              return <p>{[l2, lm].filter(Boolean).join(', ')}</p>;
                            }
                            return l2 ? <p>{l2}</p> : (lm ? <p>{lm}</p> : null);
                          })()}
                          <p>
                            {[addr.city, addr.state].filter(Boolean).join(', ')} - <strong>{addr.pincode}</strong>
                          </p>
                        </div>

                        {(user?.phone || (addr as any).phone) && (
                          <>
                            <div className={styles.cardDivider} />
                            <div className={styles.mobileContact}>
                              <Phone size={13} color="var(--color-brand-pink)" style={{ marginRight: '6px', flexShrink: 0 }} />
                              <span>Mobile: <strong>{user?.phone || (addr as any).phone}</strong></span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.mobileTrustWrap}>
               {/* Removed TrustBadges for delivery step */}
            </div>
          </div>
        </div>
      </Container>

      <MobileCheckoutBar 
        buttonText="CONTINUE TO PAYMENT" 
        nextRoute="/payment" 
        showBack={true}
        onBack={() => navigate(-1)}
        onNext={() => {
          triggerReaction('checkout:address-completed');
          navigate('/payment');
        }}
        disabled={!canProceed}
      />

      <AddressDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingAddress(null);
        }} 
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
      />
    </div>
  );
};
