import React from 'react';
import { ArrowLeft, Check, Ticket, Tag, Calendar, User, ShoppingBag, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './AdminAddCoupon.module.css';

import { useCouponForm } from '@/features/admin/components/add-coupon/useCouponForm';
import { AdminAddCouponSkeleton } from '@/features/admin/components/add-coupon/AdminAddCouponSkeleton';
import { CouponDetailsStep } from '@/features/admin/components/add-coupon/CouponDetailsStep';
import { CouponDiscountStep } from '@/features/admin/components/add-coupon/CouponDiscountStep';
import { CouponValidityStep } from '@/features/admin/components/add-coupon/CouponValidityStep';
import { CouponUsageLimitsStep } from '@/features/admin/components/add-coupon/CouponUsageLimitsStep';
import { CouponConditionsStep } from '@/features/admin/components/add-coupon/CouponConditionsStep';
import { CouponEligibilityStep } from '@/features/admin/components/add-coupon/CouponEligibilityStep';
import { CouponPreviewPanel } from '@/features/admin/components/add-coupon/CouponPreviewPanel';

const steps = [
  { id: 1, label: 'Details', icon: Ticket },
  { id: 2, label: 'Discount', icon: Tag },
  { id: 3, label: 'Validity', icon: Calendar },
  { id: 4, label: 'Usage Limits', icon: HelpCircle },
  { id: 5, label: 'Conditions', icon: ShoppingBag },
  { id: 6, label: 'Eligibility', icon: User },
];

export function AdminAddCoupon() {
  const form = useCouponForm();

  const FooterNavigation = () => (
    <div className={styles.mediaFooter} style={{ marginTop: '24px' }}>
      <button 
        className={styles.footerBackBtn} 
        onClick={() => form.setCurrentStep(prev => Math.max(prev - 1, 1))}
        style={{ visibility: form.currentStep === 1 ? 'hidden' : 'visible' }}
      >
        Back
      </button>
      <div className={styles.footerRight}>
        {form.currentStep === 6 ? (
          <button className={styles.continueBtn} onClick={form.handleSubmit} disabled={form.isSubmitting}>
            Create Coupon <Check size={16} />
          </button>
        ) : (
          <button className={styles.continueBtn} onClick={() => form.setCurrentStep(prev => Math.min(prev + 1, 6))}>
            Continue <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );

  if (form.isPageLoading) {
    return <AdminAddCouponSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => form.navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Create Coupon</h1>
            <p className={styles.subtitle}>Create a discount coupon for your customers.</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Button variant="ghost" onClick={() => form.navigate(-1)} disabled={form.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit} isLoading={form.isSubmitting}>
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Stepper (Desktop) */}
      <div className={`${styles.stepperContainer} ${styles.desktopOnly}`}>
        <div className={styles.stepper}>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = form.currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`${styles.step} ${isActive ? styles.active : ''}`}
                  onClick={() => form.setCurrentStep(step.id)}
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
            {React.createElement(steps.find(s => s.id === form.currentStep)?.icon || Ticket, { size: 24 })}
          </div>
          <div className={styles.mobileStepperInfo}>
            <div className={styles.mobileStepCount}>
              Step {steps.findIndex(s => s.id === form.currentStep) + 1} of {steps.length}
            </div>
            <div className={styles.mobileStepLabel}>
              {steps.find(s => s.id === form.currentStep)?.label}
            </div>
          </div>
          <div className={styles.mobileProgressBarContainer}>
            <div 
              className={styles.mobileProgressBarFill} 
              style={{ width: `${((steps.findIndex(s => s.id === form.currentStep) + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.mobileToggleContainer}>
          <button 
            className={`${styles.mobileToggleBtn} ${form.mobileView === 'edit' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => form.setMobileView('edit')}
          >
            Edit Coupon
          </button>
          <button 
            className={`${styles.mobileToggleBtn} ${form.mobileView === 'preview' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => form.setMobileView('preview')}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Left Column: Main Form Area */}
        <div className={`${styles.leftColumn} ${form.mobileView === 'preview' ? styles.hideOnMobile : ''}`}>
          
          {form.currentStep === 1 && (
            <CouponDetailsStep {...form} />
          )}

          {form.currentStep === 2 && (
            <CouponDiscountStep {...form} />
          )}

          {form.currentStep === 3 && (
            <CouponValidityStep {...form} />
          )}

          {form.currentStep === 4 && (
            <CouponUsageLimitsStep {...form} />
          )}

          {form.currentStep === 5 && (
            <CouponConditionsStep {...form} />
          )}

          {form.currentStep === 6 && (
            <CouponEligibilityStep {...form} />
          )}
          
          <FooterNavigation />
        </div>

        {/* Right Column: Live Preview */}
        <CouponPreviewPanel {...form} />
      </div>
    </div>
  );
}
