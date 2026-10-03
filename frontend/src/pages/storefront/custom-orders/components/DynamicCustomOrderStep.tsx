import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  Users,
  Phone,
  Mail,
  Package,
  UploadCloud,
  X,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Check,
} from 'lucide-react';
import { CustomOrderStepDto, CustomOrderFieldDto } from '@/services/api/customOrderService';
import { CustomOrderData } from '../types';
import { CustomOrderSelect } from './CustomOrderSelect';
import styles from './CustomOrderSteps.module.css';

interface DynamicCustomOrderStepProps {
  stepDef: CustomOrderStepDto;
  stepIndex: number;
  totalSteps: number;
  data: CustomOrderData;
  onChange: (updates: Partial<CustomOrderData>) => void;
  onNext: () => void;
  onBack?: () => void;
  mode: 'create' | 'edit';
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStepTitle?: string;
}

export const DynamicCustomOrderStep: React.FC<DynamicCustomOrderStepProps> = ({
  stepDef,
  stepIndex,
  totalSteps,
  data,
  onChange,
  onNext,
  onBack,
  mode,
  isFirstStep,
  isLastStep,
  nextStepTitle,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getFieldValue = (field: CustomOrderFieldDto): any => {
    const fId = field.id;
    const fLabel = field.label.toLowerCase();

    // Customer Name
    if (fId === 'field_name' || fId === 'field_customer_name' || fLabel === 'name' || fLabel.includes('your name') || fLabel.includes('full name')) {
      return data.customerName || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Occasion
    if (fId === 'field_occasion' || fLabel.includes('occasion') || fLabel.includes('event type')) {
      return data.occasion || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Quantity
    if (fId === 'field_quantity' || fId.includes('quantity') || fId.includes('qty') || fLabel.includes('quantity') || fLabel.includes('qty') || fLabel.includes('units') || fLabel.includes('pops') || (field.type === 'number' && !fLabel.includes('budget') && !fLabel.includes('price'))) {
      return data.quantity || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Target Date
    if (field.type === 'date' || fId === 'field_date' || fId.includes('date') || fLabel.includes('date') || fLabel.includes('by') || fLabel.includes('when') || fLabel.includes('needed') || fLabel.includes('target')) {
      return data.targetDate || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Email / Mail
    if (field.type === 'email' || fId === 'field_email' || fLabel.includes('email') || fLabel.includes('mail')) {
      return data.customerEmail || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Mobile / Phone
    if (field.type === 'phone' || fId === 'field_phone' || fId === 'field_mobile' || fLabel.includes('phone') || fLabel.includes('mobile')) {
      return data.mobileNumber || data.customerPhone || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Notes / Description
    if (field.type === 'textarea' || fId === 'field_description' || fLabel.includes('description') || fLabel.includes('special request') || fLabel.includes('requirement') || fLabel.includes('notes') || fLabel.includes('details')) {
      return data.occasionDescription || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Budget
    if (fId === 'field_budget' || fLabel.includes('budget')) {
      return data.budget || (data.customizationDetails && (data.customizationDetails[fId] ?? data.customizationDetails[field.label])) || '';
    }
    // Check customizationDetails by id or label
    if (data.customizationDetails) {
      if (data.customizationDetails[fId] !== undefined) return data.customizationDetails[fId];
      if (data.customizationDetails[field.label] !== undefined) return data.customizationDetails[field.label];
    }
    return '';
  };

  const handleFieldChange = (field: CustomOrderFieldDto, val: any) => {
    const fId = field.id;
    const fLabel = field.label.toLowerCase();

    const existingDetails = data.customizationDetails || {};
    const updatedDetails = {
      ...existingDetails,
      [fId]: val,
      [field.label]: val,
    };

    const updates: Partial<CustomOrderData> = {
      customizationDetails: updatedDetails,
    };

    if (fId === 'field_name' || fId === 'field_customer_name' || fLabel === 'name' || fLabel.includes('your name') || fLabel.includes('full name')) {
      updates.customerName = val;
    }
    if (fId === 'field_occasion' || fLabel.includes('occasion') || fLabel.includes('event type')) {
      updates.occasion = val;
    }
    if (fId === 'field_quantity' || fId.includes('quantity') || fId.includes('qty') || fLabel.includes('quantity') || fLabel.includes('qty') || fLabel.includes('units') || fLabel.includes('pops') || (field.type === 'number' && !fLabel.includes('budget') && !fLabel.includes('price'))) {
      updates.quantity = String(val);
    }
    if (field.type === 'date' || fId === 'field_date' || fId.includes('date') || fLabel.includes('date') || fLabel.includes('by') || fLabel.includes('when') || fLabel.includes('needed') || fLabel.includes('target')) {
      updates.targetDate = val;
    }
    if (field.type === 'email' || fId === 'field_email' || fLabel.includes('email') || fLabel.includes('mail')) {
      updates.customerEmail = val;
    }
    if (field.type === 'phone' || fId === 'field_phone' || fId === 'field_mobile' || fLabel.includes('phone') || fLabel.includes('mobile')) {
      updates.mobileNumber = val;
      updates.customerPhone = val;
    }
    if (field.type === 'textarea' || fId === 'field_description' || fLabel.includes('description') || fLabel.includes('special request') || fLabel.includes('requirement') || fLabel.includes('notes') || fLabel.includes('details')) {
      updates.occasionDescription = val;
    }
    if (fId === 'field_budget' || fLabel.includes('budget')) {
      updates.budget = String(val);
    }

    onChange(updates);

    if (errors[fId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fId];
        return copy;
      });
    }
  };

  const handleMultiSelectToggle = (field: CustomOrderFieldDto, optValue: string) => {
    const currentVal: string[] = Array.isArray(getFieldValue(field))
      ? getFieldValue(field)
      : typeof getFieldValue(field) === 'string' && getFieldValue(field).length > 0
        ? String(getFieldValue(field)).split(',').map((s) => s.trim())
        : [];

    const nextVal = currentVal.includes(optValue)
      ? currentVal.filter((v) => v !== optValue)
      : [...currentVal, optValue];

    handleFieldChange(field, nextVal);
  };

  const handleFileChange = (file: File, field?: CustomOrderFieldDto) => {
    if (file.size > 5 * 1024 * 1024) {
      if (field) {
        setErrors((prev) => ({
          ...prev,
          [field.id]: 'File size exceeds 5MB limit. Please choose a smaller file.',
        }));
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = (reader.result as string) || '';
      const existing = data.customizationDetails || {};
      const updatedDetails: Record<string, any> = {
        ...existing,
        referenceImage: file.name,
      };
      if (field) {
        updatedDetails[field.id] = file.name;
        updatedDetails[field.label] = file.name;
      }
      onChange({
        design: file,
        designPreviewUrl: resultStr,
        designImage: resultStr,
        customizationDetails: updatedDetails,
      });
      if (field && errors[field.id]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[field.id];
          return copy;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      design: null,
      designImage: undefined,
      designPreviewUrl: undefined,
    });
  };

  const handleValidateAndNext = () => {
    const newErrors: Record<string, string> = {};
    for (const field of stepDef.fields || []) {
      if (field.required) {
        if (field.type === 'file' || field.type === 'image') {
          const hasImage = Boolean(data.design || data.designImage || data.designPreviewUrl);
          if (!hasImage) {
            newErrors[field.id] = `${field.label} is required`;
          }
        } else {
          const val = getFieldValue(field);
          if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0)) {
            newErrors[field.id] = `${field.label} is required`;
          }
        }
      }

      // Format validations for email & phone
      const val = getFieldValue(field);
      if (field.type === 'email' && typeof val === 'string' && val.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }
      if (field.type === 'phone' && typeof val === 'string' && val.trim() !== '') {
        const digits = val.replace(/\D/g, '');
        if (digits.length < 7) {
          newErrors[field.id] = 'Please enter a valid mobile number';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  const previewSrc =
    data.designPreviewUrl ||
    data.designImage ||
    (typeof data.design === 'string' && data.design.trim().length > 0 ? data.design : null) ||
    (data.product?.image ? data.product.image : null);

  const fields = stepDef.fields || [];

  return (
    <div className={styles.stepContainer}>
      {/* Step Header */}
      <div>
        <h2 className={styles.stepTitle}>
          {mode === 'edit' ? `Edit Step ${stepIndex + 1}: ${stepDef.title}` : stepDef.title}
        </h2>
        {stepDef.description && (
          <p className={styles.stepDescription}>{stepDef.description}</p>
        )}
      </div>

      {/* Linked Product Context Banner (on first step if product is linked) */}
      {isFirstStep && data.product && (
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
                onChange({ product: null, productId: undefined });
              }}
              className={styles.baseProductClearBtn}
              title="Remove linked base product"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      )}

      {/* Dynamic Fields List */}
      <div className={styles.formGrid}>
        {fields.map((field) => {
          const val = getFieldValue(field);
          const hasError = Boolean(errors[field.id]);

          return (
            <div key={field.id} className={styles.inputWrapper}>
              <label className={styles.label}>
                {field.label}
                {field.required && <span className={styles.reqStar}> *</span>}
              </label>

              {/* Text Input */}
              {field.type === 'text' && (
                <Input
                  type={field.id.includes('phone') || field.label.toLowerCase().includes('phone') || field.label.toLowerCase().includes('mobile') ? 'tel' : 'text'}
                  placeholder={
                    field.placeholder ||
                    (field.id.includes('phone') || field.label.toLowerCase().includes('phone') || field.label.toLowerCase().includes('mobile')
                      ? '+91 98765 43210'
                      : `Enter ${field.label.toLowerCase()}...`)
                  }
                  leftIcon={
                    field.id.includes('phone') || field.label.toLowerCase().includes('phone') || field.label.toLowerCase().includes('mobile') ? (
                      <Phone size={18} />
                    ) : undefined
                  }
                  value={val}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  error={errors[field.id]}
                  fullWidth
                />
              )}

              {/* Email Address Input */}
              {field.type === 'email' && (
                <Input
                  type="email"
                  placeholder={field.placeholder || 'e.g. yourname@example.com'}
                  leftIcon={<Mail size={18} />}
                  value={val}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  error={errors[field.id]}
                  fullWidth
                />
              )}

              {/* Mobile / Phone Number Input */}
              {field.type === 'phone' && (
                <Input
                  type="tel"
                  placeholder={field.placeholder || '+91 98765 43210'}
                  leftIcon={<Phone size={18} />}
                  value={val}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  error={errors[field.id]}
                  fullWidth
                />
              )}

              {/* Number Input */}
              {field.type === 'number' && (
                <Input
                  type="number"
                  min="1"
                  placeholder={
                    field.placeholder ||
                    (field.label.toLowerCase().includes('quantity') || field.label.toLowerCase().includes('count')
                      ? 'e.g. 12'
                      : `Enter ${field.label.toLowerCase()}...`)
                  }
                  leftIcon={<Users size={18} />}
                  value={val}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  error={errors[field.id]}
                  fullWidth
                />
              )}

              {/* Date Input */}
              {field.type === 'date' && (
                <Input
                  type="date"
                  placeholder={field.placeholder || 'Select date'}
                  min={new Date().toISOString().split('T')[0]}
                  leftIcon={<Calendar size={18} />}
                  value={val}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  error={errors[field.id]}
                  fullWidth
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <>
                  <textarea
                    className={`${styles.textarea} ${hasError ? styles.error : ''}`}
                    placeholder={
                      field.placeholder && !/^\+?[0-9\s()-]+$/.test(field.placeholder)
                        ? field.placeholder
                        : 'Describe the occasion, colors, themes, flavors, or special design notes...'
                    }
                    rows={3}
                    value={val}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    spellCheck={false}
                  />
                  {hasError && <span className={styles.errorMessage}>{errors[field.id]}</span>}
                </>
              )}

              {/* Dropdown Select */}
              {field.type === 'dropdown' && (
                <>
                  <CustomOrderSelect
                    options={field.options || []}
                    value={val || ''}
                    placeholder={field.placeholder || `Select ${field.label}...`}
                    onChange={(newVal) => handleFieldChange(field, newVal)}
                    error={hasError}
                  />
                  {hasError && <span className={styles.errorMessage}>{errors[field.id]}</span>}
                </>
              )}

              {/* Radio Group */}
              {field.type === 'radio' && (
                <>
                  <div className={styles.optionsPillGroup}>
                    {field.options?.map((opt, i) => {
                      const isSelected = val === opt.value;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`${styles.optionPill} ${isSelected ? styles.optionPillActive : ''}`}
                          onClick={() => handleFieldChange(field, opt.value)}
                        >
                          {isSelected && <Check size={13} />}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {hasError && <span className={styles.errorMessage}>{errors[field.id]}</span>}
                </>
              )}

              {/* Checkbox */}
              {field.type === 'checkbox' && (
                <label className={styles.checkboxCard}>
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => handleFieldChange(field, e.target.checked)}
                  />
                  <span>{field.label}</span>
                </label>
              )}

              {/* Multi-Select Tags */}
              {field.type === 'multiselect' && (
                <>
                  <div className={styles.optionsPillGroup}>
                    {field.options?.map((opt, i) => {
                      const isSelected = Array.isArray(val)
                        ? val.includes(opt.value)
                        : typeof val === 'string' && val.includes(opt.value);
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`${styles.optionPill} ${isSelected ? styles.optionPillActive : ''}`}
                          onClick={() => handleMultiSelectToggle(field, opt.value)}
                        >
                          {isSelected && <Check size={13} />}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {hasError && <span className={styles.errorMessage}>{errors[field.id]}</span>}
                </>
              )}

              {/* File / Image Upload */}
              {(field.type === 'file' || field.type === 'image') && (
                <>
                  <div
                    className={`${styles.fileUploadBox} ${previewSrc ? styles.hasImage : ''} ${hasError ? styles.error : ''}`}
                    onClick={() => document.getElementById(`upload-${field.id}`)?.click()}
                  >
                    {previewSrc ? (
                      <div className={styles.filePreview}>
                        <img src={previewSrc} alt="Preview" className={styles.previewImage} />
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
                        <span className={styles.uploadSubtext}>PNG, JPG, WebP up to 10MB</span>
                      </div>
                    )}
                    <input
                      id={`upload-${field.id}`}
                      type="file"
                      accept="image/*"
                      className={styles.hiddenInput}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0], field);
                        }
                      }}
                    />
                  </div>
                  {hasError && <span className={styles.errorMessage}>{errors[field.id]}</span>}
                </>
              )}

              {/* WhatsApp Chat Banner */}
              {field.type === 'whatsapp_chat' && (
                <div className={styles.whatsAppBanner}>
                  <div className={styles.whatsAppBannerLeft}>
                    <span className={styles.whatsAppBannerTitle}>
                      <MessageCircle size={15} /> WhatsApp Direct Help
                    </span>
                    <span className={styles.whatsAppBannerSub}>
                      {field.whatsappMessage || 'Chat with our designers for instant assistance.'}
                    </span>
                  </div>
                  {field.whatsappNumber && (
                    <a
                      href={`https://wa.me/${field.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(field.whatsappMessage || 'Hello CakePopRush!')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsAppBtn}
                    >
                      <MessageCircle size={14} /> Chat
                    </a>
                  )}
                </div>
              )}

              {/* Help Text */}
              {field.helpText && <span className={styles.helpText}>{field.helpText}</span>}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className={isFirstStep ? styles.actions : styles.actionsSplit}>
        {!isFirstStep && onBack && (
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<ArrowLeft size={18} />}
            onClick={onBack}
          >
            Back
          </Button>
        )}

        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight size={18} />}
          onClick={handleValidateAndNext}
          className={styles.nextBtn}
        >
          {isLastStep
            ? mode === 'edit'
              ? 'Review Changes'
              : 'Next: Review Summary'
            : nextStepTitle
              ? `Next: ${nextStepTitle}`
              : 'Next Step'}
        </Button>
      </div>
    </div>
  );
};
