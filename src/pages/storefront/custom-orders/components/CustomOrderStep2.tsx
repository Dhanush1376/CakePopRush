import React from 'react';
import { Button } from '@/components/ui/Button';
import { Check, ArrowLeft, Calendar, Users, Sparkles, Phone } from 'lucide-react';
import styles from './CustomOrderSteps.module.css';
import { CustomOrderData } from '../types';

interface Props {
  data: CustomOrderData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const CustomOrderStep2: React.FC<Props> = ({ data, onBack, onSubmit, isSubmitting }) => {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h3>Request Summary</h3>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryRow}>
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
              <div className={styles.itemLabel}>
                <Users size={16} /> QTY
              </div>
              <div className={styles.itemValue}>{data.quantity}</div>
            </div>
          </div>
            
          <div className={styles.summaryItem} style={{ marginTop: '16px' }}>
            <div className={styles.itemLabel}>
              <Phone size={16} /> Mobile Number
            </div>
            <div className={styles.itemValue}>{data.mobileNumber}</div>
          </div>

          <div className={styles.dottedDivider}></div>

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
        </div>

        <div className={styles.dottedDivider}></div>

        <div className={styles.summaryDescription}>
          <div className={styles.itemLabel}>Occasion Description</div>
          <p className={styles.descriptionText}>{data.occasionDescription}</p>
        </div>
      </div>

      <div className={styles.actionsSplit}>
        <Button 
          variant="outline" 
          leftIcon={<ArrowLeft size={16} />}
          onClick={onBack}
        >
          Back to Edit
        </Button>
        <Button 
          variant="primary" 
          rightIcon={<Check size={16} />}
          onClick={onSubmit}
          isLoading={isSubmitting}
        >
          Submit Request
        </Button>
      </div>
    </div>
  );
};
