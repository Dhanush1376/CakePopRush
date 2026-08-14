import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Cake, Image as ImageIcon, CheckCircle, ClipboardList, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminAddCustomOrder.module.css';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const WIZARD_STEPS = [
  { id: 1, name: 'Customer', icon: User },
  { id: 2, name: 'Details', icon: Cake },
  { id: 3, name: 'Review', icon: ClipboardList }
];

export function AdminAddCustomOrder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [highestCompletedStep, setHighestCompletedStep] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [occasion, setOccasion] = useState('Birthday');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!customerName.trim()) newErrors.customerName = 'Required';
      if (!customerPhone.trim()) newErrors.customerPhone = 'Required';
    } else if (step === 2) {
      if (!dueDate.trim()) newErrors.dueDate = 'Required';
      if (!description.trim()) newErrors.description = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setHighestCompletedStep(Math.max(highestCompletedStep, currentStep));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => navigate('/admin/custom-orders'), 2000);
      }, 1500);
    }
  };

  const jumpToStep = (step: number) => {
    if (step <= highestCompletedStep + 1) {
      setCurrentStep(step);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle size={64} color="var(--admin-cyan)" />
        </motion.div>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Custom Request Created</h2>
        <p style={{ color: '#666' }}>Redirecting to Custom Orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/admin/custom-orders')} type="button">
          <ArrowLeft size={18} />
        </button>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>New Custom Request</h1>
          <p className={styles.subtitle}>Create a new custom quote or request for a customer</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        
        {/* Sidebar Stepper */}
        <div className={styles.sidebar}>
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = step.id <= highestCompletedStep;
            const isActive = step.id === currentStep;
            const isClickable = step.id <= highestCompletedStep + 1;
            
            return (
              <div 
                key={step.id} 
                className={`
                  ${styles.sidebarStep} 
                  ${isActive ? styles.sidebarStepActive : ''} 
                  ${isCompleted && !isActive ? styles.sidebarStepCompleted : ''}
                `}
                onClick={() => isClickable && jumpToStep(step.id)}
                style={{ cursor: isClickable ? 'pointer' : 'not-allowed', opacity: isClickable ? 1 : 0.6 }}
              >
                <div className={styles.sidebarStepIcon}>
                  {isCompleted && !isActive ? <CheckCircle size={16} /> : <step.icon size={16} />}
                </div>
                <div className={styles.sidebarStepInfo}>
                  <span className={styles.sidebarStepNumber}>Step {step.id}</span>
                  <span className={styles.sidebarStepLabel}>{step.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper (Visible only on small screens) */}
        <div className={styles.mobileOnly}>
          <div className={styles.mobileStepperCard}>
            <div className={styles.mobileStepperIcon}>
              {currentStep}
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
        </div>

        {/* Wizard Card */}
        <div className={styles.wizardCard}>
          <AnimatePresence mode="wait">
            
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepContent}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.sectionTitle}>Customer Information</h2>
                  <p className={styles.sectionSubtitle}>Who is this request for?</p>
                </div>
                <div className={styles.twoColumns}>
                  <Input 
                    label="Customer Name *" 
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    error={errors.customerName}
                    fullWidth
                  />
                  <Input 
                    label="Phone Number *" 
                    placeholder="e.g. +91 9876543210"
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    error={errors.customerPhone}
                    fullWidth
                  />
                </div>
                <div className={styles.twoColumns}>
                  <Input 
                    label="Email Address" 
                    placeholder="e.g. john@example.com"
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    fullWidth
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepContent}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.sectionTitle}>Request Details</h2>
                  <p className={styles.sectionSubtitle}>Capture all the specifics for this quote.</p>
                </div>
                
                <div className={styles.twoColumns}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Occasion</label>
                    <select className={styles.select} value={occasion} onChange={e => setOccasion(e.target.value)}>
                      <option value="Birthday">Birthday</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Input 
                    label="Due Date / Event Date *" 
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    error={errors.dueDate}
                    fullWidth
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Detailed Description *</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Describe what the customer is looking for (theme, colors, flavors, quantity...)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  {errors.description && <span style={{ color: 'red', fontSize: '12px' }}>{errors.description}</span>}
                </div>

                <div className={styles.twoColumns}>
                  <Input 
                    label="Estimated Budget (Optional)" 
                    placeholder="₹"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    fullWidth
                  />
                </div>
                
                <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                  <label className={styles.label}>Reference Image (Optional)</label>
                  <div className={styles.mediaBox}>
                    <ImageIcon size={32} className={styles.mediaIcon} />
                    <span className={styles.mediaText}>Click to upload reference images</span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>PNG, JPG up to 5MB</span>
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                  <label className={styles.label}>Internal Staff Notes</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Private notes for staff..."
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepContent}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.sectionTitle}>Review Request</h2>
                  <p className={styles.sectionSubtitle}>Please confirm the quote details before submitting.</p>
                </div>
                
                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewSectionTitle}><User size={16} /> Customer Information</h3>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Name</span>
                    <span className={styles.reviewValue}>{customerName}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Phone</span>
                    <span className={styles.reviewValue}>{customerPhone}</span>
                  </div>
                  {customerEmail && (
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Email</span>
                      <span className={styles.reviewValue}>{customerEmail}</span>
                    </div>
                  )}
                </div>

                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewSectionTitle}><Cake size={16} /> Request Details</h3>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Occasion</span>
                    <span className={styles.reviewValue}>{occasion}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Due Date</span>
                    <span className={styles.reviewValue}>{dueDate}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Description</span>
                    <span className={styles.reviewValue} style={{ maxWidth: '60%', textAlign: 'right' }}>{description}</span>
                  </div>
                  {budget && (
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Budget</span>
                      <span className={styles.reviewValue}>₹{budget}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className={styles.wizardFooter}>
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrev}>Back</Button>
            ) : (
              <div></div> // Empty div for flexbox spacing
            )}
            
            <div className={styles.btnGroup}>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/custom-orders')}>Cancel</Button>
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext}>Next Step</Button>
              ) : (
                <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>Create Quote</Button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
