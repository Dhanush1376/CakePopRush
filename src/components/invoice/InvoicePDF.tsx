import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { InvoiceData } from '@/types/invoice';

// Register Inter font if needed, otherwise fallback to standard Helvetica
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottom: '2pt solid #e5e7eb',
    paddingBottom: 16,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 48,
    marginRight: 16,
  },
  businessInfo: {
    color: '#6b7280',
    lineHeight: 1.2,
  },
  businessName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#111827',
    marginBottom: 4,
  },
  titleArea: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#F21B5B', // Admin Pink
    letterSpacing: 2,
    marginBottom: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 200,
    justifyContent: 'flex-end'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  metaLabel: {
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addressBlock: {
    width: '45%',
  },
  addressTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#6b7280',
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  addressContent: {
    lineHeight: 1.2,
  },
  customerName: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  orderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  orderBarItem: {
    flexDirection: 'column',
  },
  orderBarLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  orderBarValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  table: {
    width: '100%',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  th: {
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e5e7eb',
    paddingVertical: 8,
  },
  colItem: { width: '45%' },
  colSku: { width: '15%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTax: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  itemName: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  itemSku: {
    color: '#6b7280',
  },
  customDetails: {
    color: '#6b7280',
    fontSize: 8,
    marginTop: 4,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  paymentInfo: {
    width: '45%',
  },
  paymentBlock: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  paymentLabel: { color: '#6b7280' },
  paymentValue: { fontFamily: 'Helvetica-Bold' },
  totalsArea: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  grandTotal: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    borderTop: '2pt solid #111827',
    marginTop: 6,
    paddingTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 16,
  },
  thankYouText: {
    fontFamily: 'Helvetica-Bold',
    color: '#F21B5B',
    marginBottom: 8,
  },
  contactInfo: {
    color: '#6b7280',
    lineHeight: 1.5,
    fontSize: 9,
  },
  computerGenerated: {
    color: '#9ca3af',
    fontSize: 8,
    fontStyle: 'italic',
    marginTop: 16,
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  barcode: {
    width: 150,
    height: 40,
    marginTop: 16,
    alignSelf: 'flex-start',
  }
});

interface InvoicePDFProps {
  data: InvoiceData;
}

export function InvoicePDF({ data }: InvoicePDFProps) {
  const formatCurrency = (amount: number) => {
    return 'Rs. ' + new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoArea}>
            <View>
              <Text style={styles.businessName}>{data.business.name}</Text>
              <Text style={styles.businessInfo}>
                {data.business.address}{'\n'}
                {data.business.cityStateZip}{'\n'}
                {data.business.country}{'\n'}
                Phone: {data.business.phone}{'\n'}
                Email: {data.business.email}{'\n'}
                Website: {data.business.website}
                {data.business.gstin && `\nGSTIN: ${data.business.gstin}`}
              </Text>
            </View>
          </View>
          
          <View style={styles.titleArea}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice Number  </Text>
              <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order Number  </Text>
              <Text style={styles.metaValue}>{data.orderNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice Date  </Text>
              <Text style={styles.metaValue}>{data.invoiceDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order Date  </Text>
              <Text style={styles.metaValue}>{data.orderDate}</Text>
            </View>
          </View>
        </View>

        {/* BILL TO / SHIP TO */}
        <View style={styles.addressSection}>
          {data.billingAddress && (
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>BILL TO</Text>
              <Text style={styles.addressContent}>
                <Text style={styles.customerName}>{data.billingAddress.name}</Text>{'\n'}
                {data.billingAddress.phone}{'\n'}
                {data.billingAddress.email && <>{data.billingAddress.email}{'\n'}</>}
                {data.billingAddress.street}{'\n'}
                {data.billingAddress.city}, {data.billingAddress.state} {data.billingAddress.pincode}
              </Text>
            </View>
          )}

          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>
              {data.fulfillment.type === 'Pickup' ? 'PICKUP DETAILS' : 'SHIP TO'}
            </Text>
            <View style={styles.addressContent}>
              {data.fulfillment.type === 'Delivery' && data.shippingAddress ? (
                <Text style={styles.addressContent}>
                  <Text style={styles.customerName}>{data.shippingAddress.name}</Text>{'\n'}
                  {data.shippingAddress.phone}{'\n'}
                  {data.shippingAddress.email && <>{data.shippingAddress.email}{'\n'}</>}
                  {data.shippingAddress.street}{'\n'}
                  {data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.pincode}
                </Text>
              ) : (
                <Text style={styles.addressContent}>
                  <Text style={styles.customerName}>Pickup Location</Text>{'\n'}
                  {data.business.name} Store{'\n'}
                  {data.business.address}{'\n'}
                  Date: {data.fulfillment.date}
                  {data.fulfillment.timeSlot && `\nTime: ${data.fulfillment.timeSlot}`}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ORDER BAR */}
        {data.fulfillment.type === 'Delivery' && (
          <View style={styles.orderBar}>
            <View style={styles.orderBarItem}>
              <Text style={styles.orderBarLabel}>DELIVERY DATE</Text>
              <Text style={styles.orderBarValue}>{data.fulfillment.date}</Text>
            </View>
            {data.fulfillment.timeSlot && (
              <View style={styles.orderBarItem}>
                <Text style={styles.orderBarLabel}>TIME SLOT</Text>
                <Text style={styles.orderBarValue}>{data.fulfillment.timeSlot}</Text>
              </View>
            )}
            <View style={styles.orderBarItem}>
              <Text style={styles.orderBarLabel}>PAYMENT METHOD</Text>
              <Text style={styles.orderBarValue}>{data.payment.method}</Text>
            </View>
            <View style={styles.orderBarItem}>
              <Text style={styles.orderBarLabel}>PAYMENT STATUS</Text>
              <Text style={styles.orderBarValue}>{data.payment.status}</Text>
            </View>
          </View>
        )}

        {/* ITEMS TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colItem]}>ITEM</Text>
            <Text style={[styles.th, styles.colSku]}>SKU</Text>
            <Text style={[styles.th, styles.colQty]}>QTY</Text>
            <Text style={[styles.th, styles.colPrice]}>PRICE</Text>
            <Text style={[styles.th, styles.colTotal]}>TOTAL</Text>
          </View>

          {data.items.map((item) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <View style={styles.colItem}>
                <Text style={styles.itemName}>
                  {item.name} {item.isCustom ? '(CUSTOM)' : ''}
                </Text>
                {item.customDetails && <Text style={styles.customDetails}>{item.customDetails}</Text>}
              </View>
              <Text style={[styles.itemSku, styles.colSku]}>{item.sku || '—'}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.colTotal, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

          {/* SUMMARY ROWS */}
          <View style={[styles.tableRow, { borderBottom: 0, paddingVertical: 4, marginTop: 8 }]} wrap={false}>
            <View style={{ width: '70%' }} />
            <Text style={styles.colTax}>Subtotal</Text>
            <Text style={styles.colTotal}>{formatCurrency(data.pricing.subtotal)}</Text>
          </View>
          {data.pricing.itemDiscount > 0 && (
            <View style={[styles.tableRow, { borderBottom: 0, paddingVertical: 4 }]} wrap={false}>
              <View style={{ width: '70%' }} />
              <Text style={[styles.colTax, { color: '#059669' }]}>Item Discounts</Text>
              <Text style={[styles.colTotal, { color: '#059669' }]}>−{formatCurrency(data.pricing.itemDiscount)}</Text>
            </View>
          )}
          {data.pricing.couponDiscount > 0 && (
            <View style={[styles.tableRow, { borderBottom: 0, paddingVertical: 4 }]} wrap={false}>
              <View style={{ width: '70%' }} />
              <Text style={[styles.colTax, { color: '#059669' }]}>Coupon</Text>
              <Text style={[styles.colTotal, { color: '#059669' }]}>−{formatCurrency(data.pricing.couponDiscount)}</Text>
            </View>
          )}
          <View style={[styles.tableRow, { borderBottom: 0, paddingVertical: 4 }]} wrap={false}>
            <View style={{ width: '70%' }} />
            <Text style={styles.colTax}>Tax</Text>
            <Text style={styles.colTotal}>{formatCurrency(data.pricing.tax)}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottom: 0, paddingVertical: 4 }]} wrap={false}>
            <View style={{ width: '70%' }} />
            <Text style={styles.colTax}>Delivery</Text>
            <Text style={styles.colTotal}>{formatCurrency(data.pricing.deliveryFee)}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottom: 0, paddingVertical: 0 }]} wrap={false}>
            <View style={{ width: '70%' }} />
            <View style={{ width: '30%', borderTop: '2pt solid #111827', marginVertical: 8 }} />
          </View>
          <View style={[styles.tableRow, { borderBottom: 0, paddingVertical: 4 }]} wrap={false}>
            <View style={{ width: '70%' }} />
            <Text style={[styles.colTax, { fontFamily: 'Helvetica-Bold', fontSize: 12, color: '#111827' }]}>TOTAL</Text>
            <Text style={[styles.colTotal, { fontFamily: 'Helvetica-Bold', fontSize: 12, color: '#111827' }]}>{formatCurrency(data.pricing.total)}</Text>
          </View>

        {/* FOOTER */}
        <View style={styles.footer} wrap={false}>
          <View>
            <Text style={styles.thankYouText}>Thank you for choosing {data.business.name}</Text>
            <Text style={styles.contactInfo}>
              For questions about your order:{'\n'}
              {data.business.email} | {data.business.phone}{'\n'}
              {data.business.website}
            </Text>
            <Text style={styles.computerGenerated}>
              This is a computer-generated document and does not require a signature.
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 4 }}>SCAN TO VERIFY</Text>
            {/* Using an external QR generation API to embed in PDF */}
            <Image 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.qrCodeUrl)}`} 
              style={styles.qrCode} 
            />
          </View>
        </View>

        {/* BARCODE */}
        <Image 
          src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(data.barcodeValue)}&scale=3&height=10&includetext`} 
          style={styles.barcode} 
        />
        
      </Page>
    </Document>
  );
}
