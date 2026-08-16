import React from 'react';
import { Button } from '@/components/ui/Button';
import { Check, ArrowLeft, Calendar, Users, Sparkles } from 'lucide-react';
import styles from './CustomOrderSteps.module.css';
import { CustomOrderData } from '../types';

interface Props {
  data: CustomOrderData;
  onBack: () => void;
  onSubmit: () => void;
}

export const CustomOrderStep2: React.FC<Props> = ({ data, onBack, onSubmit }) => {
  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Review Your Request</h2>
      <p className={styles.stepDescription}>
        Almost there! Please review your inspiration details before we submit the request.
      </p>

      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <Sparkles className={styles.summaryIcon} size={24} />
          <h3>{data.design instanceof File ? data.design.name : 'Custom Order Request'}</h3>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.itemLabel}>
              <Calendar size={16} /> Target Date
            </div>
            <div className={styles.itemValue}>
              {new Date(data.targetDate).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.itemLabel}>DESIGN INSPIRATION</span>
            <div className={styles.itemValue}>
              {data.design instanceof File ? (
                <img src={URL.createObjectURL(data.design)} alt="Design Inspiration" className={styles.summaryImage} />
              ) : (
                'No image uploaded'
              )}
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={styles.itemLabel}>
              <Users size={16} /> QTY
            </div>
            <div className={styles.itemValue}>{data.quantity}</div>
          </div>
        </div>

        <div className={styles.summaryDescription}>
          <div className={styles.itemLabel}>Occasion Description</div>
          <p className={styles.descriptionText}>{data.occasionDescription}</p>
        </div>
      </div>

      <div className={styles.actionsSplit}>
        <Button 
          variant="outline" 
          size="lg" 
          leftIcon={<ArrowLeft size={18} />}
          onClick={onBack}
        >
          Back to Edit
        </Button>
        <Button 
          variant="primary" 
          size="lg" 
          rightIcon={<Check size={18} />}
          onClick={onSubmit}
        >
          Submit Request
        </Button>
      </div>
    </div>
  );
};
