import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, Trash2, CheckCircle, 
  ChevronDown, X, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminNewOrder.module.css';

// Reusable UI components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/commerce/ProductCard';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { AdminNewOrderSkeleton } from '../components/AdminNewOrderSkeleton';

// --- Mock Data ---
const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Ananya Sharma', phone: '9876543210', email: 'ananya@example.com', orderCount: 4 },
  { id: 'c2', name: 'Rahul Gupta', phone: '9123456789', email: 'rahul.g@example.com', orderCount: 1 },
];

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Strawberry Bliss Pops', sku: 'CPR-001', price: 499, image: '/images/Products/mini valentine cake.jpeg', isCustomizable: true, stock: 48 },
  { id: 'p2', name: 'Chocolate Crunch Pops', sku: 'CPR-002', price: 499, image: '/images/Products/Dark choclate cakepops.jpeg', isCustomizable: false, stock: 36 },
  { id: 'p3', name: 'Cute Chick Pops', sku: 'CPR-003', price: 449, image: '/images/Products/vanilla mango cupcakes.jpeg', isCustomizable: false, stock: 8 },
];

// --- Types ---
type FulfillmentType = 'delivery' | 'pickup';
type OrderSource = 'Phone' | 'WhatsApp' | 'Instagram' | 'Walk-in' | 'Staff Entry' | 'Other';
type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Online Payment' | 'Other';
type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending' | 'Failed';

interface OrderItem {
  id: string; // unique local id
  productId?: string;
  isCustom: boolean;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  customization?: {
    message?: string;
    flavor?: string;
    size?: string;
  };
  notes?: string;
}

const TAX_RATE = 0.10;

// --- Wizard Configuration ---
const WIZARD_STEPS = [
  { id: 1, name: 'Customer' },
  { id: 2, name: 'Items' },
  { id: 3, name: 'Delivery' },
  { id: 4, name: 'Payment' },
  { id: 5, name: 'Review' }
];

