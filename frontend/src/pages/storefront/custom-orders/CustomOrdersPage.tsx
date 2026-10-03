import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { productData } from '@/features/products';
import { customOrderService, CustomOrderConfigDto, CustomOrderTypeDto } from '@/services/api/customOrderService';
import { CustomOrderStep1 } from './components/CustomOrderStep1';
import { CustomOrderStep2 } from './components/CustomOrderStep2';
import {
  CustomOrderStep1Skeleton,
  CustomOrderSidebarSkeleton,
  CustomOrderTrackSkeleton,
} from './components/CustomOrderStep1Skeleton';
import { DynamicCustomOrderStep } from './components/DynamicCustomOrderStep';
import { CustomOrderData } from './types';
import { FrostingCorner } from './components/FrostingCorner';
import { WavyDivider } from '@/components/decorative/WavyDivider';
import styles from './CustomOrdersPage.module.css';
import {
  Calendar,
  Users,
  Edit3,
  RotateCw,
  LogIn,
  ClipboardList,
  X,
  Clock,
  CheckCircle2,
  Eye,
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';
import { CUSTOM_ORDER_STATUS_THEME } from './constants/customOrderTheme';

const normalizeDateForInput = (val?: string | Date): string => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const CustomOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeOrderId } = useParams<{ id?: string }>();
  const { toast } = useToast();

  const tabParam = searchParams.get('tab');
  const productIdParam = searchParams.get('productId');
  const editIdParam = routeOrderId || searchParams.get('edit');

  const [activeTab, setActiveTab] = useState<'create' | 'track'>(
    tabParam === 'track' && !editIdParam ? 'track' : 'create'
  );
  const [step, setStep] = useState<number>(1);
  const [formConfig, setFormConfig] = useState<CustomOrderConfigDto | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingDisplayId, setEditingDisplayId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingEditOrder, setIsLoadingEditOrder] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Unsaved changes confirmation dialog state
  const [isUnsavedConfirmOpen, setIsUnsavedConfirmOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Authenticated user identity for dynamic prefilling
  const { user, openAuthModal } = useAuth();

  // Initial loaded data baseline for dirty form detection
  const initialEditDataRef = useRef<CustomOrderData | null>(null);

  const [formData, setFormData] = useState<CustomOrderData>({
    design: null,
    occasionDescription: '',
    targetDate: '',
    quantity: '',
    mobileNumber: user?.phone || '',
    customerPhone: user?.phone || '',
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    occasion: '',
    customizationDetails: {},
  });

  // Prefill contact info when user session resolves
  useEffect(() => {
    if (user && mode === 'create') {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        customerEmail: prev.customerEmail || user.email || '',
        mobileNumber: prev.mobileNumber || user.phone || '',
        customerPhone: prev.customerPhone || user.phone || '',
      }));
    }
  }, [user, mode]);

  // Ingest incoming custom order draft from Home page (via state or sessionStorage)
  useEffect(() => {
    if (mode === 'edit') return;
    const navState = (location.state as any) || {};
    let savedDraft: any = null;
    try {
      const stored = sessionStorage.getItem('cpr_custom_order_draft');
      if (stored) {
        savedDraft = JSON.parse(stored);
        sessionStorage.removeItem('cpr_custom_order_draft');
      }
    } catch (_) {}

    const incomingImage = navState.designPreviewUrl || navState.designImage || savedDraft?.designPreviewUrl || savedDraft?.designImage;
    const incomingDesc = navState.occasionDescription || savedDraft?.occasionDescription;

    if (incomingImage || incomingDesc) {
      setFormData((prev) => ({
        ...prev,
        designPreviewUrl: incomingImage || prev.designPreviewUrl,
        designImage: incomingImage || prev.designImage,
        occasionDescription: incomingDesc !== undefined ? incomingDesc : prev.occasionDescription,
      }));

      if (navState.fromHome) {
        toast({
          title: 'Design Loaded',
          message: 'Your custom request details from the home page have been imported.',
          type: 'success',
          duration: 3500,
        });
      }
    }
  }, [location.state, mode, toast]);

  // Fetch published form configuration dynamically
  useEffect(() => {
    let isMounted = true;
    customOrderService
      .getConfig()
      .then((res: any) => {
        if (!isMounted) return;
        if (res?.data) {
          setFormConfig(res.data);
        } else if (res && res.types) {
          setFormConfig(res);
        }
      })
      .catch((err) => {
        console.warn('[CUSTOM ORDER] Failed to load form config, using fallback:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingConfig(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load product if passed via ?productId=...
  useEffect(() => {
    if (!productIdParam || mode === 'edit') return;

    let isMounted = true;
    productData.getProductById(productIdParam).then((prod) => {
      if (!isMounted || !prod) return;
      const primaryImage = (prod as any).image || (prod.images && prod.images[0]?.url) || '';
      const prodCategory = (prod as any).category || prod.categoryName || '';
      const prodPrice = (prod as any).price ?? prod.basePrice ?? 0;
      setFormData((prev) => ({
        ...prev,
        productId: prod.id,
        source: 'PRODUCT',
        customOrderType: 'pre-curated',
        product: {
          id: prod.id,
          productId: prod.id,
          name: prod.name,
          image: primaryImage,
          flavor: (prod as any).flavor || '',
          category: prodCategory,
          price: prodPrice,
          description: prod.description
        }
      }));
    }).catch(console.error);

    return () => { isMounted = false; };
  }, [productIdParam, mode]);

  // Load customer's custom orders
  const loadMyOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const response = await customOrderService.getMyOrders();
      if (response && response.data) {
        setMyOrders(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load custom orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam === 'track' && !editIdParam) {
      setActiveTab('track');
      loadMyOrders();
    }
  }, [tabParam, editIdParam, loadMyOrders]);

  // Fetch single order if edit id present in route or search params
  useEffect(() => {
    if (!editIdParam) return;

    let isMounted = true;
    setIsLoadingEditOrder(true);
    setMode('edit');
    setActiveTab('create');
    setStep(1);

    customOrderService.getById(editIdParam).then((res: any) => {
      if (!isMounted || !res) return;
      const order: any = res?.data || res;

      // Status lock verification
      if (order.status !== 'Pending Quote') {
        toast({
          title: 'Order cannot be edited',
          message: `Request #${order.orderId || editIdParam} has progressed to "${order.status}" and can no longer be modified.`,
          type: 'warning',
          duration: 5000,
        });
        if (routeOrderId) {
          navigate('/custom-orders?tab=track', { replace: true });
        } else {
          setSearchParams({ tab: 'track' });
        }
        return;
      }

      setEditingOrderId(order._id || order.id || '');
      setEditingDisplayId(order.orderId || '');

      const customerPhone = (typeof order.customer === 'object' && order.customer?.phone) || order.customerPhone || order.phone || '';
      const customerName = (typeof order.customer === 'object' && order.customer?.name) || order.customerName || '';
      const customerEmail = (typeof order.customer === 'object' && order.customer?.email) || order.customerEmail || order.email || '';
      const formattedDate = normalizeDateForInput(order.targetDateRaw || order.targetDate);

      const normalized: CustomOrderData = {
        id: order._id || order.id,
        orderId: order.orderId,
        design: null,
        designImage: order.designImage || undefined,
        designPreviewUrl: order.designImage || (order.attachments?.[0]?.url) || (order.productSnapshot?.image) || '',
        occasion: (order.occasion || 'birthday').toLowerCase(),
        occasionDescription: order.occasionDescription || '',
        targetDate: formattedDate,
        quantity: String(order.quantity || '12'),
        mobileNumber: customerPhone,
        customerPhone: customerPhone,
        customerName: customerName,
        customerEmail: customerEmail,
        budget: order.budget ? String(order.budget) : undefined,
        productId: order.productId || '',
        product: order.productSnapshot ? {
          id: order.productId,
          productId: order.productId,
          name: order.productSnapshot.name,
          image: order.productSnapshot.image,
          flavor: order.productSnapshot.flavor,
          category: order.productSnapshot.category || order.productSnapshot.categoryName,
          price: order.productSnapshot.price,
          description: order.productSnapshot.description
        } : null,
        source: order.source,
        customOrderType: order.customOrderType || (order.source === 'PRODUCT' ? 'pre-curated' : 'general'),
        status: order.status,
        customizationDetails: order.customizationDetails || {},
      };

      setFormData(normalized);
      initialEditDataRef.current = normalized;
    }).catch((err: any) => {
      if (!isMounted) return;
      toast({
        title: 'Could not load order for editing',
        message: err?.message || 'You may not have permission to edit this order, or it does not exist.',
        type: 'error',
        duration: 5000,
      });
      if (routeOrderId) {
        navigate('/custom-orders?tab=track', { replace: true });
      } else {
        setSearchParams({ tab: 'track' });
      }
    }).finally(() => {
      if (isMounted) {
        setIsLoadingEditOrder(false);
      }
    });

    return () => { isMounted = false; };
  }, [editIdParam, routeOrderId, toast, navigate, setSearchParams]);

  // Dirty check helper
  const isFormDirty = useCallback((): boolean => {
    if (mode !== 'edit' || !initialEditDataRef.current) return false;
    const base = initialEditDataRef.current;
    return (
      (formData.occasion || '') !== (base.occasion || '') ||
      (formData.occasionDescription || '').trim() !== (base.occasionDescription || '').trim() ||
      (formData.targetDate || '') !== (base.targetDate || '') ||
      (formData.quantity || '') !== (base.quantity || '') ||
      (formData.mobileNumber || '').trim() !== (base.mobileNumber || '').trim() ||
      formData.design instanceof File ||
      (formData.designPreviewUrl || '') !== (base.designPreviewUrl || '')
    );
  }, [mode, formData]);

  const executeCancelEdit = useCallback(() => {
    setMode('create');
    setEditingOrderId(null);
    setEditingDisplayId(null);
    initialEditDataRef.current = null;
    setFormData({
      design: null,
      occasionDescription: '',
      targetDate: '',
      quantity: '',
      mobileNumber: user?.phone || '',
      customerPhone: user?.phone || '',
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      occasion: '',
      productId: undefined,
      product: null,
      customizationDetails: {},
    });
    setStep(1);

    if (routeOrderId) {
      navigate('/custom-orders?tab=track', { replace: true });
    } else {
      setSearchParams({ tab: 'track' });
    }
    setActiveTab('track');
    loadMyOrders();
  }, [routeOrderId, navigate, setSearchParams, loadMyOrders, user]);

  const handlePromptCancelEdit = () => {
    if (isFormDirty()) {
      pendingActionRef.current = executeCancelEdit;
      setIsUnsavedConfirmOpen(true);
    } else {
      executeCancelEdit();
    }
  };

  const handleTabSwitch = (tab: 'create' | 'track') => {
    if (tab === activeTab) return;
    if (mode === 'edit' && tab === 'track') {
      if (isFormDirty()) {
        pendingActionRef.current = () => {
          executeCancelEdit();
          setActiveTab('track');
        };
        setIsUnsavedConfirmOpen(true);
        return;
      } else {
        executeCancelEdit();
        setActiveTab('track');
        return;
      }
    }

    setActiveTab(tab);
    if (tab === 'track') {
      loadMyOrders();
      setSearchParams({ tab: 'track' });
    } else {
      setSearchParams({});
    }
  };

  const handleStartEditFromCard = (order: any) => {
    if (order.status !== 'Pending Quote') {
      toast({
        title: 'Order cannot be edited',
        message: `This request has progressed to "${order.status}" and can no longer be modified.`,
        type: 'warning'
      });
      return;
    }

    if (routeOrderId) {
      navigate(`/custom-orders/${order.orderId || order._id || order.id}/edit`);
    } else {
      setSearchParams({ edit: order.orderId || order._id || order.id });
    }
  };

  const handleNextStep = (data: CustomOrderData) => {
    setFormData(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let designBase64 = '';
      if (formData.design instanceof File) {
        if (formData.design.size > 5 * 1024 * 1024) {
          throw new Error('Design reference image exceeds 5MB limit. Please choose a smaller file.');
        }
        designBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.readAsDataURL(formData.design as File);
        });
      }

      if (mode === 'edit' && editingOrderId) {
        // Resolve design image updates
        let finalDesignImage: string | undefined = undefined;
        if (designBase64) {
          finalDesignImage = designBase64;
        } else if (formData.designPreviewUrl) {
          finalDesignImage = formData.designPreviewUrl;
        } else {
          finalDesignImage = '';
        }

        await customOrderService.update(editingOrderId, {
          customerName: formData.customerName || user?.name || '',
          occasion: formData.occasion || 'other',
          occasionDescription: formData.occasionDescription,
          targetDate: formData.targetDate,
          quantity: parseInt(String(formData.quantity), 10) || 12,
          mobileNumber: formData.mobileNumber || user?.phone || '',
          customerPhone: formData.mobileNumber || user?.phone || '',
          customerEmail: formData.customerEmail || user?.email || '',
          budget: formData.budget,
          designImage: finalDesignImage,
          customizationDetails: formData.customizationDetails || {},
        });

        toast({
          title: 'Custom request updated!',
          message: `Order #${editingDisplayId || ''} has been updated successfully.`,
          type: 'success',
          duration: 4000
        });

        setMode('create');
        setEditingOrderId(null);
        setEditingDisplayId(null);
        initialEditDataRef.current = null;
        setFormData({
          design: null,
          occasionDescription: '',
          targetDate: '',
          quantity: '',
          mobileNumber: user?.phone || '',
          customerPhone: user?.phone || '',
          customerName: user?.name || '',
          customerEmail: user?.email || '',
          occasion: '',
          productId: undefined,
          product: null,
          customizationDetails: {},
        });
        setStep(1);

        if (routeOrderId) {
          navigate('/custom-orders?tab=track', { replace: true });
        } else {
          setSearchParams({ tab: 'track' });
        }
        setActiveTab('track');
        loadMyOrders();
      } else {
        // Create new custom order
        const isProductCustomization = Boolean(formData.productId);
        await customOrderService.create({
          source: isProductCustomization ? 'PRODUCT' : 'GENERAL',
          customOrderType: isProductCustomization ? 'product' : 'general',
          productId: formData.productId,
          occasion: formData.occasion || 'other',
          occasionDescription: formData.occasionDescription,
          targetDate: formData.targetDate,
          quantity: parseInt(String(formData.quantity), 10) || 12,
          mobileNumber: formData.mobileNumber || user?.phone || '',
          customerPhone: formData.mobileNumber || user?.phone || '',
          customerName: formData.customerName || user?.name || '',
          customerEmail: formData.customerEmail || user?.email || '',
          budget: formData.budget,
          designImage: designBase64 || undefined,
          customizationDetails: formData.customizationDetails || {},
        });

        toast({
          title: 'Request sent successfully!',
          message: 'Our team will review your custom order request and get in touch.',
          type: 'success',
          duration: 4000
        });

        setFormData({
          design: null,
          occasionDescription: '',
          targetDate: '',
          quantity: '',
          mobileNumber: user?.phone || '',
          customerPhone: user?.phone || '',
          customerName: user?.name || '',
          customerEmail: user?.email || '',
          occasion: '',
          productId: undefined,
          product: null,
          customizationDetails: {},
        });
        setStep(1);
        setActiveTab('track');
        setSearchParams({ tab: 'track' });
        loadMyOrders();
      }
    } catch (err: any) {
      toast({
        title: mode === 'edit' ? 'Update Failed' : 'Submission Failed',
        message: err.message || 'An error occurred while submitting your custom order.',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <FrostingCorner variant="pink" />
      <Container className={styles.container}>

        {/* Top Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              {mode === 'edit' ? 'Edit Custom Order' : 'Custom Order'}
            </h1>
            <p className={styles.subtitle}>
              {mode === 'edit'
                ? `Updating request #${editingDisplayId || ''}. Adjust your requirements below.`
                : 'Design, customize, and request bespoke artisan cake pops.'}
            </p>
          </div>

          {mode !== 'edit' && (
            <div className={styles.headerRight}>
              <div className={styles.headerToggle} role="tablist" aria-label="Custom Orders Mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'create'}
                  className={`${styles.toggleBtn} ${activeTab === 'create' ? styles.toggleActive : ''}`}
                  onClick={() => handleTabSwitch('create')}
                >
                  Customize
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'track'}
                  className={`${styles.toggleBtn} ${activeTab === 'track' ? styles.toggleActive : ''}`}
                  onClick={() => handleTabSwitch('track')}
                >
                  My Requests
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Editing Alert Banner */}
        {mode === 'edit' && activeTab === 'create' && (
          <div className={styles.editBanner}>
            <div className={styles.editBannerText}>
              <Edit3 size={18} color="var(--color-brand-pink)" />
              <span>
                Currently editing request <strong>#{editingDisplayId}</strong>.
              </span>
            </div>
            <button className={styles.cancelEditBtn} onClick={handlePromptCancelEdit}>
              <X size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Cancel Edit
            </button>
          </div>
        )}

        {/* TAB 1: FORM FLOW */}
        {activeTab === 'create' && (() => {
          const isProductCustom = Boolean(productIdParam || formData.productId);
          const activeConfigType: CustomOrderTypeDto | undefined =
            formConfig?.types?.find((t) =>
              isProductCustom ? t.id === 'product' : t.id === 'general'
            ) || formConfig?.types?.[0];

          const dynamicSteps =
            activeConfigType?.steps && activeConfigType.steps.length > 0
              ? activeConfigType.steps
              : null;

          const summaryStepNumber = dynamicSteps ? dynamicSteps.length + 1 : 2;
          const isSummaryStep = step === summaryStepNumber;

          return (
            <div className={styles.content}>
              {/* Left Sidebar */}
              <div className={styles.leftSidebar}>
                <div className={styles.sidebarStepsCard}>
                  {isLoadingConfig ? (
                    <CustomOrderSidebarSkeleton />
                  ) : dynamicSteps ? (
                    <>
                      {dynamicSteps.map((s, idx) => {
                        const stepNum = idx + 1;
                        const isCurrent = step === stepNum;
                        const isDone = step > stepNum;

                        return (
                          <React.Fragment key={s.id}>
                            <div
                              className={`${styles.sidebarStep} ${
                                isCurrent ? styles.active : isDone ? styles.completed : ''
                              }`}
                              onClick={() => {
                                if (isDone) setStep(stepNum);
                              }}
                              style={{ cursor: isDone ? 'pointer' : 'default' }}
                            >
                              <div className={styles.sidebarStepNumber}>{stepNum}</div>
                              <div className={styles.sidebarStepText}>
                                <h4>{s.title}</h4>
                              </div>
                            </div>
                            <div className={styles.stepDivider} />
                          </React.Fragment>
                        );
                      })}

                      {/* Final Summary Step in Sidebar */}
                      <div className={`${styles.sidebarStep} ${isSummaryStep ? styles.active : ''}`}>
                        <div className={styles.sidebarStepNumber}>{summaryStepNumber}</div>
                        <div className={styles.sidebarStepText}>
                          <h4>Summary</h4>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`${styles.sidebarStep} ${step === 1 ? styles.active : styles.completed}`}>
                        <div className={styles.sidebarStepNumber}>1</div>
                        <div className={styles.sidebarStepText}>
                          <h4>Requirements</h4>
                        </div>
                      </div>

                      <div className={styles.stepDivider} />

                      <div className={`${styles.sidebarStep} ${step === 2 ? styles.active : ''}`}>
                        <div className={styles.sidebarStepNumber}>2</div>
                        <div className={styles.sidebarStepText}>
                          <h4>Summary</h4>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Form Steps */}
              <div className={styles.formSection}>
                {isLoadingEditOrder || isLoadingConfig ? (
                  <CustomOrderStep1Skeleton />
                ) : (
                  <>
                    {dynamicSteps ? (
                      <>
                        {step <= dynamicSteps.length && (
                          <DynamicCustomOrderStep
                            key={dynamicSteps[step - 1].id}
                            stepDef={dynamicSteps[step - 1]}
                            stepIndex={step - 1}
                            totalSteps={dynamicSteps.length}
                            data={formData}
                            onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                            onNext={() => {
                              setStep((prev) => prev + 1);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            onBack={
                              step > 1
                                ? () => {
                                    setStep((prev) => prev - 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                : undefined
                            }
                            mode={mode}
                            isFirstStep={step === 1}
                            isLastStep={step === dynamicSteps.length}
                            nextStepTitle={
                              step < dynamicSteps.length
                                ? dynamicSteps[step]?.title
                                : 'Review Summary'
                            }
                          />
                        )}
                        {isSummaryStep && (
                          <CustomOrderStep2
                            data={formData}
                            steps={dynamicSteps || undefined}
                            onBack={() => {
                              setStep(dynamicSteps.length);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            mode={mode}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {step === 1 && (
                          <CustomOrderStep1
                            initialData={formData}
                            onNext={handleNextStep}
                            mode={mode}
                          />
                        )}
                        {step === 2 && (
                          <CustomOrderStep2
                            data={formData}
                            onBack={() => setStep(1)}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            mode={mode}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 2: MY REQUESTS (CONVERSATIONAL INQUIRY FEED) */}
        {activeTab === 'track' && (
          <div className={styles.trackContainer}>
            {isLoadingOrders && myOrders.length === 0 ? (
              <CustomOrderTrackSkeleton count={3} />
            ) : !user ? (
              <div className={styles.emptyStateCard}>
                <div className={styles.emptyIconBox}>
                  <LogIn size={28} />
                </div>
                <h4 className={styles.emptyTitle}>Sign in to view your custom requests</h4>
                <p className={styles.emptySubtext}>
                  Log in to view your submitted custom requests, team updates, and quotes.
                </p>
                <Button
                  variant="primary"
                  onClick={() => openAuthModal?.()}
                  style={{ marginTop: '8px' }}
                >
                  Sign In
                </Button>
              </div>
            ) : myOrders.length === 0 ? (
              <div className={styles.emptyStateCard}>
                <div className={styles.emptyIconBox}>
                  <ClipboardList size={28} />
                </div>
                <h4 className={styles.emptyTitle}>No Custom Requests Yet</h4>
                <p className={styles.emptySubtext}>
                  You haven't submitted any custom orders yet. Design your unique cake pops for your next celebration!
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleTabSwitch('create')}
                  style={{ marginTop: '8px' }}
                >
                  Start a Custom Request
                </Button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {myOrders.map((order) => {
                  const theme = CUSTOM_ORDER_STATUS_THEME[order.status] || CUSTOM_ORDER_STATUS_THEME['Pending Quote'];
                  const color = theme.color;
                  let StatusIcon = Clock;
                  if (order.status === 'Approved' || order.status === 'Completed' || order.status === 'Delivered') {
                    StatusIcon = CheckCircle2;
                  }

                  const prod = order.productSnapshot || order.product;
                  const shortDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  }) : 'Recent';

                  const shortTargetDate = order.targetDate || (order.targetDateRaw ? new Date(order.targetDateRaw).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  }) : 'Flexible');

                  const reqNumber = order.orderId 
                    ? String(order.orderId).replace(/^REQ-/, '')
                    : 'CUSTOM';
                  const categoryTag = order.source === 'PRODUCT' 
                    ? `#${reqNumber} • Custom Product` 
                    : `#${reqNumber} • Custom Order`;

                  const title = prod?.name || (() => {
                    if (order.occasion && order.occasion !== 'other') {
                      const occ = String(order.occasion).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                      return `${occ} Special`;
                    }
                    if (order.customizationDetails?.theme) {
                      return `${order.customizationDetails.theme} Collection`;
                    }
                    if (order.customizationDetails?.flavor) {
                      return `${order.customizationDetails.flavor} Assortment`;
                    }
                    const qty = order.quantity || 1;
                    return `Bespoke Set × ${qty}`;
                  })();

                  const getDetailsSnippet = () => {
                    const qty = `Qty: ${order.quantity || 1} units`;
                    if (order.occasion && order.occasion !== 'other') {
                      const occ = String(order.occasion).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                      return `${occ} Occasion • ${qty}`;
                    }
                    if (order.occasionDescription && order.occasionDescription.trim().length > 0) {
                      const cleanDesc = order.occasionDescription.trim().replace(/\s+/g, ' ');
                      const snippet = cleanDesc.length > 30 ? `${cleanDesc.slice(0, 30)}…` : cleanDesc;
                      return `"${snippet}" • ${qty}`;
                    }
                    return `Custom Artisan Request • ${qty}`;
                  };

                  const detailsText = getDetailsSnippet();
                  const destinationUrl = `/custom-orders/${order._id || order.id || order.orderId}`;

                  return (
                    <div 
                      key={order._id || order.id} 
                      className={styles.minimalCard}
                      onClick={() => navigate(destinationUrl)}
                    >
                      <div className={styles.minimalHeader}>
                        <div className={styles.minimalStatus}>
                          <StatusIcon size={15} color={color} strokeWidth={2.2} />
                          <span className={styles.minimalStatusText} style={{ color }}>
                            {theme.label}
                          </span>
                        </div>
                        <span className={styles.minimalDate}>{shortDate}</span>
                      </div>

                      <div className={styles.minimalBody}>
                        <div className={styles.minimalImageContainer}>
                          <img 
                            src={order.designImage || prod?.image || 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80'} 
                            alt={title} 
                            className={styles.minimalImage} 
                          />
                        </div>
                        
                        <div className={styles.minimalContent}>
                          <span className={styles.minimalBrand}>{categoryTag}</span>
                          <h4 className={styles.minimalItemName}>{title}</h4>
                          <p className={styles.minimalVariant}>{detailsText}</p>
                          <div className={styles.minimalFooterRow}>
                            {order.quoteAmount ? (
                              <span className={styles.minimalPrice}>Rs.{order.quoteAmount}</span>
                            ) : (
                              <div className={styles.minimalTargetChip}>
                                <Calendar size={12} className={styles.chipIcon} />
                                <span>Target: {shortTargetDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className={styles.minimalChevron}>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Unsaved Changes Confirmation Modal */}
        <ResponsiveModal
          isOpen={isUnsavedConfirmOpen}
          onClose={() => setIsUnsavedConfirmOpen(false)}
          title="Discard Unsaved Changes?"
        >
          <div className={styles.unsavedModalContent}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={22} color="#E11D48" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p className={styles.unsavedModalText}>
                You have unsaved modifications in your custom order form. If you leave or cancel now, your adjustments will be discarded.
              </p>
            </div>
            <div className={styles.unsavedModalActions}>
              <button
                type="button"
                className={styles.stayBtn}
                onClick={() => setIsUnsavedConfirmOpen(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className={styles.leaveBtn}
                onClick={() => {
                  setIsUnsavedConfirmOpen(false);
                  if (pendingActionRef.current) {
                    pendingActionRef.current();
                  }
                }}
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </ResponsiveModal>

      </Container>

      {/* Bottom-left decorative frosting */}
      <FrostingCorner position="bottomLeft" variant="turquoise" className={styles.bottomFrosting} />
    </div>
  );
};
