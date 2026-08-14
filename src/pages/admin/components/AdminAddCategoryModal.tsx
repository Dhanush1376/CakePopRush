import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, RefreshCw, Package } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContext'
import styles from './AdminAddCategoryModal.module.css'

interface AdminAddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newCategory: any) => void
  existingCategories: any[]
}

export const AdminAddCategoryModal: React.FC<AdminAddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingCategories
}) => {
  const [name, setName] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setName('')
      setImage(null)
      setError(undefined)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
    }
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (image) URL.revokeObjectURL(image)
    setImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleReplaceImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const validate = () => {
    if (!name.trim()) {
      setError('Category name is required')
      return false
    }
    
    // Check duplicates
    const isDuplicate = existingCategories.some(
      cat => cat.name.toLowerCase() === name.trim().toLowerCase()
    )
    if (isDuplicate) {
      setError('A category with this name already exists')
      return false
    }

    setError(undefined)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      
      const newCategory = {
        id: Date.now(), // Mock ID
        name: name.trim(),
        description: 'New category description', // Default mock
        products: 0,
        status: 'Active',
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        icon: Package, // Default
        color: 'var(--admin-pink)',
        bg: '#FFF0F5',
        image: image
      }

      toast({ type: 'success', title: 'Success', message: 'Category created successfully!' })
      onSuccess(newCategory)
      onClose()
    }, 800)
  }

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Add Category">
      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.mediaBox}>
          <h3 className={styles.mediaBoxTitle}>CATEGORY NAME <span className={styles.required}>*</span></h3>
          <input 
            type="text"
            className={styles.urlInput}
            placeholder="e.g. Vegan Pops"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(undefined)
            }}
            disabled={isSubmitting}
            autoFocus
          />
          {error && <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px', marginLeft: '12px' }}>{error}</p>}
        </div>

        <div className={styles.mediaBox}>
          <h3 className={styles.mediaBoxTitle}>CATEGORY IMAGE (OPTIONAL)</h3>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className={styles.hiddenInput} 
            accept="image/jpeg, image/png, image/webp"
            onChange={handleImageUpload}
          />
          
          {!image ? (
            <div className={styles.fileUploadWrapper}>
              <button type="button" className={styles.chooseFilePillBtn} onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} /> CHOOSE FILE
              </button>
              <span className={styles.fileNameText}>No file chosen</span>
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <img src={image} alt="Preview" className={styles.previewImage} />
              <div className={styles.previewOverlay}>
                <button 
                  type="button" 
                  className={styles.actionBtn} 
                  onClick={handleReplaceImage}
                  title="Replace Image"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  type="button" 
                  className={`${styles.actionBtn} ${styles.remove}`} 
                  onClick={handleRemoveImage}
                  title="Remove Image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.mediaFooter}>
          <button type="button" className={styles.footerBackBtn} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={styles.continueBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  )
}
