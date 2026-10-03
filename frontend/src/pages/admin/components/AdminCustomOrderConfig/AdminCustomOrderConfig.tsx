import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  Package,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  RotateCcw,
  FileText,
  FileEdit,
  HelpCircle,
  Check,
  Circle,
  SlidersHorizontal,
  ListFilter,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastContext';
import {
  customOrderService,
  CustomOrderConfigDto,
  CustomOrderTypeDto,
  CustomOrderStepDto,
  CustomOrderFieldDto,
} from '@/services/api/customOrderService';
import { PublishConfirmModal } from './PublishConfirmModal';
import { FieldTypeSelect } from './FieldTypeSelect';
import { ConfirmActionModal } from './ConfirmActionModal';
import styles from './AdminCustomOrderConfig.module.css';

const DEFAULT_FALLBACK_CONFIG: CustomOrderConfigDto = {
  version: 1,
  status: 'published',
  types: [
    {
      id: 'general',
      name: 'General Customization',
      description: 'Create a fully tailored custom cake pop order from scratch for special celebrations.',
      icon: 'cake',
      enabled: true,
      steps: [
        {
          id: 'step_occasion',
          title: 'Event & Occasion',
          description: 'Tell us about the celebration and your theme',
          order: 1,
          fields: [
            {
              id: 'field_occasion',
              type: 'dropdown',
              label: 'Occasion',
              required: true,
              order: 1,
              options: [
                { value: 'Birthday', label: 'Birthday Party' },
                { value: 'Wedding', label: 'Wedding / Reception' },
                { value: 'Corporate', label: 'Corporate Event' },
                { value: 'Baby Shower', label: 'Baby Shower' },
                { value: 'Anniversary', label: 'Anniversary' },
                { value: 'Festival', label: 'Festival / Holiday' },
                { value: 'Other', label: 'Other Special Occasion' },
              ],
            },
            {
              id: 'field_theme',
              type: 'text',
              label: 'Event Theme or Color Scheme',
              placeholder: 'e.g. Pastel Pink & Gold, Space, Floral',
              required: false,
              order: 2,
            },
            {
              id: 'field_date',
              type: 'date',
              label: 'Event Date / Needed By',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'step_details',
          title: 'Cake Pop Details',
          description: 'Flavors, quantity, and decorative specifications',
          order: 2,
          fields: [
            {
              id: 'field_quantity',
              type: 'number',
              label: 'Quantity (Pops / Dozens)',
              placeholder: 'e.g. 24',
              required: true,
              order: 1,
            },
            {
              id: 'field_flavors',
              type: 'multiselect',
              label: 'Preferred Flavors',
              required: false,
              order: 2,
              options: [
                { value: 'Chocolate', label: 'Rich Chocolate Truffle' },
                { value: 'Vanilla', label: 'Classic Vanilla Bean' },
                { value: 'Red Velvet', label: 'Velvet Dream' },
                { value: 'Strawberry', label: 'Strawberry Shortcake' },
                { value: 'Salted Caramel', label: 'Salted Caramel Delight' },
                { value: 'Cookies & Cream', label: 'Cookies & Cream' },
              ],
            },
            {
              id: 'field_description',
              type: 'textarea',
              label: 'Design Details & Special Requests',
              placeholder: 'Describe shapes, frosting drizzles, character toppers, or specific requests...',
              required: true,
              order: 3,
            },
            {
              id: 'field_packaging',
              type: 'radio',
              label: 'Packaging Preference',
              required: false,
              order: 4,
              options: [
                { value: 'Individually Wrapped', label: 'Individually wrapped with satin ribbon' },
                { value: 'Display Tower', label: 'Display tower ready for tabletop' },
                { value: 'Standard Bakery Box', label: 'Eco-friendly bakery transport box' },
              ],
            },
          ],
        },
        {
          id: 'step_contact',
          title: 'Photos & Contact',
          description: 'Upload references and provide delivery contact information',
          order: 3,
          fields: [
            {
              id: 'field_ref_image',
              type: 'file',
              label: 'Reference Image / Mood Board',
              required: false,
              order: 1,
            },
            {
              id: 'field_phone',
              type: 'text',
              label: 'Contact Phone Number',
              placeholder: '+91 98765 43210',
              required: true,
              order: 2,
            },
            {
              id: 'field_whatsapp_chat',
              type: 'whatsapp_chat',
              label: 'WhatsApp Quick Consultation',
              whatsappNumber: '+91 98765 43210',
              whatsappMessage: 'Hi CakePopRush, I have a question about my custom cake pop order!',
              required: false,
              order: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'product',
      name: 'Product Customization',
      description: 'Personalize an existing cake pop signature product with custom coatings, sprinkles, and ribbons.',
      icon: 'sparkles',
      enabled: true,
      steps: [
        {
          id: 'step_prod_customization',
          title: 'Custom Elements',
          description: 'Tweak this signature product to match your event theme',
          order: 1,
          fields: [
            {
              id: 'field_coating',
              type: 'dropdown',
              label: 'Chocolate Coating Tint',
              required: false,
              order: 1,
              options: [
                { value: 'Default', label: 'Original Product Coating' },
                { value: 'Pastel Pink', label: 'Pastel Pink Chocolate' },
                { value: 'Baby Blue', label: 'Baby Blue Chocolate' },
                { value: 'Gold Shimmer', label: 'Ivory with Edible Gold Shimmer' },
                { value: 'Dark Ganache', label: 'Dark Velvet Ganache' },
              ],
            },
            {
              id: 'field_toppers',
              type: 'dropdown',
              label: 'Topper & Sprinkles',
              required: false,
              order: 2,
              options: [
                { value: 'Standard', label: 'Standard Signature Sprinkles' },
                { value: 'Sugar Pearls', label: 'Pearlescent Sugar Pearls' },
                { value: 'Custom Edible Monogram', label: 'Custom Edible Monogram / Initial' },
                { value: 'Gold Flakes', label: '24K Edible Gold Leaf Accents' },
              ],
            },
            {
              id: 'field_notes',
              type: 'textarea',
              label: 'Special Customization Notes',
              placeholder: 'Add any specific requirements for this flavor customization...',
              required: false,
              order: 3,
            },
          ],
        },
        {
          id: 'step_prod_event',
          title: 'Quantity & Date',
          description: 'Provide order quantity and desired delivery date',
          order: 2,
          fields: [
            {
              id: 'field_prod_quantity',
              type: 'number',
              label: 'Quantity (Pops)',
              placeholder: 'e.g. 12',
              required: true,
              order: 1,
            },
            {
              id: 'field_prod_date',
              type: 'date',
              label: 'Delivery Date',
              required: true,
              order: 2,
            },
            {
              id: 'field_prod_phone',
              type: 'text',
              label: 'Contact Phone Number',
              placeholder: '+91 98765 43210',
              required: true,
              order: 3,
            },
          ],
        },
      ],
    },
  ],
};

export interface AdminCustomOrderConfigProps {
  currentWorkspace?: 'inquiries' | 'builder';
  onWorkspaceChange?: (workspace: 'inquiries' | 'builder') => void;
}

export const AdminCustomOrderConfig: React.FC<AdminCustomOrderConfigProps> = ({
  currentWorkspace = 'builder',
  onWorkspaceChange,
}) => {
  const navigate = useNavigate();
  const { toast: addToast } = useToast();
  const [config, setConfig] = useState<CustomOrderConfigDto>(DEFAULT_FALLBACK_CONFIG);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTypeTab, setActiveTypeTab] = useState<string>('general');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishSuccess, setIsPublishSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    icon?: 'trash' | 'reset' | 'alert';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await customOrderService.getAdminConfig();
      if (res && res.data && res.data.types && res.data.types.length > 0) {
        setConfig(res.data);
        setActiveTypeTab(res.data.types[0].id);
      } else {
        setConfig(DEFAULT_FALLBACK_CONFIG);
        setActiveTypeTab('general');
      }
    } catch (err) {
      console.warn('[FORM BUILDER] Could not fetch server config, using default template', err);
      setConfig(DEFAULT_FALLBACK_CONFIG);
      setActiveTypeTab('general');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const res = await customOrderService.saveConfigDraft(configRef.current);
      if (res && res.data) {
        setConfig(res.data);
      } else {
        setConfig((prev) => ({ ...prev, status: 'draft' }));
      }
      addToast({
        title: 'Draft Saved',
        message: 'Custom order form configuration draft saved successfully.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Error Saving Draft',
        message: err?.message || 'Failed to save configuration draft.',
        type: 'error',
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublishClick = () => {
    setIsPublishSuccess(false);
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    try {
      setPublishing(true);
      setIsPublishSuccess(false);
      const res = await customOrderService.updateConfig(configRef.current);
      if (res && res.data) {
        setConfig(res.data);
      } else {
        setConfig((prev) => ({ ...prev, status: 'published', version: (prev.version || 1) + 1 }));
      }

      // Celebratory publishing animation
      setIsPublishSuccess(true);

      setTimeout(() => {
        setIsPublishModalOpen(false);
        setIsPublishSuccess(false);
        addToast({
          title: 'Updated successfully',
          message: `Configuration v${(configRef.current.version || 1) + 1} is now live on the storefront!`,
          type: 'success',
          duration: 4000,
        });
      }, 950);
    } catch (err: any) {
      addToast({
        title: 'Error Publishing',
        message: err?.message || 'Failed to publish configuration.',
        type: 'error',
      });
    } finally {
      setPublishing(false);
    }
  };

  // ─── Step & Field Management ───
  const updateType = (typeId: string, updates: Partial<CustomOrderTypeDto>) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => (t.id === typeId ? { ...t, ...updates } : t)),
    }));
  };

  const addStep = (typeId: string) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          const newStep: CustomOrderStepDto = {
            id: `step_${Date.now()}`,
            title: `Step ${(t.steps?.length || 0) + 1}`,
            description: 'Enter step instructions for customers',
            order: (t.steps?.length || 0) + 1,
            fields: [
              {
                id: `field_${Date.now()}`,
                type: 'text',
                label: 'New Question',
                required: false,
                order: 1,
              },
            ],
          };
          return {
            ...t,
            steps: [...(t.steps || []), newStep],
          };
        }
        return t;
      }),
    }));
    addToast({
      title: 'Step Added',
      message: 'New step added to this custom order workflow.',
      type: 'info',
    });
  };

  const updateStep = (typeId: string, stepId: string, updates: Partial<CustomOrderStepDto>) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
          };
        }
        return t;
      }),
    }));
  };

  const deleteStep = (typeId: string, stepId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Step?',
      message: 'Are you sure you want to delete this step and all questions inside it? This action cannot be undone.',
      confirmText: 'Delete Step',
      cancelText: 'Cancel',
      variant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        setConfig((prev) => ({
          ...prev,
          types: prev.types.map((t) => {
            if (t.id === typeId) {
              return {
                ...t,
                steps: (t.steps || []).filter((s) => s.id !== stepId),
              };
            }
            return t;
          }),
        }));
        addToast({
          title: 'Step Deleted',
          message: 'Step removed from form configuration.',
          type: 'warning',
        });
      },
    });
  };

  const moveStep = (typeId: string, fromIndex: number, toIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId && t.steps) {
          if (toIndex < 0 || toIndex >= t.steps.length) return t;
          const newSteps = [...t.steps];
          const [moved] = newSteps.splice(fromIndex, 1);
          newSteps.splice(toIndex, 0, moved);
          return { ...t, steps: newSteps };
        }
        return t;
      }),
    }));
  };

  const addField = (typeId: string, stepId: string) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => {
              if (s.id === stepId) {
                const newField: CustomOrderFieldDto = {
                  id: `field_${Date.now()}`,
                  type: 'text',
                  label: 'New Question',
                  required: false,
                  order: (s.fields?.length || 0) + 1,
                };
                return {
                  ...s,
                  fields: [...(s.fields || []), newField],
                };
              }
              return s;
            }),
          };
        }
        return t;
      }),
    }));
  };

  const updateField = (
    typeId: string,
    stepId: string,
    fieldId: string,
    updates: Partial<CustomOrderFieldDto>
  ) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => {
              if (s.id === stepId) {
                return {
                  ...s,
                  fields: (s.fields || []).map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
                };
              }
              return s;
            }),
          };
        }
        return t;
      }),
    }));
  };

  const deleteField = (typeId: string, stepId: string, fieldId: string) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => {
              if (s.id === stepId) {
                return {
                  ...s,
                  fields: (s.fields || []).filter((f) => f.id !== fieldId),
                };
              }
              return s;
            }),
          };
        }
        return t;
      }),
    }));
  };

  const moveField = (typeId: string, stepId: string, fromIndex: number, toIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => {
              if (s.id === stepId && s.fields) {
                if (toIndex < 0 || toIndex >= s.fields.length) return s;
                const newFields = [...s.fields];
                const [moved] = newFields.splice(fromIndex, 1);
                newFields.splice(toIndex, 0, moved);
                return { ...s, fields: newFields };
              }
              return s;
            }),
          };
        }
        return t;
      }),
    }));
  };

  const [showBulkOptions, setShowBulkOptions] = useState<{ [fieldId: string]: boolean }>({});

  const toggleBulkOptions = (fieldId: string) => {
    setShowBulkOptions((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const addOptionToField = (typeId: string, stepId: string, fieldId: string) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => {
              if (s.id === stepId) {
                return {
                  ...s,
                  fields: (s.fields || []).map((f) => {
                    if (f.id === fieldId) {
                      const curOptions = f.options || [];
                      const newChoiceNum = curOptions.length + 1;
                      const newOpt = {
                        label: `New Choice ${newChoiceNum}`,
                        value: `Choice ${newChoiceNum}`,
                      };
                      return {
                        ...f,
                        options: [...curOptions, newOpt],
                      };
                    }
                    return f;
                  }),
                };
              }
              return s;
            }),
          };
        }
        return t;
      }),
    }));
  };

  const updateOptionInField = (
    typeId: string,
    stepId: string,
    fieldId: string,
    optIndex: number,
    newLabel: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => {
              if (s.id === stepId) {
                return {
                  ...s,
                  fields: (s.fields || []).map((f) => {
                    if (f.id === fieldId && f.options) {
                      const newOpts = [...f.options];
                      newOpts[optIndex] = {
                        label: newLabel,
                        value: newLabel.trim() || `Option ${optIndex + 1}`,
                      };
                      return { ...f, options: newOpts };
                    }
                    return f;
                  }),
                };
              }
              return s;
            }),
          };
        }
        return t;
      }),
    }));
  };

  const removeOptionFromField = (
    typeId: string,
    stepId: string,
    fieldId: string,
    optIndex: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      types: prev.types.map((t) => {
        if (t.id === typeId) {
          return {
            ...t,
            steps: (t.steps || []).map((s) => {
              if (s.id === stepId) {
                return {
                  ...s,
                  fields: (s.fields || []).map((f) => {
                    if (f.id === fieldId && f.options) {
                      return {
                        ...f,
                        options: f.options.filter((_, i) => i !== optIndex),
                      };
                    }
                    return f;
                  }),
                };
              }
              return s;
            }),
          };
        }
        return t;
      }),
    }));
  };

  if (loading) {
    return (
      <div className={styles.skeletonContainer}>
        {/* 1. Top Bar Skeleton */}
        <div className={styles.skeletonTopBar}>
          <div className={styles.skeletonTopBarLeft}>
            <div className={`${styles.skeletonShimmer} ${styles.skeletonWorkspaceToggle}`} />
            <div className={`${styles.skeletonShimmer} ${styles.skeletonStatusPill}`} />
          </div>
          <div className={styles.skeletonTopBarActions}>
            <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnSm}`} />
            <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnMd}`} />
          </div>
        </div>

        {/* 2. Order Forms Banner Skeleton */}
        <div className={styles.skeletonSelectorBanner}>
          <div className={styles.skeletonSelectorHeader}>
            <div className={`${styles.skeletonShimmer} ${styles.skeletonIconBox}`} />
            <div>
              <div className={`${styles.skeletonShimmer} ${styles.skeletonTitleLine}`} style={{ width: '140px' }} />
              <div className={`${styles.skeletonShimmer} ${styles.skeletonSubtitleLine}`} style={{ width: '280px', marginTop: '6px' }} />
            </div>
          </div>
          <div className={styles.skeletonFormsGrid}>
            <div className={styles.skeletonFormCard}>
              <div className={`${styles.skeletonShimmer} ${styles.skeletonCardIcon}`} />
              <div className={styles.skeletonCardBody}>
                <div className={styles.skeletonCardTop}>
                  <div className={`${styles.skeletonShimmer} ${styles.skeletonTitleLine}`} style={{ width: '150px' }} />
                  <div className={`${styles.skeletonShimmer} ${styles.skeletonBadgePill}`} />
                </div>
                <div className={`${styles.skeletonShimmer} ${styles.skeletonStatsLine}`} />
              </div>
            </div>
            <div className={styles.skeletonFormCard}>
              <div className={`${styles.skeletonShimmer} ${styles.skeletonCardIcon}`} />
              <div className={styles.skeletonCardBody}>
                <div className={styles.skeletonCardTop}>
                  <div className={`${styles.skeletonShimmer} ${styles.skeletonTitleLine}`} style={{ width: '150px' }} />
                  <div className={`${styles.skeletonShimmer} ${styles.skeletonBadgePill}`} />
                </div>
                <div className={`${styles.skeletonShimmer} ${styles.skeletonStatsLine}`} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Workspace Grid Skeleton */}
        <div className={styles.skeletonWorkspaceGrid}>
          {/* Left Column: Steps */}
          <div className={styles.skeletonStepsColumn}>
            <div className={styles.skeletonStepsHeader}>
              <div className={`${styles.skeletonShimmer} ${styles.skeletonTitleLine}`} style={{ width: '220px' }} />
              <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnSm}`} />
            </div>

            {/* Step Card 1 Skeleton */}
            <div className={styles.skeletonStepCard}>
              <div className={styles.skeletonStepCardHead}>
                <div className={`${styles.skeletonShimmer} ${styles.skeletonDragHandle}`} />
                <div className={`${styles.skeletonShimmer} ${styles.skeletonInputLg}`} />
                <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnIcon}`} />
              </div>
              <div className={styles.skeletonFieldsList}>
                <div className={styles.skeletonFieldCard}>
                  <div className={styles.skeletonFieldHeader}>
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonInputMd}`} />
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonTypeSelect}`} />
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonSwitch}`} />
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnIcon}`} />
                  </div>
                  <div className={`${styles.skeletonShimmer} ${styles.skeletonInputSm}`} style={{ width: '70%', marginTop: '8px' }} />
                </div>
                <div className={styles.skeletonFieldCard}>
                  <div className={styles.skeletonFieldHeader}>
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonInputMd}`} />
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonTypeSelect}`} />
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonSwitch}`} />
                    <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnIcon}`} />
                  </div>
                  <div className={`${styles.skeletonShimmer} ${styles.skeletonInputSm}`} style={{ width: '50%', marginTop: '8px' }} />
                </div>
              </div>
              <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnSm}`} style={{ alignSelf: 'flex-start', marginTop: '12px' }} />
            </div>
          </div>

          {/* Right Column: Summary Card Skeleton (Desktop only) */}
          <div className={styles.skeletonSummaryCard}>
            <div className={`${styles.skeletonShimmer} ${styles.skeletonTitleLine}`} style={{ width: '100px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={`${styles.skeletonShimmer} ${styles.skeletonTextLine}`} style={{ width: '60px' }} />
                <div className={`${styles.skeletonShimmer} ${styles.skeletonTextLine}`} style={{ width: '120px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={`${styles.skeletonShimmer} ${styles.skeletonTextLine}`} style={{ width: '50px' }} />
                <div className={`${styles.skeletonShimmer} ${styles.skeletonTextLine}`} style={{ width: '40px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={`${styles.skeletonShimmer} ${styles.skeletonTextLine}`} style={{ width: '70px' }} />
                <div className={`${styles.skeletonShimmer} ${styles.skeletonTextLine}`} style={{ width: '40px' }} />
              </div>
            </div>
            <div className={`${styles.skeletonShimmer} ${styles.skeletonGuideBox}`} />
            <div className={`${styles.skeletonShimmer} ${styles.skeletonBtnFull}`} />
          </div>
        </div>
      </div>
    );
  }

  const activeType = config.types?.find((t) => t.id === activeTypeTab) || config.types?.[0];

  return (
    <div className={styles.container}>
      {/* 1. Sticky Control Bar (Workspace Switcher + Status Badge + Actions) */}
      <div className={styles.unifiedTopBar}>
        <div className={styles.topBarLeft}>
          {/* Workspace Switcher */}
          <div className={styles.workspaceSwitcher}>
            <button
              type="button"
              onClick={() => {
                if (onWorkspaceChange) {
                  onWorkspaceChange('inquiries');
                } else {
                  navigate('/admin/custom-orders');
                }
              }}
              className={styles.workspaceBtn}
              title="View customer custom order requests"
            >
              <FileText size={15} />
              <span>Inquiries</span>
            </button>
            <button
              type="button"
              className={`${styles.workspaceBtn} ${styles.workspaceBtnActive}`}
              title="Form Builder is currently active"
            >
              <FileEdit size={15} />
              <span>Form Builder</span>
            </button>
          </div>

          <div className={styles.barDivider} />

          {/* Status Badge */}
          <div className={styles.statusBadgeWrapper}>
            {config.status === 'draft' ? (
              <span className={styles.badgeDraft}>
                <span className={styles.statusDotAmber} />
                Draft
              </span>
            ) : (
              <span className={styles.badgeLive}>
                <span className={styles.statusDotEmerald} />
                Live (v{config.version || 1})
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.topBarActions}>
          <button
            type="button"
            className={styles.saveDraftBtn}
            onClick={handleSaveDraft}
            disabled={savingDraft || publishing}
            title="Save draft"
          >
            <Save size={14} />
            <span>{savingDraft ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            className={styles.publishBtn}
            onClick={handlePublishClick}
            disabled={publishing || savingDraft}
            title="Publish changes live"
          >
            <Send size={14} />
            <span>{publishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* 2. Form Selector */}
      <div className={styles.formSelectorBanner}>
        <div className={styles.formSelectorHeader}>
          <SlidersHorizontal size={15} className={styles.formSelectorIcon} />
          <div>
            <h3 className={styles.formSelectorTitle}>Order Forms</h3>
            <p className={styles.formSelectorSubtitle}>Select a form to configure questions, steps, and options.</p>
          </div>
        </div>

        <div className={styles.formCardsGrid}>
          {config.types?.map((t) => {
            const isActive = activeTypeTab === t.id;
            const stepCount = t.steps?.length || 0;
            const questionCount = t.steps?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0;
            const formName =
              t.id === 'general' ? 'General Customization' : 'Product Customization';

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTypeTab(t.id)}
                className={`${styles.formCardBtn} ${isActive ? styles.formCardBtnActive : ''}`}
              >
                <div className={styles.formCardIconWrap}>
                  {t.id === 'general' ? <Package size={18} /> : <Palette size={18} />}
                </div>
                <div className={styles.formCardInfo}>
                  <div className={styles.formCardTitleRow}>
                    <span className={styles.formCardName}>{formName}</span>
                    {isActive ? (
                      <span className={styles.formCardEditingBadge}>
                        <Check size={11} strokeWidth={2.5} /> Active
                      </span>
                    ) : (
                      <span className={styles.formCardInactiveBadge}>Select</span>
                    )}
                  </div>
                  <div className={styles.formCardStats}>
                    <span className={styles.statItem}>
                      <Layers size={12} /> {stepCount} {stepCount === 1 ? 'Step' : 'Steps'}
                    </span>
                    <span className={styles.statDot} />
                    <span className={styles.statItem}>
                      <HelpCircle size={12} /> {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      {activeType && (
        <div className={styles.workspaceGrid}>
          {/* Left Column: Form Steps & Questions Builder */}
          <div className={styles.stepsColumn}>
            {/* Steps Header Bar */}
            <div className={styles.stepsHeaderBar}>
              <div className={styles.stepsHeaderLeft}>
                <Layers size={16} className={styles.stepsIcon} />
                <span className={styles.stepsTitle}>
                  {activeType.id === 'general' ? 'General Customization Questions' : 'Product Customization Questions'}
                </span>
                <span className={styles.stepsBadge}>
                  {activeType.steps?.length || 0} {activeType.steps?.length === 1 ? 'Step' : 'Steps'}
                </span>
              </div>

              <button
                type="button"
                className={styles.addStepBtn}
                onClick={() => addStep(activeType.id)}
                title="Add Step"
              >
                <Plus size={14} />
                <span>Add Step</span>
              </button>
            </div>

            {/* Steps List */}
            {activeType.steps && activeType.steps.length > 0 ? (
              activeType.steps.map((step, stepIndex) => (
                <div key={step.id} className={styles.stepCard}>
                  {/* Step Card Header */}
                  <div className={styles.stepCardHeader}>
                    <div className={styles.stepHeaderLeft}>
                      <div className={styles.stepBadgeBox}>
                        <span className={styles.stepBadgeText}>STEP</span>
                        <span className={styles.stepBadgeNum}>{stepIndex + 1}</span>
                      </div>

                      <div className={styles.stepTitleInputsWrap}>
                        <div className={styles.stepFieldLabelGroup}>
                          <span className={styles.tinyHeaderLabel}>Title</span>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) =>
                              updateStep(activeType.id, step.id, { title: e.target.value })
                            }
                            placeholder="Step Title"
                            className={styles.stepTitleInput}
                          />
                        </div>

                        <div className={styles.stepFieldLabelGroup}>
                          <span className={styles.tinyHeaderLabel}>Subtitle</span>
                          <input
                            type="text"
                            value={step.description || ''}
                            onChange={(e) =>
                              updateStep(activeType.id, step.id, { description: e.target.value })
                            }
                            placeholder="Optional instructions for customers"
                            className={styles.stepDescInput}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.stepHeaderRight}>
                      <button
                        type="button"
                        className={styles.reorderBtn}
                        disabled={stepIndex === 0}
                        onClick={() => moveStep(activeType.id, stepIndex, stepIndex - 1)}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.reorderBtn}
                        disabled={stepIndex === (activeType.steps?.length || 1) - 1}
                        onClick={() => moveStep(activeType.id, stepIndex, stepIndex + 1)}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.deleteStepBtn}
                        onClick={() => deleteStep(activeType.id, step.id)}
                        title="Delete Step"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Step Fields Container */}
                  <div className={styles.stepFieldsBody}>
                    <div className={styles.questionsListHeader}>
                      <span className={styles.questionsListTitle}>
                        Questions ({step.fields?.length || 0})
                      </span>
                    </div>

                    {step.fields && step.fields.length > 0 ? (
                      step.fields.map((field, fieldIndex) => (
                        <div key={field.id} className={styles.fieldItemCard}>
                          <div className={styles.fieldMainRow}>
                            <span className={styles.dragHandle} title="Drag to reorder">
                              <GripVertical size={15} />
                            </span>
                            
                            <span className={styles.questionNumBadge}>Q{fieldIndex + 1}</span>

                            {/* Question text */}
                            <div className={styles.questionInputWrap}>
                              <span className={styles.fieldItemMicroLabel}>Question</span>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  updateField(activeType.id, step.id, field.id, {
                                    label: e.target.value,
                                  })
                                }
                                placeholder="Enter question..."
                                className={styles.fieldLabelInput}
                              />
                            </div>

                            {/* Question Type selector */}
                            <div className={styles.fieldTypeSelectWrap}>
                              <span className={styles.fieldItemMicroLabel}>Type</span>
                              <FieldTypeSelect
                                value={field.type}
                                onChange={(newType) => {
                                  const defaultPlaceholders: Record<string, string> = {
                                    text: 'Enter details...',
                                    textarea: 'Describe the occasion, colors, themes, flavors, or special design notes...',
                                    phone: '+91 98765 43210',
                                    email: 'e.g. yourname@example.com',
                                    number: 'e.g. 12',
                                    date: 'Select date',
                                  };
                                  updateField(activeType.id, step.id, field.id, {
                                    type: newType as any,
                                    placeholder: defaultPlaceholders[newType] || '',
                                  });
                                }}
                              />
                            </div>

                            {/* Required toggle pill */}
                            <div className={styles.requiredToggleWrap}>
                              <span className={styles.fieldItemMicroLabel}>Requirement</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateField(activeType.id, step.id, field.id, {
                                    required: !field.required,
                                  })
                                }
                                className={`${styles.requiredPillBtn} ${field.required ? styles.requiredPillActive : ''}`}
                                title={field.required ? 'Required field' : 'Optional field'}
                              >
                                {field.required ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                <span>{field.required ? 'Required' : 'Optional'}</span>
                              </button>
                            </div>

                            {/* Move Field buttons */}
                            <div className={styles.fieldActionButtons}>
                              <button
                                type="button"
                                className={styles.reorderBtn}
                                disabled={fieldIndex === 0}
                                onClick={() => moveField(activeType.id, step.id, fieldIndex, fieldIndex - 1)}
                                title="Move Up"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                className={styles.reorderBtn}
                                disabled={fieldIndex === (step.fields?.length || 1) - 1}
                                onClick={() => moveField(activeType.id, step.id, fieldIndex, fieldIndex + 1)}
                                title="Move Down"
                              >
                                <ArrowDown size={13} />
                              </button>

                              {/* Delete field */}
                              <button
                                type="button"
                                className={styles.deleteFieldBtn}
                                onClick={() => deleteField(activeType.id, step.id, field.id)}
                                title="Delete Question"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Options builder for dropdown, radio, multiselect */}
                          {['dropdown', 'radio', 'multiselect'].includes(field.type) && (
                            <div className={styles.optionsBuilderBox}>
                              <div className={styles.optionsBoxHeader}>
                                <div className={styles.optionsHeaderLeft}>
                                  <ListFilter size={13} className={styles.optionsHeaderIcon} />
                                  <span className={styles.optionsLabel}>Options</span>
                                  <span className={styles.optionsCountBadge}>
                                    {field.options?.length || 0}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  className={styles.toggleBulkBtn}
                                  onClick={() => toggleBulkOptions(field.id)}
                                >
                                  <SlidersHorizontal size={11} />
                                  <span>{showBulkOptions[field.id] ? 'Simple View' : 'CSV View'}</span>
                                </button>
                              </div>

                              {/* Clean individual choice inputs */}
                              <div className={styles.choicesList}>
                                {field.options && field.options.length > 0 ? (
                                  field.options.map((opt, optIdx) => (
                                    <div key={optIdx} className={styles.choiceRowItem}>
                                      <span className={styles.choiceNumPill}>{optIdx + 1}</span>
                                      <input
                                        type="text"
                                        value={opt.label}
                                        onChange={(e) =>
                                          updateOptionInField(
                                            activeType.id,
                                            step.id,
                                            field.id,
                                            optIdx,
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Option ${optIdx + 1}`}
                                        className={styles.choiceTextInput}
                                      />
                                      <button
                                        type="button"
                                        className={styles.choiceDeleteBtn}
                                        onClick={() =>
                                          removeOptionFromField(activeType.id, step.id, field.id, optIdx)
                                        }
                                        title={`Delete "${opt.label}"`}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p className={styles.noChoicesNotice}>
                                    No options configured.
                                  </p>
                                )}

                                {/* Action buttons row */}
                                <div className={styles.choicesActionsRow}>
                                  <button
                                    type="button"
                                    className={styles.addChoiceBtn}
                                    onClick={() => addOptionToField(activeType.id, step.id, field.id)}
                                  >
                                    <Plus size={13} />
                                    <span>Add Option</span>
                                  </button>
                                </div>

                                {/* Expandable comma textarea for power users */}
                                {showBulkOptions[field.id] && (
                                  <div className={styles.bulkBoxWrapper}>
                                    <textarea
                                      value={field.options?.map((o) => o.label).join(', ') || ''}
                                      onChange={(e) => {
                                        const arr = e.target.value
                                          .split(',')
                                          .map((s) => ({ label: s.trim(), value: s.trim() }))
                                          .filter((o) => o.label);
                                        updateField(activeType.id, step.id, field.id, { options: arr });
                                      }}
                                      placeholder="Option 1, Option 2, Option 3..."
                                      rows={2}
                                      className={styles.bulkTextarea}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* WhatsApp Chat options builder */}
                          {field.type === 'whatsapp_chat' && (
                            <div className={styles.whatsAppBuilderBox}>
                              <div className={styles.whatsAppRow}>
                                <span className={styles.optionsLabel}>WhatsApp Phone</span>
                                <input
                                  type="text"
                                  value={field.whatsappNumber || ''}
                                  onChange={(e) =>
                                    updateField(activeType.id, step.id, field.id, {
                                      whatsappNumber: e.target.value,
                                    })
                                  }
                                  placeholder="+91 98765 43210"
                                />
                              </div>
                              <div className={styles.whatsAppRow}>
                                <span className={styles.optionsLabel}>Default Message</span>
                                <input
                                  type="text"
                                  value={field.whatsappMessage || ''}
                                  onChange={(e) =>
                                    updateField(activeType.id, step.id, field.id, {
                                      whatsappMessage: e.target.value,
                                    })
                                  }
                                  placeholder="Hi CakePopRush, I have a question about my custom cake pop order!"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className={styles.noFieldsHint}>
                        No questions in this page yet.
                      </p>
                    )}

                    {/* Add Field Button */}
                    <button
                      type="button"
                      className={styles.addFieldBtn}
                      onClick={() => addField(activeType.id, step.id)}
                    >
                      <Plus size={14} />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noStepsCard}>
                <Layers size={32} color="var(--admin-pink)" />
                <p>No steps configured yet</p>
                <span>Click "Add Step" above to add your first step.</span>
              </div>
            )}
          </div>

          {/* Right Column: Form Summary & Guide */}
          <div className={styles.typeSettingsCard}>
            <div className={styles.settingsCardHeader}>
              <CheckCircle2 size={16} color="var(--admin-pink)" />
              <h3 className={styles.settingsCardTitle}>Summary</h3>
            </div>

            {/* Quick Metrics */}
            <div className={styles.summaryMetricsBox}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Form</span>
                <span className={styles.metricValueBold}>
                  {activeType.id === 'general' ? 'General Customization' : 'Product Customization'}
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Steps</span>
                <span className={styles.metricValueBadge}>{activeType.steps?.length || 0}</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Questions</span>
                <span className={styles.metricValueAccent}>
                  {activeType.steps?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0}
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Status</span>
                <span className={config.status === 'draft' ? styles.statusPillDraft : styles.statusPillLive}>
                  <span className={config.status === 'draft' ? styles.statusDotAmber : styles.statusDotEmerald} />
                  {config.status === 'draft' ? 'Draft' : 'Live'}
                </span>
              </div>
            </div>

            {/* 4-Step Guide */}
            <div className={styles.simpleGuideBox}>
              <div className={styles.guideTitleRow}>
                <HelpCircle size={14} className={styles.guideTitleIcon} />
                <h4 className={styles.guideTitle}>Quick Guide</h4>
              </div>
              <ul className={styles.guideList}>
                <li>
                  <strong>1. Edit:</strong> Enter questions and choose types.
                </li>
                <li>
                  <strong>2. Options:</strong> Add choices for dropdowns and tags.
                </li>
                <li>
                  <strong>3. Rules:</strong> Mark required fields.
                </li>
                <li>
                  <strong>4. Publish:</strong> Save and make changes live.
                </li>
              </ul>
            </div>

            {/* Reset to template button */}
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Reset to Standard Template?',
                  message: 'This will replace all customized questions and steps in this form with the standard defaults.',
                  confirmText: 'Reset Form',
                  cancelText: 'Cancel',
                  variant: 'warning',
                  icon: 'reset',
                  onConfirm: () => {
                    const defaultType = DEFAULT_FALLBACK_CONFIG.types.find((t) => t.id === activeType.id);
                    if (defaultType) {
                      updateType(activeType.id, defaultType);
                      addToast({
                        title: 'Form Reset',
                        message: 'Restored standard questions.',
                        type: 'info',
                      });
                    }
                  },
                });
              }}
            >
              <RotateCcw size={13} />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      )}

      {/* Publish Live Confirmation Modal */}
      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          if (!publishing && !isPublishSuccess) setIsPublishModalOpen(false);
        }}
        onConfirm={handleConfirmPublish}
        publishing={publishing}
        isSuccess={isPublishSuccess}
        currentVersion={config.version || 1}
      />

      {/* Action Confirmation Modal (Replaces browser window.confirm) */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        icon={confirmModal.icon}
      />
    </div>
  );
};

export default AdminCustomOrderConfig;
