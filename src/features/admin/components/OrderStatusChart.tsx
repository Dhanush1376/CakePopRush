import React, { useState, useEffect } from 'react';
import styles from './AdminComponents.module.css'
import { adminDashboardData } from '@/features/admin/api/adminDataProvider';
export function OrderStatusChart() {
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);

  useEffect(() => {
    adminDashboardData.getOrderStatusData().then(setOrderStatusData);
  }, []);

  if (orderStatusData.length === 0) return null;
  const total = orderStatusData.reduce((acc, curr) => acc + curr.value, 0)
  
  // Donut chart calculations
  const radius = 60
  const circumference = 2 * Math.PI * radius
  let currentOffset = 0

  return (
    <div className={styles.card} style={{ minHeight: '380px' }}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Order Status</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem' }}>
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <svg viewBox="0 0 160 160" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
            {orderStatusData.map((data, index) => {
              const strokeLength = (data.percentage / 100) * circumference
              // Small gap between segments
              const gap = 2
              const renderLength = Math.max(0, strokeLength - gap)
              
              const circle = (
                <circle
                  key={index}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={data.color}
                  strokeWidth="16"
                  strokeDasharray={`${renderLength} ${circumference - renderLength}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                />
              )
              currentOffset += strokeLength
              return circle
            })}
          </svg>
          
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-brown)', lineHeight: 1 }}>1,248</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Orders</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', padding: '0 1rem' }}>
          {orderStatusData.map((data, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: data.color }} />
                <span style={{ color: 'var(--admin-brown)' }}>{data.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-muted)' }}>
                <span>{data.value}</span>
                <span style={{ width: '35px', textAlign: 'right' }}>({data.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
