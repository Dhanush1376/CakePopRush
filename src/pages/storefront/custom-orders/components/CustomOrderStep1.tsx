import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Calendar, Users, UploadCloud, Phone } from 'lucide-react';
import styles from './CustomOrderSteps.module.css';
import { CustomOrderData } from '../types';

interface Props {
  initialData: CustomOrderData;
  onNext: (data: CustomOrderData) => void;
}

export const CustomOrderStep1: React.FC<Props> = ({ initialData, onNext }) => {
  const [data, setData] = useState<CustomOrderData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomOrderData, string>>>({});

  const handleChange = (field: keyof CustomOrderData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    const newErrors: Partial<Record<keyof CustomOrderData, string>> = {};
    if (!data.design) newErrors.design = 'Design image is required';
    if (!data.occasionDescription.trim()) newErrors.occasionDescription = 'Occasion Description is required';
    if (!data.targetDate) newErrors.targetDate = 'Target Date is required';
    if (!data.quantity || parseInt(data.quantity) < 1) newErrors.quantity = 'Quantity is required';
    if (!data.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile Number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(data);
  };

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Tell Us Your Vision</h2>
      <p className={styles.stepDescription}>
        Share your ideas, and we'll handcraft the perfect cake pops for your special occasion.
      </p>

      <div className={styles.formGrid}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>DESIGN INSPIRATION</label>
          <div 
            className={`${styles.fileUploadBox} ${data.design ? styles.hasImage : ''} ${errors.design ? styles.error : ''}`} 
            onClick={() => document.getElementById('design-upload')?.click()}
          >
            {data.design instanceof File ? (
              <div className={styles.filePreview}>
                <img src={URL.createObjectURL(data.design)} alt="Design preview" className={styles.previewImage} />
                <span className={styles.changeFileText}>Click to change image</span>
              </div>
            ) : (
              <div className={styles.filePlaceholder}>
                <UploadCloud size={24} className={styles.uploadIcon} />
                <span>Click to upload image</span>
                <span className={styles.uploadSubtext}>PNG, JPG up to 5MB</span>
              </div>
            )}
            <input 
              id="design-upload" 
              type="file" 
              accept="image/*" 
              className={styles.hiddenInput} 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleChange('design', e.target.files[0]);
                }
              }}
            />
          </div>
          {errors.design && <span className={styles.errorMessage}>{errors.design}</span>}
        </div>

        <div className={styles.inputWrapper}>
          <label className={styles.label}>OCCASION DESCRIPTION</label>
          <textarea
            className={`${styles.textarea} ${errors.occasionDescription ? styles.error : ''}`}
            placeholder="Describe the occasion..."
            rows={3}
            value={data.occasionDescription}
            onChange={(e) => handleChange('occasionDescription', e.target.value)}
            spellCheck={false}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
          />
          {errors.occasionDescription && <span className={styles.errorMessage}>{errors.occasionDescription}</span>}
        </div>

        <div className={styles.row}>
          <Input
            label="TARGET DATE"
            type="date"
            leftIcon={<Calendar size={18} />}
            value={data.targetDate}
            onChange={(e) => handleChange('targetDate', e.target.value)}
            error={errors.targetDate}
            fullWidth
          />
          
          <Input
            label="QTY"
            type="number"
            min="1"
            leftIcon={<Users size={18} />}
            value={data.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            error={errors.quantity}
            fullWidth
          />
        </div>
        
        <div className={styles.inputWrapper}>
          <Input
            label="MOBILE NUMBER"
            type="tel"
            placeholder="e.g. +1 234 567 8900"
            leftIcon={<Phone size={18} />}
            value={data.mobileNumber}
            onChange={(e) => handleChange('mobileNumber', e.target.value)}
            error={errors.mobileNumber}
            fullWidth
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button 
          variant="primary" 
          size="lg" 
          rightIcon={<ArrowRight size={18} />}
          onClick={handleNext}
          className={styles.nextBtn}
        >
          Next: Review Summary
        </Button>
      </div>
    </div>
  );
};
