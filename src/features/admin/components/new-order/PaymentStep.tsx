import React from 'react';
import { Input } from '@/components/ui/Input';
import { NewOrderFormProps } from './useNewOrderForm';
import styles from './AdminNewOrder.module.css';

export function PaymentStep({ form }: NewOrderFormProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>Payment</h2>
        <p className={styles.sectionSubtitle}>How is the customer paying for this order?</p>
      </div>

      <div className={styles.paymentTotalCard}>
        <div className={styles.paymentTotalLabel}>Current Order Total</div>
        <div className={styles.paymentTotalValue}>₹{form.pricing.total.toFixed(2)}</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Payment Method</label>
        <div className={styles.pillGroup}>
          {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Online Payment', 'Other'].map(method => (
            <button key={method} className={`${styles.pill} ${form.paymentMethod === method ? styles.active : ''}`} onClick={() => { form.markChanged(); form.setPaymentMethod(method  as any); }}>{method}</button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Payment Status</label>
        <div className={styles.pillGroup}>
          {['Paid', 'Partially Paid', 'Pending', 'Failed'].map(status => (
            <button key={status} className={`${styles.pill} ${form.paymentStatus === status ? styles.active : ''}`} onClick={() => { form.markChanged(); form.setPaymentStatus(status  as any); }}>{status}</button>
          ))}
        </div>
      </div>

      {form.paymentStatus === 'Paid' && (
        <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', fontWeight: 600}}>Amount Paid: ₹{form.pricing.total.toFixed(2)}</div>
      )}

      {form.paymentStatus === 'Partially Paid' && (
        <div className={styles.row}>
          <Input label="Amount Paid (₹)" type="number" placeholder="0.00" value={form.amountPaid} onChange={(e) => { form.markChanged(); form.setAmountPaid(e.target.value); }} error={form.errors.amountPaid} fullWidth />
          <Input label="Remaining Amount" type="text" value={`₹${form.pricing.remaining.toFixed(2)}`} disabled fullWidth />
        </div>
      )}

      <div className={styles.divider} />

      <div>
        <button className={styles.notesToggle} onClick={() => form.setShowNotes(!form.showNotes)}>
          {form.showNotes ? 'Hide Notes' : '+ Add Notes (Optional)'}
        </button>
        {form.showNotes && (
          <div className={styles.notesContainer}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Internal Note</label>
              <textarea className={styles.textarea} placeholder="Visible only to staff." value={form.internalNotes} onChange={(e) => form.setInternalNotes(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Customer Note</label>
              <textarea className={styles.textarea} placeholder="Information intended for the customer." value={form.customerNotes} onChange={(e) => form.setCustomerNotes(e.target.value)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
