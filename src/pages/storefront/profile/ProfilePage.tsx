import React from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  MapPin, Bell,
  Headphones, Info, FileText, Shield, LogOut, User
} from 'lucide-react'
import styles from './ProfilePage.module.css'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { MyDetailsPage } from './MyDetailsPage'
import { AddressesPage } from './AddressesPage'
import { NotificationsPage } from './NotificationsPage'
import { ProfileLayout } from '@/components/layout/ProfileLayout'

const MenuSection = ({ title, items }: { title: string, items: { icon: React.ReactNode, label: string, to?: string, onClick?: () => void }[] }) => (
  <section>
    <div className={styles.sectionTitleRow}>
      <h3 className={styles.sectionTitle}>{title}</h3>
    </div>
    <div className={styles.menuList}>
      {items.map((item, index) => (
        item.to ? (
          <Link key={index} to={item.to} className={styles.menuItem} style={{ textDecoration: 'none' }}>
            <div className={styles.menuIcon}>{item.icon}</div>
            <span className={styles.menuText}>{item.label}</span>
            <ChevronRight size={18} className={styles.menuChevron} />
          </Link>
        ) : (
          <div key={index} className={styles.menuItem} onClick={item.onClick} style={{ cursor: item.onClick ? 'pointer' : 'default' }}>
            <div className={styles.menuIcon}>{item.icon}</div>
            <span className={styles.menuText}>{item.label}</span>
            <ChevronRight size={18} className={styles.menuChevron} />
          </div>
        )
      ))}
    </div>
  </section>
)

export const ProfilePage = () => {
  const [activeModal, setActiveModal] = React.useState<'details' | 'addresses' | 'notifications' | null>(null)

  const accountItems = [
    { icon: <User size={20} strokeWidth={1.5} />, label: 'My Details', onClick: () => setActiveModal('details') },
    { icon: <MapPin size={20} strokeWidth={1.5} />, label: 'Addresses', onClick: () => setActiveModal('addresses') },
    { icon: <Bell size={20} strokeWidth={1.5} />, label: 'Notification Preferences', onClick: () => setActiveModal('notifications') },
  ]

  const moreItems = [
    { icon: <Headphones size={20} strokeWidth={1.5} />, label: 'Help & Support' },
    { icon: <Info size={20} strokeWidth={1.5} />, label: 'About CakePopRush' },
    { icon: <FileText size={20} strokeWidth={1.5} />, label: 'Terms & Conditions', to: '/terms' },
    { icon: <Shield size={20} strokeWidth={1.5} />, label: 'Privacy Policy', to: '/privacy' },
  ]

  return (
    <>
      <ProfileLayout isMobileStandalone={false} onEditProfile={() => setActiveModal('details')}>
        <MenuSection title="Account" items={accountItems} />
        <MenuSection title="More" items={moreItems} />

        <button className={styles.logoutButton}>
          <div className={styles.logoutLeft}>
            <LogOut size={20} strokeWidth={1.5} />
            <span className={styles.logoutText}>Log Out</span>
          </div>
          <ChevronRight size={18} className={styles.logoutChevron} />
        </button>
      </ProfileLayout>

      <ResponsiveModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal === 'details' ? 'My Details' : activeModal === 'addresses' ? 'Addresses' : activeModal === 'notifications' ? 'Notification Preferences' : ''}
      >
        {activeModal === 'details' && <MyDetailsPage />}
        {activeModal === 'addresses' && <AddressesPage />}
        {activeModal === 'notifications' && <NotificationsPage />}
      </ResponsiveModal>
    </>
  )
}

