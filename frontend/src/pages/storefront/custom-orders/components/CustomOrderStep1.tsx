import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Calendar, Users, UploadCloud, Phone, Package, X, PartyPopper } from 'lucide-react';
import styles from './CustomOrderSteps.module.css';
import { CustomOrderData } from '../types';
import { CustomOrderSelect } from './CustomOrderSelect';

interface Props {
  initialData: CustomOrderData;
  onNext: (data: CustomOrderData) => void;
  mode?: 'create' | 'edit';
}

const OCCASION_OPTIONS = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'holiday', label: 'Holiday Celebration' },
  { value: 'other', label: 'Other / Custom' },
];

export const CustomOrderStep1: React.FC<Props> = ({ initialData, onNext, mode = 'create' }) => {
  const [data, setData] = useState<CustomOrderData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomOrderData, string>>>({});

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof CustomOrderData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, design: 'File size exceeds 5MB limit. Please choose a smaller image.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setData(prev => ({
        ...prev,
        design: file,
        designImage: reader.result as string,
        designPreviewUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
    if (errors.design) {
      setErrors(prev => ({ ...prev, design: undefined }));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setData(prev => ({
      ...prev,
      design: null,
      designImage: '',
      designPreviewUrl: '',
    }));
  };

  const handleNext = () => {
    const newErrors: Partial<Record<keyof CustomOrderData, string>> = {};
    if (!data.occasionDescription || !data.occasionDescription.trim()) {
      newErrors.occasionDescription = 'Occasion Description is required';
    } else if (data.occasionDescription.trim().length < 3) {
      newErrors.occasionDescription = 'Description must be at least 3 characters';
    }
    if (!data.targetDate) {
      newErrors.targetDate = 'Target Date is required';
    }
    if (!data.quantity || parseInt(data.quantity, 10) < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (!data.mobileNumber || !data.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(data);
  };

  const previewSrc =
    data.designPreviewUrl ||
    data.designImage ||
    (typeof data.design === 'string' && data.design.trim().length > 0 ? data.design : null) ||
    (data.product?.image ? data.product.image : null);

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>
        {mode === 'edit' ? `Edit Request #${data.orderId || ''}` : 'Tell Us Your Vision'}
      </h2>
      <p className={styles.stepDescription}>
        {mode === 'edit'
          ? 'Update your customization requirements and target details below.'
          : "Share your ideas, and we'll handcraft the perfect cake pops for your special occasion."}
      </p>

      {/* Linked Product Context Banner */}
      {data.product && (
        <div className={styles.baseProductBanner}>
          <div className={styles.baseProductContent}>
            <div className={styles.baseProductImageWrap}>
              {data.product.image ? (
                <img
                  src={data.product.image}
                  alt={data.product.name}
                  className={styles.baseProductImage}
                />
              ) : (
                <div className={styles.baseProductFallbackIcon}>
                  <Package size={22} />
                </div>
              )}
            </div>

            <div className={styles.baseProductInfo}>
              <div className={styles.baseProductBadge}>
                <span>Based on</span>
              </div>
              <h4 className={styles.baseProductName}>{data.product.name}</h4>
              {data.product.categoryName && (
                <span className={styles.baseProductCategory}>
                  {data.product.categoryName}
                </span>
              )}
            </div>
          </div>

          {mode !== 'edit' && (
            <button
              type="button"
              onClick={() => {
                setData(prev => ({ ...prev, product: null, productId: undefined }));
              }}
              className={styles.baseProductClearBtn}
              title="Remove linked base product"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      )}

      <div className={styles.formGrid}>
        {/* Occasion Selector */}
        <div className={styles.inputWrapper}>
          <label className={styles.label}>
            <PartyPopper size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            OCCASION / CELEBRATION TYPE
          </label>
          <CustomOrderSelect
            options={OCCASION_OPTIONS}
            value={data.occasion || 'birthday'}
            placeholder="Select occasion..."
            onChange={(val) => handleChange('occasion', val)}
            error={Boolean(errors.occasion)}
            allowClear={false}
          />
        </div>

        {/* Design Inspiration Upload */}
        <div className={styles.inputWrapper}>
          <label className={styles.label}>DESIGN INSPIRATION / REFERENCE IMAGE</label>
          <div
            className={`${styles.fileUploadBox} ${previewSrc ? styles.hasImage : ''} ${errors.design ? styles.error : ''}`}
            onClick={() => document.getElementById('design-upload')?.click()}
          >
            {previewSrc ? (
              <div className={styles.filePreview}>
                <img src={previewSrc} alt="Design preview" className={styles.previewImage} />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={handleRemoveImage}
                  title="Remove reference image"
                >
                  <X size={13} /> Remove
                </button>
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
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
          </div>
          {errors.design && <span className={styles.errorMessage}>{errors.design}</span>}
        </div>

        {/* Occasion Description */}
        <div className={styles.inputWrapper}>
          <label className={styles.label}>OCCASION & CUSTOMIZATION REQUIREMENTS</label>
          <textarea
            className={`${styles.textarea} ${errors.occasionDescription ? styles.error : ''}`}
            placeholder="Describe the occasion, colors, themes, flavors, or special design notes..."
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

        {/* Target Date & Quantity */}
        <div className={styles.row}>
          <Input
            label="TARGET DATE"
            type="date"
            placeholder="Select target date"
            min={new Date().toISOString().split('T')[0]}
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
            placeholder="e.g. 12"
            leftIcon={<Users size={18} />}
            value={data.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            error={errors.quantity}
            fullWidth
          />
        </div>

        {/* Mobile Number */}
        <div className={styles.inputWrapper}>
          <Input
            label="MOBILE NUMBER"
            type="tel"
            placeholder="e.g. +91 98765 43210"
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
          {mode === 'edit' ? 'Review Changes' : 'Next: Review Summary'}
        </Button>
      </div>
    </div>
  );
};

