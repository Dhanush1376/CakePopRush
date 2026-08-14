import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, Ticket, Tag, Calendar, User, 
  ShoppingBag, HelpCircle, X, Search, Grid, Plus, ArrowRight 
} from 'lucide-react';
import styles from './AdminAddCoupon.module.css';
import { useToast } from '@/components/ui/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const steps = [
  { id: 1, label: 'Details', icon: Ticket },
  { id: 2, label: 'Discount', icon: Tag },
  { id: 3, label: 'Validity', icon: Calendar },
  { id: 4, label: 'Usage Limits', icon: HelpCircle },
  { id: 5, label: 'Conditions', icon: ShoppingBag },
  { id: 6, label: 'Eligibility', icon: User },
];

export function AdminAddCoupon() {
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

  const FooterNavigation = () => (
    <div className={styles.mediaFooter} style={{ marginTop: '24px' }}>
      <button 
        className={styles.footerBackBtn} 
        onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
        style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
      >
        Back
      </button>
      <div className={styles.footerRight}>
        {currentStep === 6 ? (
          <button className={styles.continueBtn} onClick={handleSubmit} disabled={isSubmitting}>
            Create Coupon <Check size={16} />
          </button>
        ) : (
          <button className={styles.continueBtn} onClick={() => setCurrentStep(prev => Math.min(prev + 1, 6))}>
            Continue <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );

  if (isPageLoading) {
    return <AdminAddCouponSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Create Coupon</h1>
            <p className={styles.subtitle}>Create a discount coupon for your customers.</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Button variant="ghost" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Stepper (Desktop) */}
      <div className={`${styles.stepperContainer} ${styles.desktopOnly}`}>
        <div className={styles.stepper}>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`${styles.step} ${isActive ? styles.active : ''}`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={styles.stepIcon}>
                    {isActive ? step.id : <StepIcon size={16} />}
                  </div>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
                {index < steps.length - 1 && <div className={styles.stepLine} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper & Toggle */}
      <div className={styles.mobileOnly}>
        <div className={styles.mobileStepperCard}>
          <div className={styles.mobileStepperIcon}>
            {React.createElement(steps.find(s => s.id === currentStep)?.icon || Ticket, { size: 24 })}
          </div>
          <div className={styles.mobileStepperInfo}>
            <div className={styles.mobileStepCount}>
              Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
            </div>
            <div className={styles.mobileStepLabel}>
              {steps.find(s => s.id === currentStep)?.label}
            </div>
          </div>
          <div className={styles.mobileProgressBarContainer}>
            <div 
              className={styles.mobileProgressBarFill} 
              style={{ width: `${((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.mobileToggleContainer}>
          <button 
            className={`${styles.mobileToggleBtn} ${mobileView === 'edit' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => setMobileView('edit')}
          >
            Edit Coupon
          </button>
          <button 
            className={`${styles.mobileToggleBtn} ${mobileView === 'preview' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => setMobileView('preview')}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Left Column: Main Form Area */}
        <div className={`${styles.leftColumn} ${mobileView === 'preview' ? styles.hideOnMobile : ''}`}>
          
          {/* Coupon Details */}
          {currentStep === 1 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Coupon Details</h2>
              <p className={styles.sectionSubtitle}>Create the code customers will use at checkout.</p>
              
              <div className={styles.mediaBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className={styles.mediaBoxTitle} style={{ margin: 0 }}>COUPON CODE</h3>
                  <button 
                    type="button" 
                    onClick={generateCode} 
                    style={{ color: '#F21B5B', background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    Generate Code
                  </button>
                </div>
                <Input 
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().replace(/\s/g, ''));
                    if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
                  }}
                  placeholder="e.g. SUMMER20"
                  error={errors.code}
                  fullWidth
                  style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Customers will enter this code at checkout.</p>
              </div>

              <div className={styles.mediaBox}>
                <h3 className={styles.mediaBoxTitle}>INTERNAL DESCRIPTION (OPTIONAL)</h3>
                <Input 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: Independence Day promotional coupon"
                  fullWidth
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Only visible to admins.</p>
              </div>

              <FooterNavigation />
            </div>
          )}

          {/* Discount */}
          {currentStep === 2 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Discount</h2>
              <p className={styles.sectionSubtitle}>Choose how much customers will save.</p>
              
              <div className={styles.segmentedControl}>
                <button 
                  className={`${styles.segmentedBtn} ${discountType === 'percentage' ? styles.segmentedBtnActive : ''}`}
                  onClick={() => {
                    setDiscountType('percentage');
                    if (errors.discountValue) setErrors(prev => ({ ...prev, discountValue: '' }));
                  }}
                >
                  Percentage
                </button>
                <button 
                  className={`${styles.segmentedBtn} ${discountType === 'fixed' ? styles.segmentedBtnActive : ''}`}
                  onClick={() => {
                    setDiscountType('fixed');
                    setHasMaxDiscount(false);
                    if (errors.discountValue) setErrors(prev => ({ ...prev, discountValue: '' }));
                  }}
                >
                  Fixed Amount
                </button>
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
                  <h3 className={styles.mediaBoxTitle}>{discountType === 'percentage' ? 'DISCOUNT (%)' : 'DISCOUNT AMOUNT (₹)'}</h3>
                  <Input 
                    value={discountValue}
                    onChange={(e) => {
                      setDiscountValue(e.target.value.replace(/[^0-9.]/g, ''));
                      if (errors.discountValue) setErrors(prev => ({ ...prev, discountValue: '' }));
                    }}
                    placeholder={discountType === 'percentage' ? "20" : "500"}
                    leftIcon={discountType === 'percentage' ? '%' : '₹'}
                    error={errors.discountValue}
                    fullWidth
                  />
                </div>

                <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
                  <h3 className={styles.mediaBoxTitle}>MINIMUM ORDER VALUE</h3>
                  <Input 
                    value={minOrderValue}
                    onChange={(e) => {
                      setMinOrderValue(e.target.value.replace(/[^0-9]/g, ''));
                      if (errors.minOrderValue) setErrors(prev => ({ ...prev, minOrderValue: '' }));
                    }}
                    placeholder="No minimum"
                    leftIcon="₹"
                    error={errors.minOrderValue}
                    fullWidth
                  />
                </div>
              </div>

              {discountType === 'percentage' && (
                <div className={styles.mediaBox} style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasMaxDiscount ? '16px' : '0' }}>
                    <div>
                      <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>SET MAXIMUM DISCOUNT</h3>
                      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Prevent unlimited discounts on large orders.</p>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input type="checkbox" checked={hasMaxDiscount} onChange={(e) => setHasMaxDiscount(e.target.checked)} />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                  {hasMaxDiscount && (
                    <Input 
                      value={maxDiscountValue}
                      onChange={(e) => setMaxDiscountValue(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 1000"
                      leftIcon="₹"
                      fullWidth
                    />
                  )}
                </div>
              )}

              <FooterNavigation />
            </div>
          )}

          {/* Validity */}
          {currentStep === 3 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Coupon Validity</h2>
              <p className={styles.sectionSubtitle}>Choose when this coupon can be used.</p>
              
              <div className={styles.rowGrid}>
                <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
                  <h3 className={styles.mediaBoxTitle}>START DATE</h3>
                  <Input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                  />
                </div>

                {!noExpiry && (
                  <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
                    <h3 className={styles.mediaBoxTitle}>END DATE</h3>
                    <Input 
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (errors.endDate) setErrors(prev => ({ ...prev, endDate: '' }));
                      }}
                      error={errors.endDate}
                      fullWidth
                      min={startDate}
                    />
                  </div>
                )}
              </div>

              <div className={styles.mediaBox} style={{ marginTop: '16px', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>NO EXPIRY</h3>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Coupon will remain active indefinitely.</p>
                </div>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" checked={noExpiry} onChange={(e) => {
                    setNoExpiry(e.target.checked);
                    if (e.target.checked && errors.endDate) setErrors(prev => ({ ...prev, endDate: '' }));
                  }} />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <FooterNavigation />
            </div>
          )}

          {/* Usage & Limits */}
          {currentStep === 4 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Usage Limits</h2>
              <p className={styles.sectionSubtitle}>Control how many times this coupon can be used.</p>

              <div className={styles.mediaBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: !unlimitedUsage ? '16px' : '0' }}>
                  <div>
                    <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>UNLIMITED TOTAL USAGE</h3>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Uncheck to limit the total number of times this coupon can be used.</p>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input type="checkbox" checked={unlimitedUsage} onChange={(e) => setUnlimitedUsage(e.target.checked)} />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                {!unlimitedUsage && (
                  <Input 
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 500"
                    leftIcon="#"
                    fullWidth
                  />
                )}
              </div>

              <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
                <h3 className={styles.mediaBoxTitle}>LIMIT PER CUSTOMER</h3>
                <select 
                  className={styles.textAreaInput} 
                  style={{ height: '42px', padding: '0 14px' }}
                  value={limitPerCustomer}
                  onChange={(e) => setLimitPerCustomer(e.target.value)}
                >
                  <option value="unlimited">Unlimited uses per customer</option>
                  <option value="1">1 use per customer</option>
                  <option value="2">2 uses per customer</option>
                  <option value="3">3 uses per customer</option>
                  <option value="custom">Custom amount...</option>
                </select>
                
                {limitPerCustomer === 'custom' && (
                  <div style={{ marginTop: '12px' }}>
                    <Input 
                      value={customLimit}
                      onChange={(e) => setCustomLimit(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 5"
                      fullWidth
                    />
                  </div>
                )}
              </div>

              <FooterNavigation />
            </div>
          )}

          {/* Conditions */}
          {currentStep === 5 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Coupon Conditions</h2>
              <p className={styles.sectionSubtitle}>Choose what customers can use this coupon on.</p>

              <div className={styles.segmentedControl}>
                <button 
                  className={`${styles.segmentedBtn} ${appliesTo === 'store' ? styles.segmentedBtnActive : ''}`}
                  onClick={() => setAppliesTo('store')}
                >
                  Entire Store
                </button>
                <button 
                  className={`${styles.segmentedBtn} ${appliesTo === 'products' ? styles.segmentedBtnActive : ''}`}
                  onClick={() => setAppliesTo('products')}
                >
                  Specific Products
                </button>
                <button 
                  className={`${styles.segmentedBtn} ${appliesTo === 'categories' ? styles.segmentedBtnActive : ''}`}
                  onClick={() => setAppliesTo('categories')}
                >
                  Specific Categories
                </button>
              </div>

              {appliesTo === 'store' && (
                <div className={styles.mediaBox} style={{ marginBottom: 0, textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#FFF0F5', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#F21B5B' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '8px' }}>APPLIES TO ENTIRE STORE</h3>
                  <p style={{ fontSize: '13px', color: '#666', margin: 0, maxWidth: '300px' }}>This coupon will be valid for all products and categories in your catalog.</p>
                </div>
              )}

              {appliesTo === 'products' && (
                <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
                  <h3 className={styles.mediaBoxTitle}>SELECT PRODUCTS</h3>
                  <div className={styles.inputWithIcon} style={{ marginBottom: '12px' }}>
                    <span className={styles.inputIcon}><Search size={14} /></span>
                    <input type="text" placeholder="Search products..." className={styles.urlInput} style={{paddingLeft: '36px'}} />
                  </div>
                  <div className={styles.chipGroup}>
                    {selectedProducts.map((product, idx) => (
                      <div key={idx} className={styles.chip}>
                        {product}
                        <button type="button" onClick={() => removeItem(setSelectedProducts, idx)}><X size={12} /></button>
                      </div>
                    ))}
                    <button type="button" className={styles.chip} style={{ borderStyle: 'dashed', cursor: 'pointer', background: 'transparent' }}>
                      <Plus size={12} /> Add Product
                    </button>
                  </div>
                </div>
              )}

              {appliesTo === 'categories' && (
                <div className={styles.mediaBox} style={{ marginBottom: 0 }}>
                  <h3 className={styles.mediaBoxTitle}>SELECT CATEGORIES</h3>
                  <div className={styles.inputWithIcon} style={{ marginBottom: '12px' }}>
                    <span className={styles.inputIcon}><Search size={14} /></span>
                    <input type="text" placeholder="Search categories..." className={styles.urlInput} style={{paddingLeft: '36px'}} />
                  </div>
                  <div className={styles.chipGroup}>
                    {selectedCategories.map((category, idx) => (
                      <div key={idx} className={styles.chip}>
                        {category}
                        <button type="button" onClick={() => removeItem(setSelectedCategories, idx)}><X size={12} /></button>
                      </div>
                    ))}
                    <button type="button" className={styles.chip} style={{ borderStyle: 'dashed', cursor: 'pointer', background: 'transparent' }}>
                      <Plus size={12} /> Add Category
                    </button>
                  </div>
                </div>
              )}

              <FooterNavigation />
            </div>
          )}

          {/* Customer Eligibility */}
          {currentStep === 6 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Customer Eligibility</h2>
              <p className={styles.sectionSubtitle}>Choose who can use this coupon.</p>

              <div className={styles.segmentedControl}>
                <button 
                  className={`${styles.segmentedBtn} ${customerEligibility === 'everyone' ? styles.segmentedBtnActive : ''}`}
                  onClick={() => setCustomerEligibility('everyone')}
                >
                  Everyone
                </button>
                <button 
                  className={`${styles.segmentedBtn} ${customerEligibility === 'specific' ? styles.segmentedBtnActive : ''}`}
                  onClick={() => setCustomerEligibility('specific')}
                >
                  Specific Customers
                </button>
              </div>

              {customerEligibility === 'everyone' && (
                <div className={styles.mediaBox} style={{ marginBottom: '16px', textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#FFF0F5', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#F21B5B' }}>
                    <User size={24} />
                  </div>
                  <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '8px' }}>AVAILABLE TO EVERYONE</h3>
                  <p style={{ fontSize: '13px', color: '#666', margin: 0, maxWidth: '300px' }}>Any customer with this code will be able to apply the discount.</p>
                </div>
              )}

              {customerEligibility === 'specific' && (
                <div className={styles.mediaBox} style={{ marginBottom: '16px' }}>
                  <h3 className={styles.mediaBoxTitle}>SEARCH CUSTOMERS</h3>
                  <div className={styles.inputWithIcon} style={{ marginBottom: '12px' }}>
                    <span className={styles.inputIcon}><Search size={14} /></span>
                    <input type="text" placeholder="Search by name, phone or email..." className={styles.urlInput} style={{paddingLeft: '36px'}} />
                  </div>
                  <div className={styles.chipGroup}>
                    {selectedCustomers.map((customer, idx) => (
                      <div key={idx} className={styles.chip}>
                        {customer}
                        <button type="button" onClick={() => removeItem(setSelectedCustomers, idx)}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.mediaBox} style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 className={styles.mediaBoxTitle} style={{ marginBottom: '4px' }}>FIRST ORDER ONLY</h3>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Allow this coupon only for a customer's first purchase.</p>
                </div>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" checked={firstOrderOnly} onChange={(e) => setFirstOrderOnly(e.target.checked)} />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <FooterNavigation />
            </div>
          )}
          
        </div>

        {/* Right Column: Live Preview */}
        <div className={`${styles.card} ${mobileView === 'edit' ? styles.hideOnMobile : ''}`} style={{ alignSelf: 'start', position: 'sticky', top: '24px' }}>
          <h2 className={styles.sectionTitle}>Coupon Preview</h2>
          <p className={styles.sectionSubtitle} style={{ marginBottom: '24px' }}>Live summary of your configuration</p>

          <div className={styles.couponPreviewBanner}>
            <div className={styles.couponPreviewCode}>{code || 'COUPON CODE'}</div>
            <div className={styles.couponPreviewDiscount}>
              {discountValue ? (discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`) : '0% OFF'}
            </div>
            {description && <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px', textAlign: 'center' }}>{description}</div>}
          </div>

          <ul className={styles.couponPreviewList}>
            {minOrderValue && (
              <li className={styles.couponPreviewItem}>
                <ShoppingBag size={14} className={styles.couponPreviewIcon} />
                <span>On orders above <strong>₹{minOrderValue}</strong></span>
              </li>
            )}
            
            <li className={styles.couponPreviewItem}>
              <Calendar size={14} className={styles.couponPreviewIcon} />
              <span>
                {noExpiry 
                  ? 'No expiry date' 
                  : `Valid until ${endDate ? new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'set date'}`
                }
              </span>
            </li>
            
            {!unlimitedUsage && usageLimit && (
              <li className={styles.couponPreviewItem}>
                <Ticket size={14} className={styles.couponPreviewIcon} />
                <span><strong>{usageLimit}</strong> total uses available</span>
              </li>
            )}

            <li className={styles.couponPreviewItem}>
              <User size={14} className={styles.couponPreviewIcon} />
              <span>
                {firstOrderOnly 
                  ? 'For first-time customers only' 
                  : (customerEligibility === 'everyone' ? 'For all customers' : 'For specific customers')}
              </span>
            </li>

            {(appliesTo !== 'store') && (
              <li className={styles.couponPreviewItem}>
                <Grid size={14} className={styles.couponPreviewIcon} />
                <span>
                  Valid on specific {appliesTo === 'products' ? 'products' : 'categories'}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function AdminAddCouponSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.backBtn} style={{ background: '#f5f5f5', border: 'none' }} />
          <div className={styles.titleWrapper}>
            <Skeleton width={150} height={20} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '8px' }} />
            <Skeleton width={200} height={14} variant="rectangular" style={{ borderRadius: '4px' }} />
          </div>
        </div>
        <div className={styles.headerRight}>
          <Skeleton width={80} height={40} variant="rectangular" style={{ borderRadius: '100px' }} />
          <Skeleton width={140} height={40} variant="rectangular" style={{ borderRadius: '100px', marginLeft: '12px' }} />
        </div>
      </div>

      {/* Stepper Skeleton */}
      <div className={`${styles.stepperContainer} ${styles.desktopOnly}`}>
        <div className={styles.stepper}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <React.Fragment key={i}>
              <div className={styles.step}>
                <Skeleton width={32} height={32} variant="circular" />
                <Skeleton width={60} height={16} variant="rectangular" style={{ borderRadius: '4px', marginLeft: '12px' }} />
              </div>
              {i < 6 && <div className={styles.stepLine} style={{ opacity: 0.2 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile Stepper Skeleton */}
      <div className={styles.mobileOnly}>
         <Skeleton width="100%" height={80} variant="rectangular" style={{ borderRadius: '12px', marginBottom: '16px' }} />
         <Skeleton width="100%" height={48} variant="rectangular" style={{ borderRadius: '100px', marginBottom: '24px' }} />
      </div>

      {/* Main Grid Skeleton */}
      <div className={styles.mainGrid}>
        {/* Left Column Skeleton */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <Skeleton width={180} height={24} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '12px' }} />
            <Skeleton width={260} height={16} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '24px' }} />
            
            <div className={styles.mediaBox}>
              <Skeleton width={100} height={14} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '16px' }} />
              <Skeleton width="100%" height={48} variant="rectangular" style={{ borderRadius: '8px', marginBottom: '8px' }} />
              <Skeleton width={140} height={12} variant="rectangular" style={{ borderRadius: '4px' }} />
            </div>

            <div className={styles.mediaBox}>
              <Skeleton width={200} height={14} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '16px' }} />
              <Skeleton width="100%" height={48} variant="rectangular" style={{ borderRadius: '8px', marginBottom: '8px' }} />
              <Skeleton width={120} height={12} variant="rectangular" style={{ borderRadius: '4px' }} />
            </div>
            
            <div className={styles.mediaFooter} style={{ marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
               <Skeleton width={120} height={40} variant="rectangular" style={{ borderRadius: '100px' }} />
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className={`${styles.card} ${styles.desktopOnly}`}>
          <Skeleton width={140} height={24} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '12px' }} />
          <Skeleton width={200} height={16} variant="rectangular" style={{ borderRadius: '4px', marginBottom: '24px' }} />
          
          <Skeleton width="100%" height={120} variant="rectangular" style={{ borderRadius: '12px', marginBottom: '24px' }} />

          {[1, 2, 3, 4, 5].map(i => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
               <Skeleton width={20} height={20} variant="circular" style={{ marginRight: '12px' }} />
               <Skeleton width={180} height={16} variant="rectangular" style={{ borderRadius: '4px' }} />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
