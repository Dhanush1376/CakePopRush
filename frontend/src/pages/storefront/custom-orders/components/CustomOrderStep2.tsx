import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  Check,
  ArrowLeft,
  Calendar,
  Users,
  Phone,
  Package,
  Save,
  PartyPopper,
  Coins,
  Sliders,
  Mail,
  User,
  Image as ImageIcon,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import styles from './CustomOrderSteps.module.css';
import { CustomOrderData } from '../types';
import { CustomOrderStepDto, CustomOrderFieldDto } from '@/services/api/customOrderService';

interface Props {
  data: CustomOrderData;
  steps?: CustomOrderStepDto[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

export const CustomOrderStep2: React.FC<Props> = ({
  data,
  steps,
  onBack,
  onSubmit,
  isSubmitting,
  mode = 'create'
}) => {
  const isEdit = mode === 'edit';

  // Resolve preview image URL
  const previewSrc = data.designPreviewUrl || (
    data.design instanceof File
      ? URL.createObjectURL(data.design)
      : typeof data.design === 'string' && data.design.trim().length > 0
        ? data.design
        : null
  );

  // Helper to retrieve the actual user-entered value for any dynamic field
  const getFieldValue = (field: CustomOrderFieldDto): any => {
    const fId = field.id;
    const fLabel = field.label.toLowerCase();

    // Check direct values in customizationDetails
    if (data.customizationDetails) {
      if (data.customizationDetails[fId] !== undefined && data.customizationDetails[fId] !== '') {
        return data.customizationDetails[fId];
      }
      if (data.customizationDetails[field.label] !== undefined && data.customizationDetails[field.label] !== '') {
        return data.customizationDetails[field.label];
      }
    }

    // File / Image
    if (field.type === 'file' || field.type === 'image' || fLabel.includes('upload') || fLabel.includes('inspiration')) {
      return previewSrc;
    }

    // Date
    if (field.type === 'date' || fId.includes('date') || fLabel.includes('date') || fLabel.includes('by') || fLabel.includes('when') || fLabel.includes('needed')) {
      return data.targetDate;
    }

    // Quantity
    if (fId.includes('quantity') || fId.includes('qty') || fLabel.includes('quantity') || fLabel.includes('qty') || (field.type === 'number' && !fLabel.includes('budget'))) {
      return data.quantity;
    }

    // Description / textarea
    if (field.type === 'textarea' || fId.includes('description') || fLabel.includes('description') || fLabel.includes('requirement')) {
      return data.occasionDescription;
    }

    // Phone / Mobile
    if (field.type === 'phone' || fId.includes('phone') || fId.includes('mobile') || fLabel.includes('phone') || fLabel.includes('mobile')) {
      return data.mobileNumber || data.customerPhone;
    }

    // Email
    if (field.type === 'email' || fId.includes('email') || fLabel.includes('email') || fLabel.includes('mail')) {
      return data.customerEmail;
    }

    // Customer Name
    if (fLabel.includes('name')) {
      return data.customerName;
    }

    // Occasion
    if (fLabel.includes('occasion')) {
      return data.occasion;
    }

    // Budget
    if (fLabel.includes('budget')) {
      return data.budget;
    }

    return '';
  };

  // Helper to pick a suitable icon for any field type/label
  const getFieldIcon = (field: CustomOrderFieldDto) => {
    const fLabel = field.label.toLowerCase();
    if (field.type === 'date' || fLabel.includes('date') || fLabel.includes('by') || fLabel.includes('when')) {
      return <Calendar size={15} />;
    }
    if (field.type === 'phone' || fLabel.includes('phone') || fLabel.includes('mobile')) {
      return <Phone size={15} />;
    }
    if (field.type === 'email' || fLabel.includes('email') || fLabel.includes('mail')) {
      return <Mail size={15} />;
    }
    if (fLabel.includes('name')) {
      return <User size={15} />;
    }
    if (field.type === 'number' || fLabel.includes('quantity') || fLabel.includes('qty') || fLabel.includes('pops')) {
      return <Users size={15} />;
    }
    if (field.type === 'multiselect' || field.type === 'dropdown' || field.type === 'radio') {
      return <Layers size={15} />;
    }
    return <Sliders size={15} />;
  };

  // Format any scalar value for clean display
  const formatFieldValue = (field: CustomOrderFieldDto, val: any) => {
    if (val === null || val === undefined || val === '') {
      return <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Not specified</span>;
    }

    if (field.type === 'date' || field.label.toLowerCase().includes('date') || field.label.toLowerCase().includes('by')) {
      try {
        const parsed = new Date(val);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      } catch {
        // Fallback to raw string
      }
      return String(val);
    }

    if (field.type === 'number' || field.label.toLowerCase().includes('quantity') || field.label.toLowerCase().includes('qty')) {
      return `${val} units`;
    }

    if (Array.isArray(val)) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
          {val.map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: '#FFF0F5',
                color: 'var(--admin-pink, #F20D6F)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(242, 13, 111, 0.16)',
              }}
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    return String(val);
  };

  // Check if dynamic steps are active
  const hasDynamicSteps = Boolean(steps && steps.length > 0);

  // Collect all fields from all steps
  const allDynamicFields = hasDynamicSteps
    ? (steps || []).flatMap((s) => s.fields || [])
    : [];

  // Separate file/image fields, textarea fields, and regular fields
  const fileFields = allDynamicFields.filter(
    (f) => f.type === 'file' || f.type === 'image' || f.label.toLowerCase().includes('inspiration') || f.label.toLowerCase().includes('upload')
  );
  const textareaFields = allDynamicFields.filter(
    (f) => f.type === 'textarea'
  );
  const standardFields = allDynamicFields.filter(
    (f) => f.type !== 'file' && f.type !== 'image' && f.type !== 'textarea' && !f.label.toLowerCase().includes('inspiration') && !f.label.toLowerCase().includes('upload')
  );

  return (
    <div className={styles.stepContainer}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h3>{isEdit ? 'Review & Update Request' : 'Request Summary'}</h3>
        </div>

        {/* Base Product Card if linked */}
        {data.product && (
          <div className={styles.baseProductBanner} style={{ marginBottom: '16px' }}>
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
                {(data.product.flavor || data.product.categoryName || data.product.category) && (
                  <span className={styles.baseProductCategory}>
                    {data.product.flavor || data.product.categoryName || data.product.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC RENDERING (When form has published steps) */}
        {hasDynamicSteps ? (
          <div className={styles.summaryGrid}>
            {/* Standard Grid Fields */}
            {standardFields.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px 24px',
                }}
              >
                {standardFields.map((field) => {
                  const val = getFieldValue(field);
                  return (
                    <div key={field.id} className={styles.summaryItem}>
                      <div className={styles.itemLabel}>
                        {getFieldIcon(field)}
                        <span>{field.label}</span>
                      </div>
                      <div className={styles.itemValue}>
                        {formatFieldValue(field, val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contact Information Row (if not already captured in standard fields) */}
            {(data.customerName || data.customerEmail || data.mobileNumber) &&
              !standardFields.some((f) => f.label.toLowerCase().includes('name') && f.label.toLowerCase().includes('email')) && (
                <>
                  <div className={styles.dottedDivider}></div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px 24px',
                    }}
                  >
                    {data.customerName && (
                      <div className={styles.summaryItem}>
                        <div className={styles.itemLabel}>
                          <User size={15} /> Contact Name
                        </div>
                        <div className={styles.itemValue}>{data.customerName}</div>
                      </div>
                    )}
                    {data.customerEmail && (
                      <div className={styles.summaryItem}>
                        <div className={styles.itemLabel}>
                          <Mail size={15} /> Contact Email
                        </div>
                        <div className={styles.itemValue}>{data.customerEmail}</div>
                      </div>
                    )}
                    {data.mobileNumber && !standardFields.some((f) => f.type === 'phone' || f.label.toLowerCase().includes('mobile') || f.label.toLowerCase().includes('phone')) && (
                      <div className={styles.summaryItem}>
                        <div className={styles.itemLabel}>
                          <Phone size={15} /> Mobile Number
                        </div>
                        <div className={styles.itemValue}>{data.mobileNumber}</div>
                      </div>
                    )}
                  </div>
                </>
              )}

            {/* File / Inspiration Image Uploads */}
            {(fileFields.length > 0 || previewSrc) && (
              <>
                <div className={styles.dottedDivider}></div>
                <div className={styles.summaryItem}>
                  <div className={styles.itemLabel}>
                    <ImageIcon size={15} />
                    <span>{fileFields[0]?.label || 'Design Inspiration / Reference'}</span>
                  </div>
                  <div className={styles.itemValue} style={{ marginTop: '8px' }}>
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt="Design Inspiration"
                        className={styles.summaryImage}
                      />
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                        No reference image uploaded
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Textarea Requirements Fields */}
            {textareaFields.map((field) => {
              const val = getFieldValue(field);
              return (
                <React.Fragment key={field.id}>
                  <div className={styles.dottedDivider}></div>
                  <div className={styles.summaryDescription}>
                    <div className={styles.itemLabel}>
                      <FileText size={15} />
                      <span>{field.label}</span>
                    </div>
                    <p className={styles.descriptionText}>
                      {val || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No details provided.</span>}
                    </p>
                  </div>
                </React.Fragment>
              );
            })}

            {/* If no textarea field was in the form, but occasionDescription has user content */}
            {textareaFields.length === 0 && Boolean(data.occasionDescription?.trim()) && (
              <>
                <div className={styles.dottedDivider}></div>
                <div className={styles.summaryDescription}>
                  <div className={styles.itemLabel}>
                    <FileText size={15} />
                    <span>Occasion & Custom Requirements</span>
                  </div>
                  <p className={styles.descriptionText}>{data.occasionDescription}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* FALLBACK RENDERING (When no dynamic steps are provided) */
          <div className={styles.summaryGrid}>
            <div className={styles.summaryRow}>
              {Boolean(data.occasion?.trim()) && (
                <div className={styles.summaryItem}>
                  <div className={styles.itemLabel}>
                    <PartyPopper size={16} /> Occasion
                  </div>
                  <div className={styles.itemValue} style={{ textTransform: 'capitalize' }}>
                    {data.occasion?.replace(/_/g, ' ')}
                  </div>
                </div>
              )}

              <div className={styles.summaryItem}>
                <div className={styles.itemLabel}>
                  <Calendar size={16} /> Target Date
                </div>
                <div className={styles.itemValue}>
                  {data.targetDate ? (
                    new Date(data.targetDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Not specified</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.summaryRow} style={{ marginTop: '12px' }}>
              <div className={styles.summaryItem}>
                <div className={styles.itemLabel}>
                  <Users size={16} /> Quantity
                </div>
                <div className={styles.itemValue}>{data.quantity} units</div>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.itemLabel}>
                  <Phone size={16} /> Contact Mobile Number
                </div>
                <div className={styles.itemValue}>{data.mobileNumber || 'Not specified'}</div>
              </div>
            </div>

            {(data.customerName || data.customerEmail || data.budget) && (
              <div className={styles.summaryRow} style={{ marginTop: '12px' }}>
                {data.customerName && (
                  <div className={styles.summaryItem}>
                    <div className={styles.itemLabel}>
                      <User size={16} /> Contact Name
                    </div>
                    <div className={styles.itemValue}>{data.customerName}</div>
                  </div>
                )}
                {data.customerEmail && (
                  <div className={styles.summaryItem}>
                    <div className={styles.itemLabel}>
                      <Mail size={16} /> Contact Email
                    </div>
                    <div className={styles.itemValue}>{data.customerEmail}</div>
                  </div>
                )}
                {data.budget && (
                  <div className={styles.summaryItem}>
                    <div className={styles.itemLabel}>
                      <Coins size={16} /> Estimated Budget
                    </div>
                    <div className={styles.itemValue}>₹{data.budget}</div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.dottedDivider}></div>

            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Design Inspiration / Reference</span>
              <div className={styles.itemValue}>
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Design Inspiration"
                    className={styles.summaryImage}
                  />
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>No reference image uploaded</span>
                )}
              </div>
            </div>

            <div className={styles.dottedDivider}></div>

            <div className={styles.summaryDescription}>
              <div className={styles.itemLabel}>Occasion & Custom Requirements</div>
              <p className={styles.descriptionText}>{data.occasionDescription || 'No requirements specified.'}</p>
            </div>
          </div>
        )}

        {/* Any extra specifications in customizationDetails not mapped to a known field */}
        {data.customizationDetails &&
          Object.entries(data.customizationDetails).filter(([k, v]) => {
            if (!v || k.startsWith('field_') || k === 'referenceImage') return false;
            // Filter out fields that are already rendered by name
            if (hasDynamicSteps && allDynamicFields.some((f) => f.label === k || f.id === k)) return false;
            return true;
          }).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div className={styles.dottedDivider} style={{ marginBottom: '16px' }}></div>
              <div className={styles.itemLabel} style={{ marginBottom: '10px' }}>
                <Sliders size={14} /> Additional Specifications
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px',
                }}
              >
                {Object.entries(data.customizationDetails)
                  .filter(([k, v]) => {
                    if (!v || k.startsWith('field_') || k === 'referenceImage') return false;
                    if (hasDynamicSteps && allDynamicFields.some((f) => f.label === k || f.id === k)) return false;
                    return true;
                  })
                  .map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        background: '#FAF7F5',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(56, 30, 16, 0.08)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#8E7A6E',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          marginBottom: '3px',
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#381E10',
                        }}
                      >
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>

      <div className={styles.actionsSplit}>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back to Edit
        </Button>
        <Button
          variant="primary"
          rightIcon={isEdit ? <Save size={16} /> : <Check size={16} />}
          onClick={onSubmit}
          isLoading={isSubmitting}
        >
          {isEdit ? 'Save Changes' : 'Submit Request'}
        </Button>
      </div>
    </div>
  );
};


