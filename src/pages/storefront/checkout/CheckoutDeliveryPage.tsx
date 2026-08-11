import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff, Plus, Edit2 } from 'lucide-react';
import styles from './CheckoutDeliveryPage.module.css';
import { Container } from '@/components/layout/Container';
import { CheckoutProgress } from '@/pages/storefront/cart/components/CheckoutProgress';
import { OrderSummary } from '@/pages/storefront/cart/components/OrderSummary';
import { MobileCheckoutBar } from '@/pages/storefront/cart/components/MobileCheckoutBar';
import { TrustBadges } from '@/pages/storefront/cart/components/TrustBadges';
import { useCart } from '@/lib/cartStore';
import { AddressModal, AddressData } from './components/AddressModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { CheckoutDeliverySkeleton } from './components/CheckoutDeliverySkeleton';

export const CheckoutDeliveryPage = () => {
  const { items, isLoading } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<AddressData[]>(() => {
    try {
      const saved = localStorage.getItem('cakepoprush_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cakepoprush_selectedAddressId') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cakepoprush_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (selectedAddressId) {
      localStorage.setItem('cakepoprush_selectedAddressId', selectedAddressId);
    } else {
      localStorage.removeItem('cakepoprush_selectedAddressId');
    }
  }, [selectedAddressId]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  if (items.length === 0) return null;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Container>
          <CheckoutDeliverySkeleton />
        </Container>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenEditModal = (address: AddressData) => {
    setEditingAddress(address);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveAddress = (data: AddressData) => {
    if (data.id) {
      setAddresses(prev => prev.map(a => a.id === data.id ? data : a));
    } else {
      const newAddress = { ...data, id: Date.now().toString(), isDefault: addresses.length === 0 };
      setAddresses(prev => [...prev, newAddress]);
      if (!selectedAddressId) setSelectedAddressId(newAddress.id);
    }
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddressId === id) setSelectedAddressId(null);
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
                  <h2 className={styles.savedTitle}>SAVED ADDRESSES</h2>
                  {/* Add New button moved to the card's pencil menu */}
                </div>

                <div className={styles.addressList}>
                  {addresses.map(addr => {
                    const isSelected = selectedAddressId === addr.id;
                    const isMenuOpen = activeMenuId === addr.id;
                    return (
                      <div 
                        key={addr.id} 
                        className={`${styles.addressCard} ${isSelected ? styles.selectedCard : ''}`}
                        onClick={() => setSelectedAddressId(addr.id || null)}
                      >
                        <div className={styles.cardHeader}>
                          <div className={styles.radioRow}>
                            <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ''}`}>
                              {isSelected && <div className={styles.radioInner} />}
                            </div>
                            <h3 className={styles.cardName}>{addr.name}</h3>
                            {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                            <span className={styles.homeBadge}>HOME</span>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <button className={styles.editIconBtn} onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : addr.id!); }}>
                              <Edit2 size={16} strokeWidth={2} />
                            </button>
                            {isMenuOpen && (
                              <div className={styles.actionMenu}>
                                <button className={styles.actionMenuItem} onClick={(e) => { e.stopPropagation(); handleOpenEditModal(addr); }}>Edit</button>
                                <button className={`${styles.actionMenuItem} ${styles.danger}`} onClick={(e) => { e.stopPropagation(); handleRemoveAddress(addr.id!); }}>Remove</button>
                                <button className={styles.actionMenuItem} onClick={(e) => { e.stopPropagation(); handleOpenAddModal(); }}>Add New</button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className={styles.addressDetails}>
                          <p>{addr.street}</p>
                          <p>{addr.landmark}</p>
                          <p>{addr.locality}, {addr.pincode}</p>
                        </div>

                        <div className={styles.mobileContact}>
                          <span className={styles.phoneIcon}>📞</span> Mobile: <strong>{addr.phone}</strong>
                        </div>
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

      {canProceed ? (
        <MobileCheckoutBar 
          buttonText="CONTINUE TO PAYMENT" 
          nextRoute="/payment" 
          showBack={true}
          onBack={() => navigate(-1)}
        />
      ) : (
        <div className={styles.disabledMobileBar}>
          <MobileCheckoutBar 
            buttonText="CONTINUE TO PAYMENT" 
            nextRoute="#" 
            showBack={true}
            onBack={() => navigate(-1)}
          />
        </div>
      )}

      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
    </div>
  );
};
