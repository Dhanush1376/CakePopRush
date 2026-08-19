import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './CheckoutProgress.module.css';

interface CheckoutProgressProps {
  currentStep: 'cart' | 'delivery' | 'payment';
}

export const CheckoutProgress = ({ currentStep }: CheckoutProgressProps) => {
  const navigate = useNavigate();

  const steps = [
    { id: 'cart', label: 'CART', num: 1, colorClass: styles.yellowStep, route: '/cart' },
    { id: 'delivery', label: 'DELIVERY', num: 2, colorClass: styles.pinkStep, route: '/checkout' },
    { id: 'payment', label: 'PAY', num: 3, colorClass: styles.turquoiseStep, route: '/payment' }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className={styles.wrapper}>
      <div className={styles.secureHeader}>
        <ShieldCheck size={14} strokeWidth={2.5} />
        <span>100% SECURE</span>
      </div>
      
      <div className={styles.container}>
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          const isLast = index === steps.length - 1;

          // Determine the active state classes
          let stepClasses = `${styles.step}`;
          if (isActive) stepClasses += ` ${styles.active} ${step.colorClass}`;
          if (isPast) stepClasses += ` ${styles.past} ${step.colorClass}`;

          return (
            <React.Fragment key={step.id}>
              <div 
                className={`${stepClasses} ${isPast ? styles.clickable : ''}`}
                onClick={() => isPast && navigate(step.route)}
                role={isPast ? "button" : undefined}
                tabIndex={isPast ? 0 : undefined}
              >
                <div className={styles.circleRing}>
                  <span className={styles.circle}>
                    {isPast ? '✓' : step.num}
                  </span>
                </div>
                <span className={styles.label}>{step.label}</span>
              </div>
              {!isLast && (
                <div className={`${styles.line} ${isPast ? step.colorClass : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
