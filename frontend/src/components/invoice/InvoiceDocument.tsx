import React from 'react';
import { InvoiceData } from '@/types/invoice';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Heart } from 'lucide-react';
import styles from './InvoiceDocument.module.css';

interface InvoiceDocumentProps {
  data: InvoiceData;
}

export function InvoiceDocument({ data }: InvoiceDocumentProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={styles.invoicePaper}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.businessInfo}>
            <div className={styles.businessName}>{data.business.name}</div>
            {data.business.address}<br />
            {data.business.cityStateZip}<br />
            {data.business.country}<br />
            Phone: {data.business.phone}<br />
            Email: {data.business.email}<br />
            Website: {data.business.website}<br />
            {data.business.gstin && `GSTIN: ${data.business.gstin}`}
          </div>
        </div>
        
        <div className={styles.titleArea}>
          <h1 className={styles.invoiceTitle}>INVOICE</h1>
          <div className={styles.metaGrid}>
            <span className={styles.metaLabel}>Invoice Number</span>
            <span className={styles.metaValue}>{data.invoiceNumber}</span>
            
            <span className={styles.metaLabel}>Order Number</span>
            <span className={styles.metaValue}>{data.orderNumber}</span>
            
            <span className={styles.metaLabel}>Invoice Date</span>
            <span className={styles.metaValue}>{data.invoiceDate}</span>
            
            <span className={styles.metaLabel}>Order Date</span>
            <span className={styles.metaValue}>{data.orderDate}</span>
          </div>
        </div>
      </div>

      {/* BILL TO / SHIP TO */}
      <div className={styles.addressSection}>
        {data.billingAddress && (
          <div className={styles.addressBlock}>
            <h3>BILL TO</h3>
            <div className={styles.addressContent}>
              <div className={styles.customerName}>{data.billingAddress.name}</div>
              {data.billingAddress.phone && <div>{data.billingAddress.phone}</div>}
              {data.billingAddress.email && <div>{data.billingAddress.email}</div>}
              <div style={{ marginTop: 2 }}>
                {data.billingAddress.street}<br />
                {data.billingAddress.city}, {data.billingAddress.state} {data.billingAddress.pincode}<br />
                {data.billingAddress.country && data.billingAddress.country}
              </div>
            </div>
          </div>
        )}

        <div className={styles.addressBlock}>
          <h3>{data.fulfillment.type === 'Pickup' ? 'PICKUP DETAILS' : 'SHIP TO'}</h3>
          <div className={styles.addressContent}>
            {data.fulfillment.type === 'Delivery' && data.shippingAddress ? (
              <>
                <div className={styles.customerName}>{data.shippingAddress.name}</div>
                {data.shippingAddress.phone && <div>{data.shippingAddress.phone}</div>}
                <div style={{ marginTop: 2 }}>
                  {data.shippingAddress.street}<br />
                  {data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.pincode}<br />
                  {data.shippingAddress.country && data.shippingAddress.country}
                </div>
              </>
            ) : (
              <>
                <div className={styles.customerName}>Pickup Location</div>
                <div>{data.business.name} Store</div>
                <div>{data.business.address}</div>
                <div style={{ marginTop: 2 }}>
                  <strong>Date:</strong> {data.fulfillment.date}<br />
                  {data.fulfillment.timeSlot && <><strong>Time:</strong> {data.fulfillment.timeSlot}</>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ORDER BAR */}
      {data.fulfillment.type === 'Delivery' && (
        <div className={styles.orderBar}>
          <div className={styles.orderBarItem}>
            <span className={styles.orderBarLabel}>DELIVERY DATE</span>
            <span className={styles.orderBarValue}>{data.fulfillment.date}</span>
          </div>
          {data.fulfillment.timeSlot && (
            <div className={styles.orderBarItem}>
              <span className={styles.orderBarLabel}>TIME SLOT</span>
              <span className={styles.orderBarValue}>{data.fulfillment.timeSlot}</span>
            </div>
          )}
          <div className={styles.orderBarItem}>
            <span className={styles.orderBarLabel}>PAYMENT METHOD</span>
            <span className={styles.orderBarValue}>{data.payment.method}</span>
          </div>
          <div className={styles.orderBarItem}>
            <span className={styles.orderBarLabel}>PAYMENT STATUS</span>
            <span className={styles.orderBarValue}>
              <span className={`${styles.badge} ${
                data.payment.status === 'Paid' ? styles.paid : 
                data.payment.status === 'Cancelled' ? styles.cancelled : styles.pending
              }`}>
                {data.payment.status}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ITEMS TABLE */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colItem}>ITEM</th>
              <th className={`${styles.center} ${styles.colSku}`}>SKU</th>
              <th className={`${styles.center} ${styles.colQty}`}>QTY</th>
              <th className={`${styles.right} ${styles.colPrice}`}>UNIT PRICE</th>
              <th className={`${styles.right} ${styles.colTotal}`}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td data-label="Item" className={styles.colItem}>
                  <div className={styles.itemName}>
                    {item.name}
                    {item.isCustom && <span className={styles.customBadge}>CUSTOM</span>}
                  </div>
                  {item.customDetails && <div className={styles.customDetails}>{item.customDetails}</div>}
                </td>
                <td data-label="SKU" className={`${styles.center} ${styles.colSku}`}>
                  <span className={styles.itemSku}>{item.sku || '—'}</span>
                </td>
                <td data-label="Qty" className={`${styles.center} ${styles.colQty}`}>{item.qty}</td>
                <td data-label="Unit Price" className={`${styles.right} ${styles.colPrice}`}>{formatCurrency(item.unitPrice)}</td>
                <td data-label="Total" className={`${styles.right} ${styles.colTotal}`} style={{ fontWeight: 600 }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
            {/* SUMMARY ROWS */}
            <tr className={styles.summaryRow}>
              <td colSpan={4} className={styles.right}>Subtotal</td>
              <td className={styles.right}>{formatCurrency(data.pricing.subtotal)}</td>
            </tr>
            {data.pricing.itemDiscount > 0 && (
              <tr className={styles.summaryRow}>
                <td colSpan={4} className={styles.right} style={{ color: '#0D9488' }}>Item Discounts</td>
                <td className={styles.right} style={{ color: '#0D9488' }}>−{formatCurrency(data.pricing.itemDiscount)}</td>
              </tr>
            )}
            {data.pricing.couponDiscount > 0 && (
              <tr className={styles.summaryRow}>
                <td colSpan={4} className={styles.right} style={{ color: '#0D9488' }}>Coupon ({data.coupon?.code || 'WELCOME50'})</td>
                <td className={styles.right} style={{ color: '#0D9488' }}>−{formatCurrency(data.pricing.couponDiscount)}</td>
              </tr>
            )}
            <tr className={styles.summaryRow}>
              <td colSpan={4} className={styles.right}>Tax</td>
              <td className={styles.right}>{formatCurrency(data.pricing.tax)}</td>
            </tr>
            <tr className={styles.summaryRow}>
              <td colSpan={4} className={styles.right}>Delivery</td>
              <td className={styles.right}>{formatCurrency(data.pricing.deliveryFee)}</td>
            </tr>
            <tr className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
              <td colSpan={4} className={`${styles.right} ${styles.grandTotalCell}`}>TOTAL</td>
              <td className={`${styles.right} ${styles.grandTotalCell}`}>{formatCurrency(data.pricing.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <div className={styles.thankYou}>
          <div className={styles.thankYouText}>
            Thank you for choosing {data.business.name}{' '}
            <Heart size={10} fill="currentColor" stroke="currentColor" style={{ display: 'inline-block', verticalAlign: '-1px' }} />
          </div>
          <div className={styles.contactInfo}>
            For questions about your order:<br />
            {data.business.email} | {data.business.phone}<br />
            {data.business.website}
          </div>
          <div className={styles.computerGenerated}>
            This is a computer-generated document and does not require a signature.
          </div>
          
          {/* BARCODE AT BOTTOM LEFT */}
          <div className={styles.barcodeBox}>
            <Barcode 
              value={data.barcodeValue || data.orderNumber} 
              width={0.95} 
              height={25} 
              fontSize={8.5} 
              displayValue={true} 
              background="transparent" 
              margin={0}
            />
          </div>
        </div>
        
        <div className={styles.qrCode}>
          <span className={styles.qrLabel}>SCAN TO VERIFY</span>
          <QRCodeSVG value={data.qrCodeUrl} size={60} level="M" />
        </div>
      </div>
    </div>
  );
}
