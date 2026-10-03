import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, Layers, CheckCircle2, ChevronRight, ChevronDown, Cake } from 'lucide-react';
import { CustomOrderTypeDto, CustomOrderStepDto } from '@/services/api/customOrderService';
import styles from './AdminCustomOrderConfig.module.css';

interface CustomOrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeType: CustomOrderTypeDto;
}

export const CustomOrderPreviewModal: React.FC<CustomOrderPreviewModalProps> = ({
  isOpen,
  onClose,
  activeType,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps = activeType.steps || [];
  const currentStep: CustomOrderStepDto | undefined = steps[currentStepIndex];

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <div className={styles.previewBadge}>
              <Eye size={14} /> Storefront Live Preview
            </div>
            <h3 className={styles.modalTitle}>{activeType.name}</h3>
          </div>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose} title="Close Preview">
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        {steps.length > 0 && (
          <div className={styles.previewStepNav}>
            {steps.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`${styles.previewStepNavItem} ${idx === currentStepIndex ? styles.previewStepNavActive : ''}`}
              >
                <span className={styles.previewStepNum}>{idx + 1}</span>
                <span className={styles.previewStepTitle}>{step.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Form Body Preview */}
        <div className={styles.modalBody}>
          {currentStep ? (
            <div className={styles.previewFormContainer}>
              <div className={styles.previewStepIntro}>
                <h4 className={styles.previewStepHeading}>{currentStep.title}</h4>
                {currentStep.description && (
                  <p className={styles.previewStepSub}>{currentStep.description}</p>
                )}
              </div>

              <div className={styles.previewFieldsGrid}>
                {currentStep.fields && currentStep.fields.length > 0 ? (
                  currentStep.fields.map((field) => (
                    <div key={field.id} className={styles.previewFieldGroup}>
                      <label className={styles.previewLabel}>
                        {field.label}
                        {field.required && <span className={styles.reqStar}> *</span>}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          disabled
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          className={styles.previewInput}
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          disabled
                          placeholder={field.placeholder || 'e.g. 12'}
                          className={styles.previewInput}
                        />
                      )}

                      {field.type === 'email' && (
                        <input
                          type="email"
                          disabled
                          placeholder={field.placeholder || 'e.g. yourname@example.com'}
                          className={styles.previewInput}
                        />
                      )}

                      {field.type === 'phone' && (
                        <input
                          type="tel"
                          disabled
                          placeholder={field.placeholder || '+91 98765 43210'}
                          className={styles.previewInput}
                        />
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          disabled
                          className={styles.previewInput}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          disabled
                          rows={3}
                          placeholder={
                            field.placeholder && !/^\+?[0-9\s()-]+$/.test(field.placeholder)
                              ? field.placeholder
                              : 'Describe the occasion, colors, themes, flavors, or special design notes...'
                          }
                          className={styles.previewTextarea}
                        />
                      )}

                      {field.type === 'dropdown' && (
                        <div
                          style={{
                            width: '100%',
                            minHeight: '44px',
                            height: '44px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '100px',
                            padding: '0 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#9CA3AF',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span>Select {field.label}...</span>
                          <ChevronDown size={15} color="#9CA3AF" />
                        </div>
                      )}

                      {field.type === 'radio' && (
                        <div className={styles.previewOptionsGroup}>
                          {field.options && field.options.length > 0 ? (
                            field.options.map((opt, i) => (
                              <label key={i} className={styles.previewOptionLabel}>
                                <input type="radio" disabled name={field.id} defaultChecked={i === 0} />
                                <span>{opt.label}</span>
                              </label>
                            ))
                          ) : (
                            <span className={styles.emptyOptionHint}>No options configured</span>
                          )}
                        </div>
                      )}

                      {field.type === 'checkbox' && (
                        <label className={styles.previewOptionLabel}>
                          <input type="checkbox" disabled />
                          <span>{field.label}</span>
                        </label>
                      )}

                      {field.type === 'multiselect' && (
                        <div className={styles.previewTagsGroup}>
                          {field.options && field.options.length > 0 ? (
                            field.options.map((opt, i) => (
                              <span key={i} className={styles.previewTagPill}>
                                {opt.label}
                              </span>
                            ))
                          ) : (
                            <span className={styles.emptyOptionHint}>No options configured</span>
                          )}
                        </div>
                      )}

                      {(field.type === 'file' || field.type === 'image') && (
                        <div className={styles.previewUploadBox}>
                          <Cake size={24} className={styles.previewUploadIcon} />
                          <span>Drag and drop image or browse</span>
                          <span className={styles.previewUploadSub}>PNG, JPG, WebP up to 10MB</span>
                        </div>
                      )}

                      {field.type === 'whatsapp_chat' && (
                        <div className={styles.previewWhatsAppBox}>
                          <div className={styles.previewWhatsAppHeader}>
                            <span>WhatsApp Direct Help</span>
                            <span className={styles.previewWhatsAppNum}>{field.whatsappNumber || '+91 98765 43210'}</span>
                          </div>
                          <p className={styles.previewWhatsAppMsg}>
                            "{field.whatsappMessage || 'Hi, I need assistance with my custom cake pop order!'}"
                          </p>
                        </div>
                      )}

                      {field.helpText && (
                        <span className={styles.previewHelpText}>{field.helpText}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.previewEmptyStep}>
                    <p>No fields in this step yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.previewEmptyState}>
              <Layers size={32} />
              <p>No steps configured for this order type.</p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.modalPrevBtn}
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          >
            Previous Step
          </button>

          <span className={styles.modalStepTracker}>
            Step {steps.length > 0 ? currentStepIndex + 1 : 0} of {steps.length}
          </span>

          <button
            type="button"
            className={styles.modalNextBtn}
            disabled={currentStepIndex >= steps.length - 1}
            onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
          >
            <span>Next Step</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
