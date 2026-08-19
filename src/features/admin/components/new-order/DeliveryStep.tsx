import React from 'react';
import { Input } from '@/components/ui/Input';
import { NewOrderFormProps } from './useNewOrderForm';
import styles from './AdminNewOrder.module.css';

export function DeliveryStep({ form }: NewOrderFormProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>How will they receive it?</h2>
        <p className={styles.sectionSubtitle}>Choose delivery or pickup and provide the required details.</p>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.pillGroup} style={{display: 'flex'}}>
          <button className={`${styles.pill} ${styles.pillLarge} ${form.fulfillmentType === 'delivery' ? styles.active : ''}`} onClick={() => { form.markChanged(); form.setFulfillmentType('delivery'); }}>Delivery</button>
          <button className={`${styles.pill} ${styles.pillLarge} ${form.fulfillmentType === 'pickup' ? styles.active : ''}`} onClick={() => { form.markChanged(); form.setFulfillmentType('pickup'); }}>Pickup</button>
        </div>
      </div>

      <div className={styles.divider} />

      {form.fulfillmentType === 'delivery' ? (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Delivery Address *</label>
            <textarea className={styles.textarea} style={{borderColor: form.errors.address ? 'var(--color-error)' : undefined}} placeholder="Enter full delivery address" value={form.address} onChange={(e) => { form.markChanged(); form.setAddress(e.target.value); }} />
            {form.errors.address && <span style={{color: 'var(--color-error)', fontSize: '12px'}}>{form.errors.address}</span>}
          </div>
          <div className={styles.row}>
            <Input label="Landmark (Optional)" value={form.landmark} onChange={(e) => { form.markChanged(); form.setLandmark(e.target.value); }} fullWidth />
            <Input label="City" value={form.city} onChange={(e) => { form.markChanged(); form.setCity(e.target.value); }} fullWidth />
          </div>
          <div className={styles.row}>
            <Input label="State" value={form.state} onChange={(e) => { form.markChanged(); form.setState(e.target.value); }} fullWidth />
            <Input label="PIN Code" value={form.pinCode} onChange={(e) => { form.markChanged(); form.setPinCode(e.target.value); }} fullWidth />
          </div>
          <div className={styles.row}>
            <Input label="Delivery Date *" type="date" value={form.deliveryDate} onChange={(e) => { form.markChanged(); form.setDeliveryDate(e.target.value); }} error={form.errors.deliveryDate} fullWidth />
            <div className={styles.formGroup}>
              <label className={styles.label}>Delivery Time</label>
              <select className={styles.select} value={form.deliveryTime} onChange={(e) => { form.markChanged(); form.setDeliveryTime(e.target.value); }}>
                <option value="">Select time slot</option>
                <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                <option value="12:00 PM – 2:00 PM">12:00 PM – 2:00 PM</option>
                <option value="4:00 PM – 6:00 PM">4:00 PM – 6:00 PM</option>
              </select>
            </div>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Delivery Fee</label>
            <div className={styles.pillGroup}>
              {['Free', 'Standard', 'Custom'].map(fee => (
                <button key={fee} className={`${styles.pill} ${form.deliveryFeeType === fee ? styles.active : ''}`} onClick={() => { form.markChanged(); form.setDeliveryFeeType(fee  as any); }}>{fee}</button>
              ))}
            </div>
            {form.deliveryFeeType === 'Custom' && (
              <div style={{marginTop: 'var(--space-2)'}}>
                <Input type="number" placeholder="Enter custom fee" value={form.customDeliveryFee} onChange={e => { form.markChanged(); form.setCustomDeliveryFee(e.target.value); }} />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={styles.row}>
            <Input label="Pickup Date *" type="date" value={form.pickupDate} onChange={(e) => { form.markChanged(); form.setPickupDate(e.target.value); }} error={form.errors.pickupDate} fullWidth />
            <Input label="Pickup Time" type="time" value={form.pickupTime} onChange={(e) => { form.markChanged(); form.setPickupTime(e.target.value); }} fullWidth />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pickup Location</label>
            <select className={styles.select} value={form.pickupLocation} onChange={(e) => { form.markChanged(); form.setPickupLocation(e.target.value); }}>
              <option value="Main Store">Main Store</option>
              <option value="Warehouse">Warehouse</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