export function AdminNewOrder() {
  const navigate = useNavigate();

  // --- Wizard State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [highestCompletedStep, setHighestCompletedStep] = useState(0);
  const [mobileView, setMobileView] = useState<'form'|'summary'>('form');

  // --- Form State ---
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Step 1: Customer
  const [customerType, setCustomerType] = useState<'new' | 'existing'>('new');
  const [customerSearch, setCustomerSearch] = useState('');
  // Add simulated loading state for skeleton demonstration
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [duplicateCustomerFound, setDuplicateCustomerFound] = useState<any>(null);
  const [orderSource, setOrderSource] = useState<OrderSource>('Staff Entry');

  // Step 2: Items
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1');
  const [customItemDesc, setCustomItemDesc] = useState('');

  // Step 3: Delivery
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Main Store');
  const [deliveryFeeType, setDeliveryFeeType] = useState<'Free' | 'Standard' | 'Custom'>('Standard');
  const [customDeliveryFee, setCustomDeliveryFee] = useState('');

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [amountPaid, setAmountPaid] = useState('');
  
  // Step 4: Notes (Progressive Disclosure)
  const [showNotes, setShowNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Step Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Track Unsaved Changes ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !successOrder) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, successOrder]);

  const markChanged = () => {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  // --- Derived State & Calculations ---
  
  const productSearchResults = useMemo(() => {
    if (!productSearch) return MOCK_PRODUCTS.slice(0, 3);
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  const pricing = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discount = 0; // Keeping discount simple for now to reduce wizard complexity
    const subtotalAfterDiscount = subtotal - discount;
    const tax = subtotalAfterDiscount * TAX_RATE;

    let deliveryFee = 0;
    if (fulfillmentType === 'delivery') {
      if (deliveryFeeType === 'Standard') deliveryFee = 50;
      else if (deliveryFeeType === 'Custom') deliveryFee = parseFloat(customDeliveryFee) || 0;
    }

    const total = subtotalAfterDiscount + tax + deliveryFee;
    
    let paid = 0;
    if (paymentStatus === 'Paid') paid = total;
    else if (paymentStatus === 'Partially Paid') paid = parseFloat(amountPaid) || 0;
    
    paid = Math.min(paid, total);
    const remaining = total - paid;

    return { subtotal, discount, tax, deliveryFee, total, paid, remaining };
  }, [items, deliveryFeeType, customDeliveryFee, fulfillmentType, paymentStatus, amountPaid]);

  // --- Validation ---
  
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!customerName.trim()) newErrors.customerName = 'Please enter the customer name.';
      if (!customerPhone.trim()) newErrors.customerPhone = "Please enter the customer's phone number.";
    } 
    else if (step === 2) {
      if (items.length === 0) newErrors.items = 'Please add at least one item.';
    }
    else if (step === 3) {
      if (fulfillmentType === 'delivery') {
        if (!address.trim()) newErrors.address = 'Delivery address is required.';
        if (!deliveryDate) newErrors.deliveryDate = 'Delivery date is required.';
      } else {
        if (!pickupDate) newErrors.pickupDate = 'Pickup date is required.';
      }
    }
    else if (step === 4) {
      if (paymentStatus === 'Partially Paid') {
        const paid = parseFloat(amountPaid);
        if (isNaN(paid) || paid <= 0) {
          newErrors.amountPaid = 'Enter a valid amount paid.';
        } else if (paid > pricing.total) {
          newErrors.amountPaid = 'Amount paid cannot exceed total.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setHighestCompletedStep(Math.max(highestCompletedStep, currentStep));
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const jumpToStep = (step: number) => {
    // Can only jump to a step if previous steps are completed
    if (step <= highestCompletedStep + 1) {
      setCurrentStep(step);
    }
  };

  // --- Handlers ---

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    markChanged();
    const val = e.target.value;
    setCustomerPhone(val);
    if (val.length >= 10) {
      const existing = MOCK_CUSTOMERS.find(c => c.phone === val);
      setDuplicateCustomerFound(existing || null);
    } else {
      setDuplicateCustomerFound(null);
    }
  };

  const selectExistingCustomer = (customer: typeof MOCK_CUSTOMERS[0]) => {
    setCustomerType('existing');
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email);
    setDuplicateCustomerFound(null);
    setCustomerSearch('');
  };

  const handleAddProduct = (product: typeof MOCK_PRODUCTS[0]) => {
    markChanged();
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: `local-${Date.now()}`,
        productId: product.id,
        isCustom: false,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.price,
        image: product.image
      }];
    });
    setProductSearch('');
    setIsSearchingProduct(false);
  };

  const handleAddCustomItem = () => {
    markChanged();
    const price = parseFloat(customItemPrice);
    if (!customItemName || isNaN(price)) return; 
    setItems(prev => [...prev, {
      id: `custom-${Date.now()}`,
      isCustom: true,
      name: customItemName,
      quantity: parseInt(customItemQty) || 1,
      unitPrice: price,
      notes: customItemDesc
    }]);
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty('1');
    setCustomItemDesc('');
    setShowCustomItemForm(false);
  };

  const updateItemQuantity = (id: string, delta: number) => {
    markChanged();
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    markChanged();
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCreateOrderClick = () => {
    if (validateStep(5)) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setSuccessOrder({
        id: '#CPR-' + Math.floor(10000 + Math.random() * 90000),
        customerName,
        total: pricing.total,
        paymentStatus,
        delivery: fulfillmentType === 'delivery' ? `${deliveryDate} · ${deliveryTime}` : `Pickup on ${pickupDate} · ${pickupTime}`
      });
      setHasUnsavedChanges(false);
    }, 1500);
  };

  // --- Render Steps ---

  const renderStep1Customer = () => (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>Customer Details</h2>
        <p className={styles.sectionSubtitle}>Who is this order for?</p>
      </div>
      
      <div className={styles.formGroup}>
        <div className={styles.pillGroup} style={{display: 'flex'}}>
          <button 
            className={`${styles.pill} ${styles.pillLarge} ${customerType === 'existing' ? styles.active : ''}`}
            onClick={() => setCustomerType('existing')}
          >
            Existing Customer
          </button>
          <button 
            className={`${styles.pill} ${styles.pillLarge} ${customerType === 'new' ? styles.active : ''}`}
            onClick={() => { setCustomerType('new'); setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); }}
          >
            New Customer
          </button>
        </div>
      </div>

      {customerType === 'existing' && (
        <div className={styles.formGroup}>
          <div className={styles.searchWrapper}>
            <Input 
              type="text" 
              placeholder="Search customer by name, phone or email..." 
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              fullWidth
            />
          </div>
          {customerSearch && (
            <div className={styles.searchResults}>
              {MOCK_CUSTOMERS.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).map(c => (
                <div key={c.id} className={styles.searchResultItem} onClick={() => selectExistingCustomer(c)}>
                  <div className={styles.resultDetails}>
                    <span className={styles.resultName}>{c.name}</span>
                    <span className={styles.resultMeta}>{c.phone} · {c.email}</span>
                  </div>
                  <span className={styles.resultMeta} style={{fontWeight: 600, color: 'var(--admin-pink)'}}>{c.orderCount} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(customerType === 'new' || customerName) && (
        <>
          <div className={styles.row}>
            <Input label="Full Name *" placeholder="Enter name" value={customerName} onChange={(e) => { markChanged(); setCustomerName(e.target.value); }} error={errors.customerName} fullWidth />
            <Input label="Phone Number *" placeholder="Enter phone" value={customerPhone} onChange={handlePhoneChange} error={errors.customerPhone} fullWidth />
          </div>
          
          {duplicateCustomerFound && customerType === 'new' && (
            <div style={{background: '#E0F2FE', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: '13px', fontWeight: 600, color: '#0369A1'}}>Existing customer found</div>
                <div style={{fontSize: '13px', color: '#0284C7', marginTop: '4px'}}>{duplicateCustomerFound.name} · {duplicateCustomerFound.email}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => selectExistingCustomer(duplicateCustomerFound)}>Use This Customer</Button>
            </div>
          )}

          <Input label="Email Address (Optional)" type="email" placeholder="Enter email" value={customerEmail} onChange={(e) => { markChanged(); setCustomerEmail(e.target.value); }} fullWidth />
        </>
      )}

      <div className={styles.divider} />
      
      <div className={styles.formGroup}>
        <label className={styles.label}>How did this order come in?</label>
        <div className={styles.pillGroup}>
          {['Phone', 'WhatsApp', 'Instagram', 'Walk-in', 'Staff Entry', 'Other'].map(src => (
            <button key={src} className={`${styles.pill} ${orderSource === src ? styles.active : ''}`} onClick={() => { markChanged(); setOrderSource(src as OrderSource); }}>
              {src}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2Items = () => (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>What did they order?</h2>
        <p className={styles.sectionSubtitle}>Add the products and custom items requested by the customer.</p>
      </div>

      <div className={styles.formGroup} style={{position: 'relative'}}>
        <div className={styles.searchWrapper}>
          <Input 
            type="text" 
            placeholder="Search products by name, SKU or category..." 
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setIsSearchingProduct(true); }}
            onFocus={() => setIsSearchingProduct(true)}
            leftIcon={<Search size={16} />}
            fullWidth
          />
        </div>
        
        {isSearchingProduct && (
          <div className={styles.searchResults}>
            {productSearchResults.length > 0 ? (
              productSearchResults.map(p => (
                <div key={p.id} className={styles.searchResultItem}>
                  <div className={styles.resultInfo}>
                    <img src={p.image} alt={p.name} className={styles.resultImage} />
                    <div className={styles.resultDetails}>
                      <span className={styles.resultName}>{p.name}</span>
                      <span className={styles.resultMeta}>SKU: {p.sku} · ₹{p.price}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleAddProduct(p)}>+ Add</Button>
                </div>
              ))
            ) : (
              <div style={{padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)'}}>No products found.</div>
            )}
          </div>
        )}
      </div>

      {errors.items && <span style={{color: 'var(--color-error)', fontSize: '13px'}}>{errors.items}</span>}

      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
        {items.map(item => (
          <div key={item.id} className={styles.orderItemRow}>
            <div className={styles.itemMain}>
              <div className={styles.itemLeft}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                ) : (
                  <div className={styles.itemImage} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--color-text-muted)'}}>Img</div>
                )}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}{item.isCustom && <span className={styles.customBadge}>CUSTOM</span>}</span>
                  {item.sku ? <span className={styles.itemSku}>SKU: {item.sku}</span> : <span className={styles.itemSku}>₹{item.unitPrice} each</span>}
                </div>
              </div>
              
              <div className={styles.itemRight}>
                <div className={styles.quantityControl}>
                  <button className={styles.qtyBtn} onClick={() => updateItemQuantity(item.id, -1)}>−</button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => updateItemQuantity(item.id, 1)}>+</button>
                </div>
                <span className={styles.itemTotal}>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            </div>
            
            <div className={styles.itemActions}>
              <Button variant="ghost" size="sm" style={{color: 'var(--admin-pink)', padding: 0}}>Customize</Button>
              <Button variant="ghost" size="sm" style={{color: 'var(--color-text-muted)', padding: 0}} onClick={() => removeItem(item.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>


      {items.length > 0 && (
        <div className={styles.stepSummary}>
          <span className={styles.stepSummaryText}>{items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          <span className={styles.stepSummaryTotal}>₹{pricing.subtotal.toFixed(2)}</span>
        </div>
      )}
    </div>
  );

  const renderStep3Delivery = () => (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>How will they receive it?</h2>
        <p className={styles.sectionSubtitle}>Choose delivery or pickup and provide the required details.</p>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.pillGroup} style={{display: 'flex'}}>
          <button className={`${styles.pill} ${styles.pillLarge} ${fulfillmentType === 'delivery' ? styles.active : ''}`} onClick={() => { markChanged(); setFulfillmentType('delivery'); }}>Delivery</button>
          <button className={`${styles.pill} ${styles.pillLarge} ${fulfillmentType === 'pickup' ? styles.active : ''}`} onClick={() => { markChanged(); setFulfillmentType('pickup'); }}>Pickup</button>
        </div>
      </div>

      <div className={styles.divider} />

      {fulfillmentType === 'delivery' ? (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Delivery Address *</label>
            <textarea className={styles.textarea} style={{borderColor: errors.address ? 'var(--color-error)' : undefined}} placeholder="Enter full delivery address" value={address} onChange={(e) => { markChanged(); setAddress(e.target.value); }} />
            {errors.address && <span style={{color: 'var(--color-error)', fontSize: '12px'}}>{errors.address}</span>}
          </div>
          <div className={styles.row}>
            <Input label="Landmark (Optional)" value={landmark} onChange={(e) => { markChanged(); setLandmark(e.target.value); }} fullWidth />
            <Input label="City" value={city} onChange={(e) => { markChanged(); setCity(e.target.value); }} fullWidth />
          </div>
          <div className={styles.row}>
            <Input label="State" value={state} onChange={(e) => { markChanged(); setState(e.target.value); }} fullWidth />
            <Input label="PIN Code" value={pinCode} onChange={(e) => { markChanged(); setPinCode(e.target.value); }} fullWidth />
          </div>
          <div className={styles.row}>
            <Input label="Delivery Date *" type="date" value={deliveryDate} onChange={(e) => { markChanged(); setDeliveryDate(e.target.value); }} error={errors.deliveryDate} fullWidth />
            <div className={styles.formGroup}>
              <label className={styles.label}>Delivery Time</label>
              <select className={styles.select} value={deliveryTime} onChange={(e) => { markChanged(); setDeliveryTime(e.target.value); }}>
                <option value="">Select time slot</option>
                <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                <option value="12:00 PM – 2:00 PM">12:00 PM – 2:00 PM</option>
                <option value="4:00 PM – 6:00 PM">4:00 PM – 6:00 PM</option>
              </select>
            </div>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Delivery Fee</label>
            <div className={styles.pillGroup}>
              {['Free', 'Standard', 'Custom'].map(fee => (
                <button key={fee} className={`${styles.pill} ${deliveryFeeType === fee ? styles.active : ''}`} onClick={() => { markChanged(); setDeliveryFeeType(fee as any); }}>{fee}</button>
              ))}
            </div>
            {deliveryFeeType === 'Custom' && (
              <div style={{marginTop: 'var(--space-2)'}}>
                <Input type="number" placeholder="Enter custom fee" value={customDeliveryFee} onChange={e => { markChanged(); setCustomDeliveryFee(e.target.value); }} />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={styles.row}>
            <Input label="Pickup Date *" type="date" value={pickupDate} onChange={(e) => { markChanged(); setPickupDate(e.target.value); }} error={errors.pickupDate} fullWidth />
            <Input label="Pickup Time" type="time" value={pickupTime} onChange={(e) => { markChanged(); setPickupTime(e.target.value); }} fullWidth />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pickup Location</label>
            <select className={styles.select} value={pickupLocation} onChange={(e) => { markChanged(); setPickupLocation(e.target.value); }}>
              <option value="Main Store">Main Store</option>
              <option value="Warehouse">Warehouse</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderStep4Payment = () => (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>Payment</h2>
        <p className={styles.sectionSubtitle}>How is the customer paying for this order?</p>
      </div>

      <div className={styles.paymentTotalCard}>
        <div className={styles.paymentTotalLabel}>Current Order Total</div>
        <div className={styles.paymentTotalValue}>₹{pricing.total.toFixed(2)}</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Payment Method</label>
        <div className={styles.pillGroup}>
          {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Online Payment', 'Other'].map(method => (
            <button key={method} className={`${styles.pill} ${paymentMethod === method ? styles.active : ''}`} onClick={() => { markChanged(); setPaymentMethod(method as PaymentMethod); }}>{method}</button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Payment Status</label>
        <div className={styles.pillGroup}>
          {['Paid', 'Partially Paid', 'Pending', 'Failed'].map(status => (
            <button key={status} className={`${styles.pill} ${paymentStatus === status ? styles.active : ''}`} onClick={() => { markChanged(); setPaymentStatus(status as PaymentStatus); }}>{status}</button>
          ))}
        </div>
      </div>

      {paymentStatus === 'Paid' && (
        <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', fontWeight: 600}}>Amount Paid: ₹{pricing.total.toFixed(2)}</div>
      )}

      {paymentStatus === 'Partially Paid' && (
        <div className={styles.row}>
          <Input label="Amount Paid (₹)" type="number" placeholder="0.00" value={amountPaid} onChange={(e) => { markChanged(); setAmountPaid(e.target.value); }} error={errors.amountPaid} fullWidth />
          <Input label="Remaining Amount" type="text" value={`₹${pricing.remaining.toFixed(2)}`} disabled fullWidth />
        </div>
      )}

      <div className={styles.divider} />

      <div>
        <button className={styles.notesToggle} onClick={() => setShowNotes(!showNotes)}>
          {showNotes ? 'Hide Notes' : '+ Add Notes (Optional)'}
        </button>
        {showNotes && (
          <div className={styles.notesContainer}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Internal Note</label>
              <textarea className={styles.textarea} placeholder="Visible only to staff." value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Customer Note</label>
              <textarea className={styles.textarea} placeholder="Information intended for the customer." value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5Review = () => (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>Review Order</h2>
        <p className={styles.sectionSubtitle}>Check the order details before creating it.</p>
      </div>

      <div className={styles.reviewGrid}>
        {/* Customer */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <h3 className={styles.reviewCardTitle}>Customer</h3>
            <button className={styles.reviewEditBtn} onClick={() => jumpToStep(1)}>Edit</button>
          </div>
          <div className={styles.reviewContent}>
            <div style={{fontWeight: 600}}>{customerName || 'No Name Entered'}</div>
            <div>{customerPhone || 'No Phone'}</div>
            <div>{customerEmail}</div>
          </div>
        </div>

        {/* Delivery/Pickup */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <h3 className={styles.reviewCardTitle}>{fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</h3>
            <button className={styles.reviewEditBtn} onClick={() => jumpToStep(3)}>Edit</button>
          </div>
          <div className={styles.reviewContent}>
            {fulfillmentType === 'delivery' ? (
              <>
                <div style={{fontWeight: 600}}>{deliveryDate ? `${deliveryDate} ${deliveryTime}` : 'No date set'}</div>
                <div>{address || 'No address'}</div>
                <div>{city} {state} {pinCode}</div>
              </>
            ) : (
              <>
                <div style={{fontWeight: 600}}>{pickupDate ? `${pickupDate} ${pickupTime}` : 'No date set'}</div>
                <div>{pickupLocation}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3 className={styles.reviewCardTitle}>Order Items</h3>
          <button className={styles.reviewEditBtn} onClick={() => jumpToStep(2)}>Edit</button>
        </div>
        <div className={styles.reviewItemsList}>
          {items.map(item => (
            <div key={item.id} className={styles.reviewItem} style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', background: 'var(--color-surface-hover)', borderRadius: '8px' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{item.name} <span style={{color: 'var(--color-text-muted)'}}>× {item.quantity}</span></span>
                  {item.isCustom && item.notes && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{item.notes}</span>}
                </div>
              </div>
              <span style={{fontWeight: 500}}>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {items.length === 0 && <div style={{color: 'var(--color-text-muted)'}}>No items added.</div>}
        </div>
        <div style={{marginTop: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)'}}>
          Total items: {items.reduce((sum, item) => sum + item.quantity, 0)}
        </div>
      </div>

      {/* Payment */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3 className={styles.reviewCardTitle}>Payment</h3>
          <button className={styles.reviewEditBtn} onClick={() => jumpToStep(4)}>Edit</button>
        </div>
        <div className={styles.reviewContent}>
          <div style={{fontWeight: 600}}>{paymentMethod} · {paymentStatus}</div>
          <div style={{marginTop: 'var(--space-2)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px'}}>
            <span style={{color: 'var(--color-text-muted)'}}>Order Total</span>
            <span>₹{pricing.total.toFixed(2)}</span>
            <span style={{color: 'var(--color-text-muted)'}}>Paid</span>
            <span>₹{pricing.paid.toFixed(2)}</span>
            <span style={{color: 'var(--color-text-muted)'}}>Remaining</span>
            <span style={{fontWeight: 600}}>₹{pricing.remaining.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Final Breakdown */}
      <div className={styles.finalPriceBreakdown}>
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Subtotal</span>
          <span className={styles.pricingValue}>₹{pricing.subtotal.toFixed(2)}</span>
        </div>
        {pricing.discount > 0 && (
          <div className={styles.pricingRow}>
            <span className={styles.pricingLabel}>Discount</span>
            <span className={styles.pricingValue}>−₹{pricing.discount.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Tax (10%)</span>
          <span className={styles.pricingValue}>₹{pricing.tax.toFixed(2)}</span>
        </div>
        {fulfillmentType === 'delivery' && (
          <div className={styles.pricingRow}>
            <span className={styles.pricingLabel}>Delivery</span>
            <span className={styles.pricingValue}>₹{pricing.deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.divider} />
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>₹{pricing.total.toFixed(2)}</span>
        </div>
        <div className={styles.pricingRow} style={{marginTop: 'var(--space-2)'}}>
          <span className={styles.pricingLabel}>Paid</span>
          <span className={styles.pricingValue}>₹{pricing.paid.toFixed(2)}</span>
        </div>
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Remaining</span>
          <span className={styles.pricingValue} style={{fontWeight: 600}}>₹{pricing.remaining.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1Customer();
      case 2: return renderStep2Items();
      case 3: return renderStep3Delivery();
      case 4: return renderStep4Payment();
      case 5: return renderStep5Review();
      default: return null;
    }
  };

  // --- Views ---

  if (successOrder) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <CheckCircle size={32} />
          </div>
          <h2 className={styles.successTitle}>Order Created Successfully</h2>
          <div className={styles.successId}>{successOrder.id}</div>
          <p className={styles.successText}>{successOrder.customerName}</p>
          
          <div className={styles.successDetails}>
            <div style={{fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--admin-brown)'}}>₹{successOrder.total.toFixed(2)}</div>
            <div style={{color: 'var(--color-text-muted)'}}>{successOrder.paymentStatus} · {successOrder.delivery}</div>
          </div>

          <div className={styles.successActions}>
            <Button variant="outline" onClick={() => {}}>View Order</Button>
            <Button 
              variant="primary"
              onClick={() => {
                setSuccessOrder(null);
                setCurrentStep(1);
                setHighestCompletedStep(0);
                setItems([]);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerEmail('');
                setAddress('');
              }}
            >
              Create Another Order
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <AdminNewOrderSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => {
            if (hasUnsavedChanges && !window.confirm('Leave without saving?')) return;
            navigate(-1);
          }} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Create New Order</h1>
            <p className={styles.subtitle}>Register an order manually for a customer.</p>
          </div>
        </div>
      </div>
      {/* Mobile Stepper & Toggle */}
      <div className={styles.mobileOnly}>
        <div className={styles.mobileStepperCard}>
          <div className={styles.mobileStepperIcon}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', 
              background: 'var(--color-white)', color: 'var(--admin-pink)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 12, fontWeight: 'bold'
            }}>
              {currentStep}
            </div>
          </div>
          <div className={styles.mobileStepperInfo}>
            <div className={styles.mobileStepCount}>
              Step {currentStep} of {WIZARD_STEPS.length}
            </div>
            <div className={styles.mobileStepLabel}>
              {WIZARD_STEPS.find(s => s.id === currentStep)?.name}
            </div>
          </div>
          <div className={styles.mobileProgressBarContainer}>
            <div 
              className={styles.mobileProgressBarFill} 
              style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className={styles.mobileToggleContainer}>
          <button 
            className={`${styles.mobileToggleBtn} ${mobileView === 'form' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => setMobileView('form')}
          >
            Order Details
          </button>
          <button 
            className={`${styles.mobileToggleBtn} ${mobileView === 'summary' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => setMobileView('summary')}
          >
            Order Summary
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className={styles.mainGrid}>
        
        {/* Left Column: Wizard */}
        <div className={mobileView === 'summary' ? styles.hideOnMobile : ''} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
          
          {/* Stepper (Desktop) */}
          <div className={styles.stepperContainer}>
            {WIZARD_STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = step.id <= highestCompletedStep && !isActive;
              const isClickable = step.id <= highestCompletedStep + 1;
              
              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''} ${isClickable ? styles.clickable : ''}`}
                    onClick={() => isClickable && jumpToStep(step.id)}
                  >
                    <div className={styles.stepNumber}>{isCompleted ? '✓' : step.id}</div>
                    <div className={styles.stepLabel}>{step.name}</div>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && <div className={styles.stepLine} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Main Wizard Card */}
          <div className={styles.wizardCard}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{flex: 1, display: 'flex', flexDirection: 'column'}}
              >
                {getStepContent()}
              </motion.div>
            </AnimatePresence>

            <div className={styles.wizardFooter}>
              <div style={{visibility: currentStep > 1 ? 'visible' : 'hidden'}}>
                <Button variant="outline" onClick={handlePrevStep} leftIcon={<ArrowLeft size={16} />}>
                  Back
                </Button>
              </div>
              
              {currentStep < 5 ? (
                <Button variant="primary" onClick={handleNextStep}>
                  Continue →
                </Button>
              ) : (
                <Button variant="primary" onClick={handleCreateOrderClick} style={{backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)'}}>
                  Create Order
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Persistent Order Summary */}
        <div className={`${styles.stickySummary} ${mobileView === 'form' ? styles.hideOnMobile : ''}`}>
          <h3 className={styles.stickySummaryTitle}>Order Summary</h3>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Customer</span>
              <span className={styles.pricingValue} style={{textAlign: 'right'}}>{customerName || <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>Pending</span>}</span>
            </div>
            
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className={styles.pricingValue}>₹{pricing.subtotal.toFixed(2)}</span>
            </div>
            
            {pricing.discount > 0 && (
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Discount</span>
                <span className={styles.pricingValue}>−₹{pricing.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Tax (10%)</span>
              <span className={styles.pricingValue}>₹{pricing.tax.toFixed(2)}</span>
            </div>
            
            {fulfillmentType === 'delivery' && (
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Delivery Fee</span>
                <span className={styles.pricingValue}>₹{pricing.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            
            <div className={styles.divider} style={{margin: '4px 0'}} />
            
            <div className={styles.totalRow} style={{marginTop: 0}}>
              <span className={styles.totalLabel} style={{fontSize: 'var(--font-size-base)'}}>Total</span>
              <span className={styles.totalValue} style={{fontSize: 'var(--font-size-xl)'}}>₹{pricing.total.toFixed(2)}</span>
            </div>

            <div className={styles.divider} style={{margin: '4px 0'}} />

            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Payment</span>
              <span className={styles.pricingValue}>{paymentStatus}</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Confirmation Modal */}
      <ResponsiveModal 
        isOpen={showConfirmModal} 
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Create This Order?"
      >
        <p style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)'}}>
          Please confirm that the order details are correct.
        </p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', background: 'var(--admin-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)'}}>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Customer</span>
            <span className={styles.pricingValue}>{customerName || 'N/A'}</span>
          </div>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Order Total</span>
            <span className={styles.pricingValue} style={{fontWeight: 700}}>₹{pricing.total.toFixed(2)}</span>
          </div>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Payment</span>
            <span className={styles.pricingValue}>{paymentStatus}</span>
          </div>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Fulfillment</span>
            <span className={styles.pricingValue}>{fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</span>
          </div>
        </div>

        <div style={{display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end'}}>
          <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Go Back</Button>
          <Button variant="primary" onClick={handleConfirmSubmit} isLoading={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </ResponsiveModal>

    </div>
  );
}
