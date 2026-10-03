import React from 'react'
import { Product } from '@/types/product'
import { formatCurrency } from '@/lib/formatters/currency'
import styles from './OrderSummary.module.css'
import { PDPState } from '../hooks/usePDPState'

interface OrderSummaryProps {
  product: Product
  state: PDPState
}

export const OrderSummary = ({ product, state }: OrderSummaryProps) => {
  const flavour = product.flavours?.find(f => f.id === state.selectedFlavourId)
  const quantity = product.quantities?.find(q => q.id === state.selectedQuantityId)
  
  const selectedAddOns = (product.addOns || []).filter(a => state.selectedAddOns.has(a.id))

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Order Summary</h3>
      
      <div className={styles.summaryBox}>
        <div className={styles.row}>
          <span className={styles.itemName}>Base Price</span>
          <span className={styles.itemPrice}>{formatCurrency(product.basePrice)}</span>
        </div>

        {flavour && flavour.priceModifier > 0 && (
          <div className={styles.row}>
            <span className={styles.itemName}>{flavour.name}</span>
            <span className={styles.itemPrice}>+{formatCurrency(flavour.priceModifier)}</span>
          </div>
        )}

        {quantity && quantity.priceModifier !== 0 && (
          <div className={styles.row}>
            <span className={styles.itemName}>{quantity.label} ({quantity.pieces}pcs)</span>
            <span className={styles.itemPrice}>
              {quantity.priceModifier > 0 ? '+' : ''}{formatCurrency(quantity.priceModifier)}
            </span>
          </div>
        )}

        {selectedAddOns.map(addon => (
          <div key={addon.id} className={styles.row}>
            <span className={styles.itemName}>{addon.name}</span>
            <span className={styles.itemPrice}>+{formatCurrency(addon.price)}</span>
          </div>
        ))}

        <div className={styles.divider} />

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalPrice}>{formatCurrency(state.calculatedTotal)}</span>
        </div>
      </div>
    </div>
  )
}
