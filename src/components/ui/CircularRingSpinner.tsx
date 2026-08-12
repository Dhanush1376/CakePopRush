import React from 'react';
import styles from './CircularRingSpinner.module.css';

interface CircularRingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  className?: string;
}

export const CircularRingSpinner: React.FC<CircularRingSpinnerProps> = ({
  size = 'lg',
  fullScreen = false,
  className = '',
}) => {
  const spinnerElement = (
    <div className={`${styles.spinnerContainer} ${className}`}>
      <div className={`${styles.ring} ${styles[size]}`} />
    </div>
  );

  if (fullScreen) {
    return <div className={styles.fullScreen}>{spinnerElement}</div>;
  }

  return spinnerElement;
};

export const PageLoader: React.FC = () => (
  <CircularRingSpinner fullScreen size="lg" />
);
