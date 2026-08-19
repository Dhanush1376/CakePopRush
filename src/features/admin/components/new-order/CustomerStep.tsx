import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { NewOrderFormProps } from './useNewOrderForm';
import { CustomerInfo } from '@/features/orders/types'
import styles from './AdminNewOrder.module.css';

export function CustomerStep({ form }: NewOrderFormProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>Customer Details</h2>
        <p className={styles.sectionSubtitle}>Who is this order for?</p>
      </div>
      
      <div className={styles.formGroup}>
        <div className={styles.pillGroup} style={{display: 'flex'}}>
          <button 
            className={`${styles.pill} ${styles.pillLarge} ${form.customerType === 'existing' ? styles.active : ''}`}
            onClick={() => form.setCustomerType('existing')}
          >
            Existing Customer
          </button>
          <button 
            className={`${styles.pill} ${styles.pillLarge} ${form.customerType === 'new' ? styles.active : ''}`}
            onClick={() => { form.setCustomerType('new'); form.setCustomerName(''); form.setCustomerPhone(''); form.setCustomerEmail(''); }}
          >
            New Customer
          </button>
        </div>
      </div>

      {form.customerType === 'existing' && (
        <div className={styles.formGroup}>
          <div className={styles.searchWrapper}>
            <Input 
              type="text" 
              placeholder="Search customer by name, phone or email..." 
              value={form.customerSearch}
              onChange={(e) => form.setCustomerSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              fullWidth
            />
          </div>
          {form.customerSearch && (
            <div className={styles.searchResults}>
              {form.MOCK_CUSTOMERS.filter((c: CustomerInfo) => c.name.toLowerCase().includes(form.customerSearch.toLowerCase()) || c.phone.includes(form.customerSearch)).map((c: CustomerInfo) => (
                <div key={c.id} className={styles.searchResultItem} onClick={() => form.selectExistingCustomer(c)}>
                  <div className={styles.resultDetails}>
                    <span className={styles.resultName}>{c.name}</span>
                    <span className={styles.resultMeta}>{c.phone} · {c.email}</span>
                  </div>
                  <span className={styles.resultMeta} style={{fontWeight: 600, color: 'var(--admin-pink)'}}>{c.orderCount} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(form.customerType === 'new' || form.customerName) && (
        <>
          <div className={styles.row}>
            <Input label="Full Name *" placeholder="Enter name" value={form.customerName} onChange={(e) => { form.markChanged(); form.setCustomerName(e.target.value); }} error={form.errors.customerName} fullWidth />
            <Input label="Phone Number *" placeholder="Enter phone" value={form.customerPhone} onChange={form.handlePhoneChange} error={form.errors.customerPhone} fullWidth />
          </div>
          
          {form.duplicateCustomerFound && form.customerType === 'new' && (
            <div style={{background: '#E0F2FE', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: '13px', fontWeight: 600, color: '#0369A1'}}>Existing customer found</div>
                <div style={{fontSize: '13px', color: '#0284C7', marginTop: '4px'}}>{form.duplicateCustomerFound.name} · {form.duplicateCustomerFound.email}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => form.selectExistingCustomer(form.duplicateCustomerFound)}>Use This Customer</Button>
            </div>
          )}

          <Input label="Email Address (Optional)" type="email" placeholder="Enter email" value={form.customerEmail} onChange={(e) => { form.markChanged(); form.setCustomerEmail(e.target.value); }} fullWidth />
        </>
      )}

      <div className={styles.divider} />
      
      <div className={styles.formGroup}>
        <label className={styles.label}>How did this order come in?</label>
        <div className={styles.pillGroup}>
          {['Phone', 'WhatsApp', 'Instagram', 'Walk-in', 'Staff Entry', 'Other'].map(src => (
            <button key={src} className={`${styles.pill} ${form.orderSource === src ? styles.active : ''}`} onClick={() => { form.markChanged(); form.setOrderSource(src  as any); }}>
              {src}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
