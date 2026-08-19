import React from 'react';
import { NewOrderFormProps } from './useNewOrderForm';
import styles from './AdminNewOrder.module.css';
import { OrderItem } from './types';

export function ReviewStep({ form }: NewOrderFormProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.cardHeader}>
        <h2 className={styles.sectionTitle}>Review Order</h2>
        <p className={styles.sectionSubtitle}>Check the order details before creating it.</p>
      </div>

      <div className={styles.reviewGrid}>
        {/* Customer */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <h3 className={styles.reviewCardTitle}>Customer</h3>
            <button className={styles.reviewEditBtn} onClick={() => form.jumpToStep(1)}>Edit</button>
          </div>
          <div className={styles.reviewContent}>
            <div style={{fontWeight: 600}}>{form.customerName || 'No Name Entered'}</div>
            <div>{form.customerPhone || 'No Phone'}</div>
            <div>{form.customerEmail}</div>
          </div>
        </div>

        {/* Delivery/Pickup */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <h3 className={styles.reviewCardTitle}>{form.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</h3>
            <button className={styles.reviewEditBtn} onClick={() => form.jumpToStep(3)}>Edit</button>
          </div>
          <div className={styles.reviewContent}>
            {form.fulfillmentType === 'delivery' ? (
              <>
                <div style={{fontWeight: 600}}>{form.deliveryDate ? `${form.deliveryDate} ${form.deliveryTime}` : 'No date set'}</div>
                <div>{form.address || 'No address'}</div>
                <div>{form.city} {form.state} {form.pinCode}</div>
              </>
            ) : (
              <>
                <div style={{fontWeight: 600}}>{form.pickupDate ? `${form.pickupDate} ${form.pickupTime}` : 'No date set'}</div>
                <div>{form.pickupLocation}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3 className={styles.reviewCardTitle}>Order Items</h3>
          <button className={styles.reviewEditBtn} onClick={() => form.jumpToStep(2)}>Edit</button>
        </div>
        <div className={styles.reviewItemsList}>
          {form.items.map((item: OrderItem) => (
            <div key={item.id} className={styles.reviewItem} style={{ alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', background: item.isCustom ? '#FDF2F8' : 'var(--color-surface-hover)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {item.isCustom ? 'CSTM' : 'Img'}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{fontWeight: 600}}>
                    {item.isCustom && <span className={styles.customBadge} style={{marginRight: '8px'}}>CUSTOM ORDER</span>}
                    {item.name} <span style={{color: 'var(--color-text-muted)', fontWeight: 400}}>× {item.quantity}</span>
                  </div>
                  {item.isCustom && (
                    <div style={{fontSize: '13px', color: 'var(--color-text-muted)'}}>
                      {item.notes && <div style={{marginBottom: '4px'}}>{item.notes}</div>}
                      {item.customization && Object.values(item.customization).some(Boolean) && (
                        <div style={{padding: '8px', background: '#F8FAFC', borderRadius: '4px', fontSize: '12px'}}>
                          {item.customization.flavor && <div><strong>Flavor:</strong> {item.customization.flavor}</div>}
                          {item.customization.size && <div><strong>Size:</strong> {item.customization.size}</div>}
                          {item.customization.message && <div><strong>Message:</strong> {item.customization.message}</div>}
                          {item.customization.design && <div><strong>Design:</strong> {item.customization.design}</div>}
                          {item.customization.instructions && <div><strong>Instr:</strong> {item.customization.instructions}</div>}
                        </div>
                      )}
                      {(item.internalNote || item.customerNote) && (
                        <div style={{marginTop: '4px', fontSize: '12px'}}>
                           {item.internalNote && <div><span style={{color: '#94A3B8'}}>Internal:</span> {item.internalNote}</div>}
                           {item.customerNote && <div><span style={{color: '#94A3B8'}}>Customer:</span> {item.customerNote}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span style={{fontWeight: 600, marginTop: '2px'}}>₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {form.items.length === 0 && <div style={{color: 'var(--color-text-muted)'}}>No items added.</div>}
        </div>
        <div style={{marginTop: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)'}}>
          Total items: {form.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)}
        </div>
      </div>

      {/* Payment */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <h3 className={styles.reviewCardTitle}>Payment</h3>
          <button className={styles.reviewEditBtn} onClick={() => form.jumpToStep(4)}>Edit</button>
        </div>
        <div className={styles.reviewContent}>
          <div style={{fontWeight: 600}}>{form.paymentMethod} · {form.paymentStatus}</div>
          <div style={{marginTop: 'var(--space-2)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px'}}>
            <span style={{color: 'var(--color-text-muted)'}}>Order Total</span>
            <span>₹{form.pricing.total.toFixed(2)}</span>
            <span style={{color: 'var(--color-text-muted)'}}>Paid</span>
            <span>₹{form.pricing.paid.toFixed(2)}</span>
            <span style={{color: 'var(--color-text-muted)'}}>Remaining</span>
            <span style={{fontWeight: 600}}>₹{form.pricing.remaining.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Final Breakdown */}
      <div className={styles.finalPriceBreakdown}>
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Subtotal</span>
          <span className={styles.pricingValue}>₹{form.pricing.subtotal.toFixed(2)}</span>
        </div>
        {form.pricing.discount > 0 && (
          <div className={styles.pricingRow}>
            <span className={styles.pricingLabel}>Discount</span>
            <span className={styles.pricingValue}>−₹{form.pricing.discount.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Tax (10%)</span>
          <span className={styles.pricingValue}>₹{form.pricing.tax.toFixed(2)}</span>
        </div>
        {form.fulfillmentType === 'delivery' && (
          <div className={styles.pricingRow}>
            <span className={styles.pricingLabel}>Delivery</span>
            <span className={styles.pricingValue}>₹{form.pricing.deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.divider} />
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>₹{form.pricing.total.toFixed(2)}</span>
        </div>
        <div className={styles.pricingRow} style={{marginTop: 'var(--space-2)'}}>
          <span className={styles.pricingLabel}>Paid</span>
          <span className={styles.pricingValue}>₹{form.pricing.paid.toFixed(2)}</span>
        </div>
        <div className={styles.pricingRow}>
          <span className={styles.pricingLabel}>Remaining</span>
          <span className={styles.pricingValue} style={{fontWeight: 600}}>₹{form.pricing.remaining.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
