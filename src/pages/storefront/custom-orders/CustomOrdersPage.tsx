import React, { useState } from 'react';
import { Container } from '@/components/layout/Container';
import styles from './CustomOrdersPage.module.css';
import { CustomOrderStep1 } from './components/CustomOrderStep1';
import { CustomOrderStep2 } from './components/CustomOrderStep2';
import { useToast } from '@/components/ui/ToastContext';

import { CustomOrderData } from './types';
import { FrostingCorner } from './components/FrostingCorner';

export const CustomOrdersPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CustomOrderData>({
    design: null,
    occasionDescription: '',
    targetDate: '',
    quantity: '12',
    mobileNumber: '',
  });

  const handleNextStep = (data: CustomOrderData) => {
    setFormData(data);
    setStep(2);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: 'Request sent successfully!', type: 'success' });
      setFormData({
        design: null,
        occasionDescription: '',
        targetDate: '',
        quantity: '12',
        mobileNumber: '',
      });
      setStep(1);
    }, 1000);
  };

  return (
    <div className={styles.pageContainer}>
      <FrostingCorner variant="turquoise" />
      <Container className={styles.container}>

        {/* Top Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Custom Order</h1>
            <p className={styles.subtitle}>Design, estimate, and track your custom orders.</p>
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

          <div className={styles.formSection}>
            {step === 1 && (
              <CustomOrderStep1
                initialData={formData}
                onNext={handleNextStep}
              />
            )}
            {step === 2 && (
              <CustomOrderStep2
                data={formData}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

        </div>
      </Container>
    </div>
  );
};
