import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { NewOrderFormProps } from './useNewOrderForm';
import styles from './AdminNewOrder.module.css';
import { OrderItem } from './types';

export function ItemsStep({ form }: NewOrderFormProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>What did they order?</h2>
        <p className={styles.sectionSubtitle}>Add the products and custom items requested by the customer.</p>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.pillGroup} style={{display: 'flex'}}>
          <button 
            className={`${styles.pill} ${styles.pillLarge} ${form.itemEntryMode === 'catalogue' ? styles.active : ''}`}
            onClick={() => { form.setItemEntryMode('catalogue'); form.resetCustomForm(); }}
          >
            Catalogue Product
          </button>
          <button 
            className={`${styles.pill} ${styles.pillLarge} ${form.itemEntryMode === 'custom' ? styles.active : ''}`}
            onClick={() => form.setItemEntryMode('custom')}
          >
            Custom Order
          </button>
        </div>
      </div>

      {form.itemEntryMode === 'catalogue' ? (
        <div className={styles.formGroup} style={{position: 'relative', marginTop: 'var(--space-2)'}}>
          <div className={styles.searchWrapper}>
            <Input 
              type="text" 
              placeholder="Search products by name, SKU or category..." 
              value={form.productSearch}
              onChange={(e) => { form.setProductSearch(e.target.value); form.setIsSearchingProduct(true); }}
              onFocus={() => form.setIsSearchingProduct(true)}
              leftIcon={<Search size={16} />}
              fullWidth
            />
          </div>
          
          {form.isSearchingProduct && (
            <div className={styles.searchResults}>
              {form.productSearchResults.length > 0 ? (
                form.productSearchResults.map((p: any) => (
                  <div key={p.sku} className={styles.searchResultItem}>
                    <div className={styles.resultInfo}>
                      <img src={p.image} alt={p.name} className={styles.resultImage} />
                      <div className={styles.resultDetails}>
                        <span className={styles.resultName}>{p.name}</span>
                        <span className={styles.resultMeta}>SKU: {p.sku} · ₹{p.price}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => form.handleAddProduct(p)}>+ Add</Button>
                  </div>
                ))
              ) : (
                <div style={{padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)'}}>No products found.</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.customItemForm}>
          <div style={{marginBottom: 'var(--space-4)'}}>
            <h3 style={{fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px'}}>Custom Item</h3>
            <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)'}}>Add the details of the item requested by the customer.</p>
          </div>
          
          <div className={styles.row}>
            <Input label="Item Name *" placeholder="e.g. Custom 2-Tier Wedding Cake" value={form.customItemName} onChange={(e) => form.setCustomItemName(e.target.value)} fullWidth />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea className={styles.textarea} placeholder="Describe what the customer requested..." value={form.customItemDesc} onChange={(e) => form.setCustomItemDesc(e.target.value)} rows={2} />
          </div>

          <div className={styles.expandableSection}>
            <button className={styles.expandableHeader} onClick={() => form.setShowCustomDetails(!form.showCustomDetails)}>
              <span>Customization Details</span>
              <ChevronDown size={16} style={{transform: form.showCustomDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}} />
            </button>
            {form.showCustomDetails && (
              <div className={styles.expandableContent}>
                <div className={styles.row}>
                  <Input label="Flavor" placeholder="e.g. Belgian Chocolate" value={form.customItemFlavor} onChange={(e) => form.setCustomItemFlavor(e.target.value)} fullWidth />
                  <Input label="Size / Weight" placeholder="e.g. 2 kg" value={form.customItemSize} onChange={(e) => form.setCustomItemSize(e.target.value)} fullWidth />
                </div>
                <Input label="Message on Cake" placeholder="e.g. Happy Anniversary" value={form.customItemMessage} onChange={(e) => form.setCustomItemMessage(e.target.value)} fullWidth />
                <Input label="Design / Decoration" placeholder="e.g. White floral design with gold accents" value={form.customItemDesign} onChange={(e) => form.setCustomItemDesign(e.target.value)} fullWidth />
                <div className={styles.formGroup} style={{marginTop: 'var(--space-3)'}}>
                  <label className={styles.label}>Special Instructions</label>
                  <textarea className={styles.textarea} placeholder="Any other specific requests..." value={form.customItemInstructions} onChange={(e) => form.setCustomItemInstructions(e.target.value)} rows={2} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Reference Image (Optional)</label>
            <div className={styles.imageUploadBox}>
              <div style={{color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)'}}>Upload a reference image provided by the customer.</div>
              <Button variant="outline" size="sm" style={{marginTop: 'var(--space-2)'}}>Select Image</Button>
            </div>
          </div>

          <div className={styles.row} style={{alignItems: 'flex-end'}}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Quantity</label>
              <div className={styles.quantityControl} style={{background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)'}}>
                <button className={styles.qtyBtn} onClick={() => form.setCustomItemQty(String(Math.max(1, parseInt(form.customItemQty || '1') - 1)))}>−</button>
                <span className={styles.qtyValue}>{form.customItemQty || '1'}</span>
                <button className={styles.qtyBtn} onClick={() => form.setCustomItemQty(String(parseInt(form.customItemQty || '1') + 1))}>+</button>
              </div>
            </div>
            <Input label="Unit Price (₹) *" type="number" placeholder="Set price" value={form.customItemPrice} onChange={(e) => form.setCustomItemPrice(e.target.value)} fullWidth />
          </div>
          
          <div className={styles.customTotalBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)'}}>Custom Item Total</span>
              <span style={{fontWeight: 700, fontSize: 'var(--font-size-lg)'}}>₹{((parseFloat(form.customItemPrice) || 0) * (parseInt(form.customItemQty) || 1)).toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.expandableSection}>
            <button className={styles.expandableHeader} onClick={() => form.setShowCustomNotes(!form.showCustomNotes)}>
              <span>Internal & Customer Notes</span>
              <ChevronDown size={16} style={{transform: form.showCustomNotes ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}} />
            </button>
            {form.showCustomNotes && (
              <div className={styles.expandableContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Internal Note <span style={{fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 400}}>(Visible only to staff)</span></label>
                  <textarea className={styles.textarea} placeholder="Add notes for staff..." value={form.customItemInternalNote} onChange={(e) => form.setCustomItemInternalNote(e.target.value)} rows={2} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Customer Note</label>
                  <textarea className={styles.textarea} placeholder="Add information intended for the customer..." value={form.customItemCustomerNote} onChange={(e) => form.setCustomItemCustomerNote(e.target.value)} rows={2} />
                </div>
              </div>
            )}
          </div>

          <div style={{display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)'}}>
            {form.editingCustomItemId && (
               <Button variant="ghost" onClick={() => { form.resetCustomForm(); form.setItemEntryMode('catalogue'); }}>Cancel</Button>
            )}
            <Button variant="primary" onClick={form.handleAddCustomItem} disabled={!form.customItemName || !form.customItemPrice}>
              {form.editingCustomItemId ? 'Update Custom Item' : 'Add Custom Item'}
            </Button>
          </div>
        </div>
      )}

      <div className={styles.divider} style={{margin: 'var(--space-6) 0 var(--space-4)'}} />

      {form.errors.items && <span style={{color: 'var(--color-error)', fontSize: '13px'}}>{form.errors.items}</span>}

      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
        {form.items.map((item: OrderItem) => (
          <div key={item.id} className={styles.orderItemRow}>
            <div className={styles.itemMain}>
              <div className={styles.itemLeft}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                ) : (
                  <div className={styles.itemImage} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--color-text-muted)', background: item.isCustom ? '#FDF2F8' : 'var(--color-surface-hover)'}}>
                     {item.isCustom ? 'CSTM' : 'Img'}
                  </div>
                )}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}{item.isCustom && <span className={styles.customBadge}>CUSTOM</span>}</span>
                  {item.isCustom ? (
                     <div style={{display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px'}}>
                       {item.customization?.flavor && <span style={{fontSize: '11px', color: 'var(--color-text-muted)'}}>{item.customization.flavor} {item.customization.size && `· ${item.customization.size}`}</span>}
                       <span style={{fontSize: '12px', fontWeight: 500, color: 'var(--color-text)'}}>₹{item.unitPrice.toFixed(2)}</span>
                     </div>
                  ) : (
                     <span className={styles.itemSku}>{item.sku ? `SKU: ${item.sku}` : `₹${item.unitPrice.toFixed(2)} each`}</span>
                  )}
                </div>
              </div>
              
              <div className={styles.itemRight}>
                <div className={styles.quantityControl}>
                  <button className={styles.qtyBtn} onClick={() => form.updateItemQuantity(item.id, -1)}>−</button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => form.updateItemQuantity(item.id, 1)}>+</button>
                </div>
                <span className={styles.itemTotal}>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            </div>
            
            <div className={styles.itemActions}>
              {item.isCustom ? (
                <Button variant="ghost" size="sm" style={{color: 'var(--admin-pink)', padding: 0}} onClick={() => form.handleEditCustomItem(item.id)}>Edit</Button>
              ) : (
                <Button variant="ghost" size="sm" style={{color: 'var(--admin-pink)', padding: 0}}>Customize</Button>
              )}
              <Button variant="ghost" size="sm" style={{color: 'var(--color-text-muted)', padding: 0}} onClick={() => form.removeItem(item.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>


      {form.items.length > 0 && (
        <div className={styles.stepSummary}>
          <span className={styles.stepSummaryText}>{form.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)} items</span>
          <span className={styles.stepSummaryTotal}>₹{form.pricing.subtotal.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
