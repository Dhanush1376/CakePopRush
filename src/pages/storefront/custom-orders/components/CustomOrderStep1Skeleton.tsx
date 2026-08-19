import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './CustomOrderSteps.module.css';

export const CustomOrderStep1Skeleton: React.FC = () => {
  return (
    <div className={styles.stepContainer}>
      <Skeleton variant="text" width="50%" height={24} style={{ marginBottom: 4 }} />
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="60%" height={16} style={{ marginBottom: 12 }} />

      <div className={styles.formGrid}>
        <div className={styles.inputWrapper}>
          <Skeleton variant="text" width={140} height={12} style={{ marginBottom: 4 }} />
          <Skeleton variant="rounded" height={120} width="100%" />
        </div>

        <div className={styles.inputWrapper}>
          <Skeleton variant="text" width={160} height={12} style={{ marginBottom: 4 }} />
          <Skeleton variant="rounded" height={100} width="100%" />
        </div>

        <div className={styles.row}>
          <div className={styles.inputWrapper}>
            <Skeleton variant="text" width={100} height={12} style={{ marginBottom: 4 }} />
            <Skeleton variant="rounded" height={48} width="100%" />
          </div>
          
          <div className={styles.inputWrapper}>
            <Skeleton variant="text" width={50} height={12} style={{ marginBottom: 4 }} />
            <Skeleton variant="rounded" height={48} width="100%" />
          </div>
        </div>
        
        <div className={styles.inputWrapper}>
          <Skeleton variant="text" width={120} height={12} style={{ marginBottom: 4 }} />
          <Skeleton variant="rounded" height={48} width="100%" />
        </div>
      </div>

      <div className={styles.actions}>
        <Skeleton variant="rounded" width={200} height={48} />
      </div>
    </div>
  );
};
