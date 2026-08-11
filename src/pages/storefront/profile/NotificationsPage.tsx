import React, { useState } from 'react'
import { ChevronLeft, MessageCircle, ShoppingBag, Gift, Smartphone, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './NotificationsPage.module.css'

interface Toggle {
  id: string
  label: string
  desc: string
  on: boolean
}

const GROUPS: { title: string; icon: React.ReactNode; items: Omit<Toggle, 'on'>[] }[] = [
  {
    title: 'Orders',
    icon: <ShoppingBag size={18} />,
    items: [
      { id: 'order_placed',    label: 'Order Placed',    desc: 'When your order is confirmed' },
      { id: 'order_shipped',   label: 'Order Shipped',   desc: 'When your order is on the way' },
      { id: 'order_delivered', label: 'Order Delivered', desc: 'When your order reaches you' },
    ],
  },
  {
    title: 'Offers & Deals',
    icon: <Gift size={18} />,
    items: [
      { id: 'promo',     label: 'Promotions',    desc: 'Exclusive deals and discount codes' },
      { id: 'flash',     label: 'Flash Sales',   desc: 'Limited-time offers on cake pops' },
      { id: 'birthday',  label: 'Birthday Treat',desc: 'Special offer on your birthday' },
    ],
  },
  {
    title: 'App',
    icon: <Smartphone size={18} />,
    items: [
      { id: 'reviews', label: 'Review Reminders', desc: 'Rate items after delivery' },
      { id: 'news',    label: 'App News',         desc: 'New features and updates' },
    ],
  },
]

export const NotificationsPage = () => {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    GROUPS.forEach(g => g.items.forEach(item => { init[item.id] = true }))
    init['news'] = false
    return init
  })

  const toggle = (id: string) =>
    setToggles(prev => ({ ...prev, [id]: !prev[id] }))

  const allOn = Object.values(toggles).every(Boolean)
  const toggleAll = () => {
    const next = !allOn
    setToggles(prev => Object.fromEntries(Object.keys(prev).map(k => [k, next])))
  }

  return (
    <div className={styles.modalContent}>
      {/* Master toggle */}
      <div className={styles.masterCard}>
        <div className={styles.masterLeft}>
          <span className={styles.masterIcon}><Bell size={24} strokeWidth={1.5} /></span>
          <div>
            <div className={styles.masterLabel}>All Notifications</div>
            <div className={styles.masterSub}>{allOn ? 'All enabled' : 'Some disabled'}</div>
          </div>
        </div>
        <button
          className={`${styles.toggleBtn} ${allOn ? styles.toggleOn : ''}`}
          onClick={toggleAll}
          aria-label="Toggle all"
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>

      <div className={styles.content}>
        {GROUPS.map(group => (
          <div key={group.title} className={styles.group}>
            <div className={styles.groupHeader}>
              <span>{group.icon}</span>
              <span className={styles.groupTitle}>{group.title}</span>
            </div>
            <div className={styles.groupList}>
              {group.items.map(item => (
                <div key={item.id} className={styles.row}>
                  <div className={styles.rowInfo}>
                    <span className={styles.rowLabel}>{item.label}</span>
                    <span className={styles.rowDesc}>{item.desc}</span>
                  </div>
                  <button
                    className={`${styles.toggleBtn} ${toggles[item.id] ? styles.toggleOn : ''}`}
                    onClick={() => toggle(item.id)}
                    aria-label={item.label}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
