import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminNewOrder.module.css';

import { Button } from '@/components/ui/Button';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { AdminNewOrderSkeleton } from '@/features/admin/components/AdminNewOrderSkeleton';

import { useNewOrderForm } from '@/features/admin/components/new-order/useNewOrderForm';
import { WIZARD_STEPS } from '@/features/admin/components/new-order/types';
import { CustomerStep } from '@/features/admin/components/new-order/CustomerStep';
import { ItemsStep } from '@/features/admin/components/new-order/ItemsStep';
import { DeliveryStep } from '@/features/admin/components/new-order/DeliveryStep';
import { PaymentStep } from '@/features/admin/components/new-order/PaymentStep';
import { ReviewStep } from '@/features/admin/components/new-order/ReviewStep';
import { OrderSummaryPanel } from '@/features/admin/components/new-order/OrderSummaryPanel';

export function AdminNewOrder() {
  const navigate = useNavigate();
  const form = useNewOrderForm();
  
  const [mobileView, setMobileView] = useState<'form'|'summary'>('form');

  const getStepContent = () => {
    switch (form.currentStep) {
      case 1: return <CustomerStep form={form} />;
      case 2: return <ItemsStep form={form} />;
      case 3: return <DeliveryStep form={form} />;
      case 4: return <PaymentStep form={form} />;
      case 5: return <ReviewStep form={form} />;
      default: return null;
    }
  };

  if (form.successOrder) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <CheckCircle size={32} />
          </div>
          <h2 className={styles.successTitle}>Order Created Successfully</h2>
          <div className={styles.successId}>{form.successOrder.id}</div>
          <p className={styles.successText}>{form.successOrder.customerName}</p>
          
          <div className={styles.successDetails}>
            <div style={{fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--admin-brown)'}}>₹{form.successOrder.total.toFixed(2)}</div>
            <div style={{color: 'var(--color-text-muted)'}}>{form.successOrder.paymentStatus} · {form.successOrder.delivery}</div>
          </div>

          <div className={styles.successActions}>
            <Button variant="outline" onClick={() => {}}>View Order</Button>
            <Button 
              variant="primary"
              onClick={() => {
                form.setSuccessOrder(null);
                form.setCurrentStep(1);
                form.setHighestCompletedStep(0);
                form.setItems([]);
                form.setCustomerName('');
                form.setCustomerPhone('');
                form.setCustomerEmail('');
                form.setAddress('');
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

  if (form.isLoading) return <AdminNewOrderSkeleton />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => {
            if (form.hasUnsavedChanges && !window.confirm('Leave without saving?')) return;
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
              {form.currentStep}
            </div>
          </div>
          <div className={styles.mobileStepperInfo}>
            <div className={styles.mobileStepCount}>
              Step {form.currentStep} of {WIZARD_STEPS.length}
            </div>
            <div className={styles.mobileStepLabel}>
              {WIZARD_STEPS.find(s => s.id === form.currentStep)?.name}
            </div>
          </div>
          <div className={styles.mobileProgressBarContainer}>
            <div 
              className={styles.mobileProgressBarFill} 
              style={{ width: `${(form.currentStep / WIZARD_STEPS.length) * 100}%` }}
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
              const isActive = form.currentStep === step.id;
              const isCompleted = step.id <= form.highestCompletedStep && !isActive;
              const isClickable = step.id <= form.highestCompletedStep + 1;
              
              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''} ${isClickable ? styles.clickable : ''}`}
                    onClick={() => isClickable && form.jumpToStep(step.id)}
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
                key={form.currentStep}
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
              <div style={{visibility: form.currentStep > 1 ? 'visible' : 'hidden'}}>
                <Button variant="outline" onClick={form.handlePrevStep} leftIcon={<ArrowLeft size={16} />}>
                  Back
                </Button>
              </div>
              
              {form.currentStep < 5 ? (
                <Button variant="primary" onClick={form.handleNextStep}>
                  Continue →
                </Button>
              ) : (
                <Button variant="primary" onClick={form.handleCreateOrderClick} style={{backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)'}}>
                  Create Order
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Persistent Order Summary */}
        <OrderSummaryPanel form={form} mobileView={mobileView} />
      </div>

      {/* Confirmation Modal */}
      <ResponsiveModal 
        isOpen={form.showConfirmModal} 
        onClose={() => !form.isSubmitting && form.setShowConfirmModal(false)}
        title="Create This Order?"
      >
        <p style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)'}}>
          Please confirm that the order details are correct.
        </p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', background: 'var(--admin-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)'}}>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Customer</span>
            <span className={styles.pricingValue}>{form.customerName || 'N/A'}</span>
          </div>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Order Total</span>
            <span className={styles.pricingValue} style={{fontWeight: 700}}>₹{form.pricing.total.toFixed(2)}</span>
          </div>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Payment</span>
            <span className={styles.pricingValue}>{form.paymentStatus}</span>
          </div>
          <div className={styles.pricingRow} style={{marginBottom: 0}}>
            <span className={styles.pricingLabel}>Fulfillment</span>
            <span className={styles.pricingValue}>{form.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</span>
          </div>
        </div>

        <div style={{display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end'}}>
          <Button variant="outline" onClick={() => form.setShowConfirmModal(false)} disabled={form.isSubmitting}>Go Back</Button>
          <Button variant="primary" onClick={form.handleConfirmSubmit} isLoading={form.isSubmitting}>
            {form.isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
