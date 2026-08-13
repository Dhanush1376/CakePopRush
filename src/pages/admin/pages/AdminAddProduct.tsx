import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, Image as ImageIcon, Info, Box, Tag, 
  Shield, BarChart, ArrowUp, UploadCloud, Plus, ArrowRight, X, Upload 
} from 'lucide-react';
import styles from './AdminAddProduct.module.css';
import { ProductCard } from '@/components/commerce/ProductCard';
import { Product } from '@/types/product';

const steps = [
  { id: 1, label: 'Media', icon: ImageIcon },
  { id: 2, label: 'Basic Info', icon: Info },
  { id: 3, label: 'Variants', icon: Box },
  { id: 4, label: 'Pricing', icon: Tag },
  { id: 5, label: 'SEO', icon: BarChart },
  { id: 6, label: 'Publish', icon: ArrowUp },
];

export function AdminAddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  
  // Form State
  const [productData, setProductData] = useState({
    primaryImage: null as string | null,
    galleryImages: [] as string[],
    title: 'Product Title',
    category: 'Category',
    price: '₹0'
  });

  // Handle Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Simulate save
        console.log('Saved draft');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePrimaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProductData(prev => ({ ...prev, primaryImage: url }));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(f => URL.createObjectURL(f));
      setProductData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...newImages].slice(0, 8)
      }));
    }
  };

  const removePrimaryImage = () => {
    setProductData(prev => ({ ...prev, primaryImage: null }));
  };

  const removeGalleryImage = (index: number) => {
    setProductData(prev => {
      const newImages = [...prev.galleryImages];
      newImages.splice(index, 1);
      return { ...prev, galleryImages: newImages };
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProductData(prev => ({ ...prev, primaryImage: url }));
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>Add New Product</h1>
            <p className={styles.subtitle}>Add a new cake pop product to your store</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.draftStatus}>
            <Check size={16} /> Draft saved
          </div>
          <button className={styles.saveDraftBtn}>
            Save as Draft <span className={styles.shortcut}>Ctrl + S</span>
          </button>
          <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
            Cancel <span className={styles.cancelShortcut}>Esc</span>
          </button>
        </div>
      </div>

      {/* Stepper (Desktop) */}
      <div className={`${styles.stepperContainer} ${styles.desktopOnly}`}>
        <div className={styles.stepper}>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`${styles.step} ${isActive ? styles.active : ''}`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={styles.stepIcon}>
                    {isActive ? step.id : <StepIcon size={16} />}
                  </div>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
                {index < steps.length - 1 && <div className={styles.stepLine} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper & Toggle */}
      <div className={styles.mobileOnly} style={{ padding: '0 24px' }}>
        <div className={styles.mobileStepperCard}>
          <div className={styles.mobileStepperIcon}>
            {React.createElement(steps.find(s => s.id === currentStep)?.icon || ImageIcon, { size: 24 })}
          </div>
          <div className={styles.mobileStepperInfo}>
            <div className={styles.mobileStepCount}>
              Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
            </div>
            <div className={styles.mobileStepLabel}>
              {steps.find(s => s.id === currentStep)?.label}
            </div>
          </div>
          <div className={styles.mobileProgressBarContainer}>
            <div 
              className={styles.mobileProgressBarFill} 
              style={{ width: `${((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.mobileToggleContainer}>
          <button 
            className={`${styles.mobileToggleBtn} ${mobileView === 'edit' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => setMobileView('edit')}
          >
            Edit Product
          </button>
          <button 
            className={`${styles.mobileToggleBtn} ${mobileView === 'preview' ? styles.mobileToggleBtnActive : ''}`}
            onClick={() => setMobileView('preview')}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Left Column: Main Form Area */}
        <div className={`${styles.leftColumn} ${mobileView === 'preview' ? styles.hideOnMobile : ''}`}>
          {currentStep === 1 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Product Media</h2>
              <p className={styles.sectionSubtitle}>Upload images or paste URLs. The first image acts as the primary cover.</p>
              
              {/* Paste URL Section */}
              <div className={styles.mediaBox}>
                <h3 className={styles.mediaBoxTitle}>PASTE IMAGE URLS</h3>
                <div className={styles.urlInputGroup}>
                  <input type="text" placeholder="Image URL" className={styles.urlInput} />
                  <button className={styles.urlBtn}>ADD URL</button>
                </div>
              </div>

              {/* Upload Files Section */}
              <div className={styles.mediaBox}>
                <h3 className={styles.mediaBoxTitle}>UPLOAD FILES</h3>
                <div className={styles.fileUploadWrapper}>
                  <button className={styles.chooseFilePillBtn} onClick={() => fileInputRef.current?.click()}>CHOOSE FILES</button>
                  <span className={styles.fileNameText}>
                    {productData.primaryImage ? '1 file selected' : 'No file chosen'}
                  </span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className={styles.hiddenInput} 
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handlePrimaryImageUpload}
                  />
                </div>
              </div>

              <div className={styles.mediaFooter}>
                <button className={styles.footerBackBtn} onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}>Back</button>
                <div className={styles.footerRight}>
                  <button className={styles.publishBtn}><Upload size={16} /> Publish</button>
                  <button className={styles.continueBtn} onClick={() => setCurrentStep(prev => Math.min(prev + 1, 6))}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Pricing & Inventory</h2>
              <p className={styles.sectionSubtitle}>Define stock and list prices.</p>
              
              <div className={styles.threeColumnGrid}>
                <div className={styles.mediaBox}>
                  <h3 className={styles.mediaBoxTitle}>CURATION PRICE (₹) <span style={{color: '#F21B5B'}}>*</span></h3>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.inputIcon}>₹</span>
                    <input type="text" placeholder="2000" className={styles.urlInput} style={{paddingLeft: '32px'}} />
                  </div>
                </div>

                <div className={styles.mediaBox}>
                  <h3 className={styles.mediaBoxTitle}>OLD STRIKING PRICE (₹)</h3>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.inputIcon}>₹</span>
                    <input type="text" placeholder="2500" className={styles.urlInput} style={{paddingLeft: '32px'}} />
                  </div>
                </div>

                <div className={styles.mediaBox}>
                  <h3 className={styles.mediaBoxTitle}>AVAILABLE STOCK <span style={{color: '#F21B5B'}}>*</span></h3>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.inputIcon}>#</span>
                    <input type="text" placeholder="50" className={styles.urlInput} style={{paddingLeft: '32px'}} />
                  </div>
                </div>
              </div>

              <div className={styles.mediaFooter}>
                <button className={styles.footerBackBtn} onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}>Back</button>
                <div className={styles.footerRight}>
                  <button className={styles.publishBtn}><Upload size={16} /> Publish</button>
                  <button className={styles.continueBtn} onClick={() => setCurrentStep(prev => Math.min(prev + 1, 6))}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>SEO Meta Configuration</h2>
              <p className={styles.sectionSubtitle}>Configure title and description for search engines.</p>
              
              <div className={styles.mediaBox}>
                <h3 className={styles.mediaBoxTitle}>SEO PAGE TITLE</h3>
                <input type="text" placeholder="Enter page title" className={styles.urlInput} />
              </div>

              <div className={styles.mediaBox}>
                <h3 className={styles.mediaBoxTitle}>SEO META DESCRIPTION</h3>
                <textarea placeholder="Enter meta description" className={styles.textAreaInput} rows={3}></textarea>
              </div>

              <div className={styles.seoPreviewBox}>
                <div className={styles.seoPreviewUrl}>yoursite.com › products › your-product</div>
                <div className={styles.seoPreviewTitle}>Product Title | Your Store</div>
                <div className={styles.seoPreviewDesc}>17 May 2026 — This is how your product description will appear in search engine results. Its elegant design adds a touch of tradition to your celebrations.</div>
              </div>

              <div className={styles.mediaFooter}>
                <button className={styles.footerBackBtn} onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}>Back</button>
                <div className={styles.footerRight}>
                  <button className={styles.publishBtn}><Upload size={16} /> Publish</button>
                  <button className={styles.continueBtn} onClick={() => setCurrentStep(prev => Math.min(prev + 1, 6))}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {currentStep !== 1 && currentStep !== 4 && currentStep !== 5 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>{steps.find(s => s.id === currentStep)?.label}</h2>
              <p className={styles.sectionSubtitle}>This section is coming soon.</p>
              <div className={styles.mediaFooter} style={{ marginTop: '40px' }}>
                <button className={styles.footerBackBtn} onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}>Back</button>
                <div className={styles.footerRight}>
                  <button className={styles.publishBtn}><Upload size={16} /> Publish</button>
                  <button className={styles.continueBtn} onClick={() => setCurrentStep(prev => Math.min(prev + 1, 6))}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Storefront Preview */}
        <div className={`${styles.card} ${mobileView === 'edit' ? styles.hideOnMobile : ''}`}>
          <h2 className={styles.sectionTitle}>Storefront Preview</h2>
          <p className={styles.sectionSubtitle}>This is how your product will appear to customers</p>

          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <ProductCard 
              product={{
                id: 'preview',
                slug: '#',
                name: productData.title,
                categoryName: productData.category,
                images: productData.primaryImage 
                  ? [{ id: '1', url: productData.primaryImage, alt: productData.title }]
                  : [],
                basePrice: parseInt(productData.price.replace(/[^0-9]/g, '')) || 0,
                rating: 0,
                reviewCount: 0
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
