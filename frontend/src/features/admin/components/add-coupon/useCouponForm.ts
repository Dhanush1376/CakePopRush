import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/ToastContext';

export function useCouponForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [hasMaxDiscount, setHasMaxDiscount] = useState(false);
  const [maxDiscountValue, setMaxDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [noExpiry, setNoExpiry] = useState(false);
  const [endDate, setEndDate] = useState('');

  const [unlimitedUsage, setUnlimitedUsage] = useState(true);
  const [usageLimit, setUsageLimit] = useState('');
  const [limitPerCustomer, setLimitPerCustomer] = useState('unlimited');
  const [customLimit, setCustomLimit] = useState('');

  const [appliesTo, setAppliesTo] = useState<'store' | 'products' | 'categories'>('store');
  const [customerEligibility, setCustomerEligibility] = useState<'everyone' | 'specific'>('everyone');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);

  // Mock selected items for demonstration
  const [selectedProducts, setSelectedProducts] = useState(['Chocolate Cake Pop', 'Strawberry Special']);
  const [selectedCategories, setSelectedCategories] = useState(['Birthday Collection']);
  const [selectedCustomers, setSelectedCustomers] = useState(['Ananya Sharma', 'Rahul Kumar']);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Code Generation
  const generateCode = () => {
    const prefixes = ['SWEET', 'CAKE', 'WELCOME', 'FESTIVE', 'JOY', 'YUMMY'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(10 + Math.random() * 40);
    setCode(`${prefix}${number}`);
    setErrors(prev => ({ ...prev, code: '' }));
  };

  // Validation Logic
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!code.trim()) {
      newErrors.code = 'Coupon code is required.';
      isValid = false;
    }

    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      newErrors.discountValue = 'Please enter a valid discount amount.';
      isValid = false;
    } else if (discountType === 'percentage' && Number(discountValue) > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%.';
      isValid = false;
    }

    if (minOrderValue && (isNaN(Number(minOrderValue)) || Number(minOrderValue) < 0)) {
      newErrors.minOrderValue = 'Minimum order cannot be negative.';
      isValid = false;
    }

    if (!noExpiry && startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        newErrors.endDate = 'End date must be after the start date.';
        isValid = false;
      }
    }

    if (!noExpiry && !endDate) {
      newErrors.endDate = 'Please set an end date or check "No Expiry".';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: 'Coupon created successfully', type: 'success' });
      navigate('/admin/coupons');
    }, 1200);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return {
    navigate,
    mobileView, setMobileView,
    isSubmitting, setIsSubmitting,
    currentStep, setCurrentStep,
    isPageLoading, setIsPageLoading,
    code, setCode,
    description, setDescription,
    discountType, setDiscountType,
    discountValue, setDiscountValue,
    hasMaxDiscount, setHasMaxDiscount,
    maxDiscountValue, setMaxDiscountValue,
    minOrderValue, setMinOrderValue,
    startDate, setStartDate,
    noExpiry, setNoExpiry,
    endDate, setEndDate,
    unlimitedUsage, setUnlimitedUsage,
    usageLimit, setUsageLimit,
    limitPerCustomer, setLimitPerCustomer,
    customLimit, setCustomLimit,
    appliesTo, setAppliesTo,
    customerEligibility, setCustomerEligibility,
    firstOrderOnly, setFirstOrderOnly,
    selectedProducts, setSelectedProducts,
    selectedCategories, setSelectedCategories,
    selectedCustomers, setSelectedCustomers,
    errors, setErrors,
    generateCode,
    validateForm,
    handleSubmit,
    removeItem
  };
}


export type CouponFormState = ReturnType<typeof useCouponForm>;
export type CouponFormProps = CouponFormState;
