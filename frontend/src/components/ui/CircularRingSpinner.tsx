import React from 'react';
import styles from './CircularRingSpinner.module.css';
import { SuspenseFallback } from './SuspenseFallback';

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
  if (fullScreen) {
    return <SuspenseFallback />;
  }

  return (
    <div className={`${styles.spinnerContainer} ${className}`} role="status">
      <div className={`${styles.ring} ${styles[size]}`} />
    </div>
  );
};

export const PageLoader: React.FC = () => (
  <SuspenseFallback />
);
