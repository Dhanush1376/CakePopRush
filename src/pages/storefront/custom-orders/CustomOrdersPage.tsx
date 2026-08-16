import React, { useState } from 'react';
import { Container } from '@/components/layout/Container';
import styles from './CustomOrdersPage.module.css';
import { CustomOrderStep1 } from './components/CustomOrderStep1';
import { CustomOrderStep2 } from './components/CustomOrderStep2';
import { useToast } from '@/components/ui/ToastContext';

import { CustomOrderData } from './types';

export const CustomOrdersPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CustomOrderData>({
    design: null,
    occasionDescription: '',
    targetDate: '',
    quantity: '12',
  });

  const handleNextStep = (data: CustomOrderData) => {
    setFormData(data);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    // In a real app, send data to the backend here
    toast({ title: 'Your custom order request has been submitted!', type: 'success' });

    // Reset form after a brief delay
    setTimeout(() => {
      setFormData({
        design: null,
        occasionDescription: '',
        targetDate: '',
        quantity: '12',
      });
      setStep(1);
    }, 2500);
  };

  return (
    <div className={styles.pageContainer}>
      <Container className={styles.container}>

        {/* Top Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Custom Order</h1>
            <p className={styles.subtitle}>Design your custom decor, get price estimates, and track your orders.</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerToggle}>
              <button className={`${styles.toggleBtn} ${styles.toggleActive}`}>START CUSTOM REQUEST</button>
              <button className={styles.toggleBtn}>TRACK MY CUSTOM ORDERS</button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className={styles.content}>

          {/* Left Sidebar */}
          <div className={styles.leftSidebar}>

            <div className={styles.sidebarStepsCard}>
              <div className={`${styles.sidebarStep} ${step === 1 ? styles.active : styles.completed}`}>
                <div className={styles.sidebarStepNumber}>1</div>
                <div className={styles.sidebarStepText}>
                  <h4>Inspiration</h4>
                  <p>Tell us your vision</p>
                </div>
              </div>

              <div className={styles.stepDivider} />

              <div className={`${styles.sidebarStep} ${step === 2 ? styles.active : ''}`}>
                <div className={styles.sidebarStepNumber}>2</div>
                <div className={styles.sidebarStepText}>
                  <h4>Summary</h4>
                  <p>Review your request</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Main Form Area */}
          <div className={styles.formSection}>
            {step === 1 ? (
              <CustomOrderStep1
                initialData={formData}
                onNext={handleNextStep}
              />
            ) : (
              <CustomOrderStep2
                data={formData}
                onBack={handleBack}
                onSubmit={handleSubmit}
              />
            )}
          </div>

        </div>
      </Container>
    </div>
  );
};
