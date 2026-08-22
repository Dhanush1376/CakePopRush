import { useState, useMemo, useEffect } from 'react';
import { adminNewOrderData } from '@/features/admin/api/mockAdminDataProvider';
import { 
  OrderItem, FulfillmentType, OrderSource, PaymentMethod, PaymentStatus, TAX_RATE 
} from './types';

export function useNewOrderForm() {
  // Mock Data
  const [MOCK_CUSTOMERS, setMOCK_CUSTOMERS] = useState<any[]>([]);
  const [MOCK_PRODUCTS, setMOCK_PRODUCTS] = useState<any[]>([]);

  // --- Wizard State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [highestCompletedStep, setHighestCompletedStep] = useState(0);

  // --- Form State ---
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Step 1: Customer
  const [customerType, setCustomerType] = useState<'new' | 'existing'>('new');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminNewOrderData.getCustomers(),
      adminNewOrderData.getProducts()
    ]).then(([custs, prods]) => {
      setMOCK_CUSTOMERS(custs);
      setMOCK_PRODUCTS(prods);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [duplicateCustomerFound, setDuplicateCustomerFound] = useState<any>(null);
  const [orderSource, setOrderSource] = useState<OrderSource>('Staff Entry');

  // Step 2: Items
  const [items, setItems] = useState<OrderItem[]>([]);
  const [itemEntryMode, setItemEntryMode] = useState<'catalogue' | 'custom'>('catalogue'); // Default initialized later
  const [productSearch, setProductSearch] = useState('');
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  
  const [editingCustomItemId, setEditingCustomItemId] = useState<string | null>(null);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1');
  
  const [showCustomDetails, setShowCustomDetails] = useState(false);
  const [customItemFlavor, setCustomItemFlavor] = useState('');
  const [customItemSize, setCustomItemSize] = useState('');
  const [customItemMessage, setCustomItemMessage] = useState('');
  const [customItemDesign, setCustomItemDesign] = useState('');
  const [customItemInstructions, setCustomItemInstructions] = useState('');
  
  const [showCustomNotes, setShowCustomNotes] = useState(false);
  const [customItemInternalNote, setCustomItemInternalNote] = useState('');
  const [customItemCustomerNote, setCustomItemCustomerNote] = useState('');

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
  
  // Step 4: Notes
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
  }, [productSearch, MOCK_PRODUCTS]);

  const pricing = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discount = 0; // Keeping discount simple for now
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

  const resetCustomForm = () => {
    setEditingCustomItemId(null);
    setCustomItemName('');
    setCustomItemDesc('');
    setCustomItemPrice('');
    setCustomItemQty('1');
    setCustomItemFlavor('');
    setCustomItemSize('');
    setCustomItemMessage('');
    setCustomItemDesign('');
    setCustomItemInstructions('');
    setCustomItemInternalNote('');
    setCustomItemCustomerNote('');
    setShowCustomDetails(false);
    setShowCustomNotes(false);
  };

  const handleAddCustomItem = () => {
    markChanged();
    const price = parseFloat(customItemPrice);
    if (!customItemName || isNaN(price)) return; 
    
    const customData = {
      isCustom: true,
      name: customItemName,
      quantity: parseInt(customItemQty) || 1,
      unitPrice: price,
      notes: customItemDesc,
      customization: {
        flavor: customItemFlavor,
        size: customItemSize,
        message: customItemMessage,
        design: customItemDesign,
        instructions: customItemInstructions,
      },
      internalNote: customItemInternalNote,
      customerNote: customItemCustomerNote,
    };

    if (editingCustomItemId) {
      setItems(prev => prev.map(item => item.id === editingCustomItemId ? { ...item, ...customData } : item));
    } else {
      setItems(prev => [...prev, { id: `custom-${Date.now()}`, ...customData }]);
    }
    
    resetCustomForm();
    setItemEntryMode('catalogue');
  };

  const handleEditCustomItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setEditingCustomItemId(id);
    setCustomItemName(item.name);
    setCustomItemDesc(item.notes || '');
    setCustomItemPrice(item.unitPrice.toString());
    setCustomItemQty(item.quantity.toString());
    
    setCustomItemFlavor(item.customization?.flavor || '');
    setCustomItemSize(item.customization?.size || '');
    setCustomItemMessage(item.customization?.message || '');
    setCustomItemDesign(item.customization?.design || '');
    setCustomItemInstructions(item.customization?.instructions || '');
    
    setCustomItemInternalNote(item.internalNote || '');
    setCustomItemCustomerNote(item.customerNote || '');
    
    setShowCustomDetails(!!(item.customization?.flavor || item.customization?.size || item.customization?.message || item.customization?.design || item.customization?.instructions));
    setShowCustomNotes(!!(item.internalNote || item.customerNote));
    
    setItemEntryMode('custom');
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

  return {
    MOCK_CUSTOMERS,
    MOCK_PRODUCTS,
    currentStep, setCurrentStep,
    highestCompletedStep, setHighestCompletedStep,
    hasUnsavedChanges, setHasUnsavedChanges,
    isSubmitting, setIsSubmitting,
    successOrder, setSuccessOrder,
    showConfirmModal, setShowConfirmModal,
    isLoading, setIsLoading,
    customerType, setCustomerType,
    customerSearch, setCustomerSearch,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    customerEmail, setCustomerEmail,
    duplicateCustomerFound, setDuplicateCustomerFound,
    orderSource, setOrderSource,
    items, setItems,
    itemEntryMode, setItemEntryMode,
    productSearch, setProductSearch,
    isSearchingProduct, setIsSearchingProduct,
    editingCustomItemId, setEditingCustomItemId,
    customItemName, setCustomItemName,
    customItemDesc, setCustomItemDesc,
    customItemPrice, setCustomItemPrice,
    customItemQty, setCustomItemQty,
    showCustomDetails, setShowCustomDetails,
    customItemFlavor, setCustomItemFlavor,
    customItemSize, setCustomItemSize,
    customItemMessage, setCustomItemMessage,
    customItemDesign, setCustomItemDesign,
    customItemInstructions, setCustomItemInstructions,
    showCustomNotes, setShowCustomNotes,
    customItemInternalNote, setCustomItemInternalNote,
    customItemCustomerNote, setCustomItemCustomerNote,
    fulfillmentType, setFulfillmentType,
    address, setAddress,
    landmark, setLandmark,
    city, setCity,
    state, setState,
    pinCode, setPinCode,
    deliveryDate, setDeliveryDate,
    deliveryTime, setDeliveryTime,
    pickupDate, setPickupDate,
    pickupTime, setPickupTime,
    pickupLocation, setPickupLocation,
    deliveryFeeType, setDeliveryFeeType,
    customDeliveryFee, setCustomDeliveryFee,
    paymentMethod, setPaymentMethod,
    paymentStatus, setPaymentStatus,
    amountPaid, setAmountPaid,
    showNotes, setShowNotes,
    internalNotes, setInternalNotes,
    customerNotes, setCustomerNotes,
    errors, setErrors,
    
    pricing,
    productSearchResults,
    
    markChanged,
    validateStep,
    handleNextStep,
    handlePrevStep,
    jumpToStep,
    handlePhoneChange,
    selectExistingCustomer,
    handleAddProduct,
    resetCustomForm,
    handleAddCustomItem,
    handleEditCustomItem,
    updateItemQuantity,
    removeItem,
    handleCreateOrderClick,
    handleConfirmSubmit
  };
}

export type NewOrderFormState = ReturnType<typeof useNewOrderForm>;
export type NewOrderFormProps = { form: NewOrderFormState };
